import './config/loadEnv.js'
import * as Sentry from '@sentry/node'

// Initialize Sentry early
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 1.0,
  });
}

import cluster from 'cluster'
import 'express-async-errors'
import os from 'os'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import logger, { createHttpLogger } from './utils/logger.js'

// Optional telemetry - only import if dependencies are installed
let startTelemetry = null
let shutdownTelemetry = null
try {
  const telemetry = await import('./telemetry/index.js')
  startTelemetry = telemetry.startTelemetry
  shutdownTelemetry = telemetry.shutdownTelemetry
} catch (error) {
  logger.info('Telemetry disabled: OpenTelemetry packages not installed')
}

const numCPUs = os.cpus().length
// Limit workers for low-memory environments (Render free tier has 512MB)
// Use 1 worker in production to avoid OOM, or allow override via env var
const maxWorkers = process.env.NODE_ENV === 'production' 
  ? parseInt(process.env.MAX_WORKERS || '1', 10) 
  : Math.min(numCPUs, 4) // Max 4 in development

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let API_VERSION = '0.0.0'
try {
  const pkgPath = path.join(__dirname, '../package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  API_VERSION = pkg.version || API_VERSION
} catch (error) {
  logger.warn('Unable to resolve API version from package.json', { error: error.message })
}

// Skip clustering if disabled for development
const disableClustering = process.env.DISABLE_CLUSTERING === 'true'

if (!disableClustering && cluster.isPrimary) {
  console.log(`🚀 Nayibareilly API Server starting...`)

  // Run database migrations once in the primary process before forking workers.
  // This ensures the schema (users table etc.) is present when workers start.
  // Note: Disabled automatic migrations in code to prevent startup failures on existing databases.
  console.log('📦 Database check bypassed in code (run migrations manually if needed).')

  for (let i = 0; i < maxWorkers; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log('🔄 Worker restarted')
    cluster.fork()
  })
} else if (disableClustering || !cluster.isPrimary) {
  // Handle both non-clustered mode and worker processes
  // Parallelize critical imports for faster startup
  const [
    { default: API_VERSION_telemetry },
    { default: http },
    { default: express },
    { default: helmet },
    { default: cors },
    { default: compression },
    { default: cookieParser },
    { Server: SocketIOServer },
    { createAdapter },
    { default: redisClient },
    { default: prisma },
    { errorHandler, notFound },
    { globalRateLimit },
    { validateEnv }
  ] = await Promise.all([
    startTelemetry ? startTelemetry({ serviceVersion: API_VERSION }).then(() => ({ default: API_VERSION })) : Promise.resolve({ default: API_VERSION }),
    import('http'),
    import('express'),
    import('helmet'),
    import('cors'),
    import('compression'),
    import('cookie-parser'),
    import('socket.io'),
    import('@socket.io/redis-adapter'),
    import('./config/redis.js'),
    import('./config/prisma.js'),
    import('./middlewares/error.js'),
    import('./middlewares/rateLimit.js'),
    import('./config/validateEnv.js')
  ])

  // Load v1 routes (enterprise structure)
  const [
    { default: v1Routes },
    { default: healthRoutes },
    { default: publicRoutes }
  ] = await Promise.all([
    import('./routes/v1/index.js'),
    import('./routes/v1/health/index.js'),
    import('./routes/v1/public/index.js')
  ])

  // Import enhanced middleware
  const [
    { metricsMiddleware },
    { ddosProtection }
  ] = await Promise.all([
    import('./middlewares/monitoring/metrics.js'),
    import('./middlewares/security/ddos.js')
  ])

  const app = express()
  const server = http.createServer(app)

  // Initialize Socket.IO for real-time notifications (returns io instance)
  const { initializeSocketIO, getIO } = await import('./config/socket.js')
  const io = initializeSocketIO(server, {
    cors: {
      origin: (process.env.CLIENT_ORIGIN || 'http://localhost:3000,http://localhost:3001,http://localhost:3002').split(',').map(o => o.trim()),
      credentials: true,
    }
  })

  app.set('trust proxy', 1)

  app.use(createHttpLogger())

  const clientOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:3000,http://localhost:3001,http://localhost:3002')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const storageOrigins = (process.env.STORAGE_CDN_BASE_URL || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => {
      try {
        return new URL(value).origin
      } catch (error) {
        logger.warn('Invalid storage CDN URL', { value, error: error.message })
        return null
      }
    })
    .filter(Boolean)

  // Add Cloudinary origins if configured
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    storageOrigins.push(`https://res.cloudinary.com`)
  }

  // Configure Redis adapter if available
  const redisEnabled = Boolean(redisClient)
  if (redisClient) {
    try {
      const subClient = redisClient.duplicate()
      io.adapter(createAdapter(redisClient, subClient))
      logger.info('Redis adapter enabled for Socket.IO', { pid: process.pid })
    } catch (error) {
      logger.warn('Failed to enable Redis adapter for Socket.IO', error)
    }
  } else {
    logger.info('Redis adapter disabled for Socket.IO - no Redis client available', { pid: process.pid })
  }

  app.set('io', io)

  logger.info('Worker boot configuration', {
    pid: process.pid,
    nodeEnv: process.env.NODE_ENV,
    clientOrigin: process.env.CLIENT_ORIGIN,
    port: process.env.PORT,
    databaseConfigured: Boolean(process.env.DATABASE_URL)
  })

  const envResult = validateEnv()
  if (envResult.problems?.length) {
    logger.warn('Environment validation reported potential issues', { problems: envResult.problems })
  }

  // Optimize CSP directives - build only once
  const cspDirectives = {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
    styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
    imgSrc: ["'self'", 'data:', 'https:', 'blob:', 'https://res.cloudinary.com', ...storageOrigins],
  connectSrc: ["'self'", ...clientOrigins, 'https://res.cloudinary.com', ...storageOrigins],
    fontSrc: ["'self'", 'https://fonts.gstatic.com'],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'", 'blob:', 'https://res.cloudinary.com'],
    frameSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    ...(process.env.NODE_ENV === 'production' && { upgradeInsecureRequests: [] })
  }

  // Apply security middleware with optimized settings
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      directives: cspDirectives,
      reportOnly: false
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }))

  if (process.env.SERVE_LEGACY_UPLOADS === 'true') {
    app.use('/uploads', express.static(path.join(__dirname, '../../uploads'), {
      etag: true,
      lastModified: true,
      maxAge: '7d',
      immutable: false
    }))
  }

  app.use(cors({
    origin: clientOrigins.length ? clientOrigins : true,
    credentials: true
  }))

  app.use(globalRateLimit)

  // Add DDoS protection
  app.use(ddosProtection())

  // Add performance metrics tracking
  app.use(metricsMiddleware())

  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))
  app.use(cookieParser())
  
  // Optimize compression - only compress responses > 1kb
  app.use(compression({
    threshold: 1024, // Only compress responses larger than 1kb
    level: 6, // Balance between speed and compression ratio
    filter: (req, res) => {
      // Don't compress if client doesn't support it
      if (req.headers['x-no-compression']) {
        return false
      }
      // Use default compression filter
      return compression.filter(req, res)
    }
  }))

  // Optimized health check endpoints
  app.get('/health', async (_req, res) => {
    let pgOk = false
    try {
      await prisma.$queryRaw`SELECT 1`
      pgOk = true
    } catch (error) {
      logger.warn('Health check database probe failed', error)
    }
    res.json({ ok: true, time: new Date().toISOString(), postgres: pgOk, version: API_VERSION, worker: process.pid })
  })

  app.get('/health/live', (_req, res) => {
    res.json({ ok: true })
  })

  app.get('/health/ready', async (_req, res) => {
    let pgOk = false
    try {
      await prisma.$queryRaw`SELECT 1`
      pgOk = true
    } catch (error) {
      logger.warn('Readiness check database probe failed', error)
    }
    res.status(pgOk ? 200 : 503).json({ ok: pgOk, postgres: pgOk })
  })

  // API health check (for Render and other monitoring services)
  app.get('/api/health', async (_req, res) => {
    let pgOk = false
    try {
      await prisma.$queryRaw`SELECT 1`
      pgOk = true
    } catch (error) {
      logger.warn('API health check database probe failed', error)
    }
    res.json({ 
      ok: true, 
      status: 'healthy',
      timestamp: new Date().toISOString(), 
      database: pgOk ? 'connected' : 'disconnected',
      redis: redisEnabled ? 'enabled' : 'disabled',
      version: API_VERSION, 
      worker: process.pid 
    })
  })

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      message: '🚀 NayiBareilly API Server',
      status: 'running',
      version: API_VERSION,
      timestamp: new Date().toISOString(),
      endpoints: {
        health: '/api/health',
        documentation: '/api/docs',
        admin_setup: '/api/setup/admin'
      }
    })
  })

  // Mount v1 API routes (enterprise structure)
  app.use('/api/v1', v1Routes)
  app.use('/api/v1/health', healthRoutes)

  // Backward compatibility: Mount public routes directly at /api/public
  app.use('/api/public', publicRoutes)

  // Special case: Make categories available publicly at /api/issues/categories
  // This needs to be defined BEFORE the general issues routes to avoid being overridden
  app.get('/api/issues/categories', async (req, res, next) => {
    try {
      // Import the controller function
      const { getPublicCategories } = await import('./controllers/public.controller.js')
      await getPublicCategories(req, res)
    } catch (error) {
      next(error)
    }
  })

  // Backward compatibility: Map frontend expected endpoints to v1 routes
  // Mount the entire v1 router at /api so legacy endpoints like /api/auth work without hacks
  app.use('/api', v1Routes)



  app.use(notFound)
  app.use(errorHandler)

  const port = Number(process.env.PORT || 4001)

  server.listen(port, () => {
    console.log(`🌐 Server running at http://localhost:${port}`)
    console.log(`📱 WebSocket ready for real-time updates`)
  })

  // Socket.IO event handlers are now in config/socket.js via initializeSocketIO
  // No need for duplicate handlers here

  // Robust graceful shutdown with de-duplication and awaited disconnects
  let shuttingDown = false

  const closeServer = () => new Promise((resolve) => {
    try {
      server.close((err) => {
        if (err) {
          logger.warn('Error closing HTTP server', { err, pid: process.pid })
          return resolve({ err })
        }
        return resolve()
      })
    } catch (err) {
      logger.warn('Exception while calling server.close', { err, pid: process.pid })
      return resolve({ err })
    }
  })

  const closeIO = () => new Promise((resolve) => {
    try {
      // Socket.IO close accepts a callback; wrap it so we can await
      io.close(() => resolve())
    } catch (err) {
      logger.warn('Error closing Socket.IO', { err, pid: process.pid })
      return resolve()
    }
  })

  const gracefulShutdown = async (signal, reason) => {
    if (shuttingDown) {
      logger.warn('Shutdown already in progress, ignoring duplicate signal', { signal, pid: process.pid })
      return
    }
    shuttingDown = true

    logger.warn('Initiating graceful shutdown', { pid: process.pid, signal, reason })

    // Force exit if shutdown doesn't complete within timeout
    const timeoutMs = Number(process.env.SHUTDOWN_TIMEOUT_MS || '15000')
    const forced = setTimeout(() => {
      logger.error('Forced shutdown after timeout', { pid: process.pid, timeoutMs })
      // Use exit code 1 for abnormal termination
      process.exit(1)
    }, timeoutMs)

    try {
      await closeServer()
      logger.info('HTTP server closed', { pid: process.pid })

      try {
        await prisma.$disconnect()
        logger.info('Prisma disconnected', { pid: process.pid })
      } catch (err) {
        logger.warn('Error disconnecting Prisma', { err, pid: process.pid })
      }

      try {
        await closeIO()
        logger.info('Socket.IO closed', { pid: process.pid })
      } catch (err) {
        logger.warn('Error closing Socket.IO', { err, pid: process.pid })
      }

      try {
        if (shutdownTelemetry) {
          await shutdownTelemetry()
        }
      } catch (err) {
        logger.warn('Error shutting down telemetry', { err, pid: process.pid })
      }

      clearTimeout(forced)
      logger.info('Graceful shutdown complete', { pid: process.pid })
      process.exit(0)
    } catch (error) {
      clearTimeout(forced)
      logger.error('Error during graceful shutdown', { error, pid: process.pid })
      process.exit(1)
    }
  }

  process.on('SIGINT', () => gracefulShutdown('SIGINT'))
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))

  process.on('uncaughtException', (error) => {
    // Log stack and message separately to ensure structured logger captures both
    console.error('[FATAL] Uncaught exception:', error?.message)
    console.error('[FATAL] Stack trace:', error?.stack || String(error))
    logger.error('Uncaught exception', { message: error?.message, stack: error?.stack || String(error), pid: process.pid })
    // Defer shutdown to allow event loop to flush logs
    setImmediate(() => gracefulShutdown('uncaughtException', error?.message))
  })

  process.on('unhandledRejection', (reason, promise) => {
    const info = {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
      pid: process.pid
    }
    console.error('[FATAL] Unhandled promise rejection:', info.reason)
    if (info.stack) {
      console.error('[FATAL] Stack trace:', info.stack)
    }
    logger.error('Unhandled promise rejection', info)
    setImmediate(() => gracefulShutdown('unhandledRejection', info.reason))
  })

  console.log('✅ Nayibareilly API Server ready')
}

