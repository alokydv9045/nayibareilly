// Structured logging - uses Pino if available, falls back to console

const isProduction = process.env.NODE_ENV === 'production'
const level = process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug')

// Try to import Pino, fall back to console-based logger if not available
let pino, pinoHttp, context, trace, hasPino = false

try {
  const pinoModule = await import('pino')
  pino = pinoModule.default
  const pinoHttpModule = await import('pino-http')
  pinoHttp = pinoHttpModule.default
  const otelApi = await import('@opentelemetry/api')
  context = otelApi.context
  trace = otelApi.trace
  hasPino = true
} catch (error) {
  // Pino or OpenTelemetry not installed - use console fallback
  console.log('⚠️  Using console-based logger (install pino for production logging)')
}

// Simple console-based logger fallback
const createConsoleLogger = () => {
  const formatMessage = (level, message, ...args) => {
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`
    return [prefix, message, ...args]
  }

  return {
    info: (message, ...args) => console.log(...formatMessage('info', message, ...args)),
    warn: (message, ...args) => console.warn(...formatMessage('warn', message, ...args)),
    error: (message, ...args) => console.error(...formatMessage('error', message, ...args)),
    debug: (message, ...args) => level === 'debug' ? console.log(...formatMessage('debug', message, ...args)) : null,
    child: () => createConsoleLogger(), // Return new instance for child loggers
    flush: () => Promise.resolve()
  }
}

// Create logger based on availability
let logger, createHttpLogger, rawLogger

if (!hasPino) {
  // Use console logger
  logger = createConsoleLogger()
  createHttpLogger = () => (req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      logger.info(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`)
    })
    next()
  }
  rawLogger = logger
} else {
  // Use Pino logger
  const transport = undefined // Disabled to fix thread-stream crash on Node 24 Windows

  const baseLogger = pino({
    level,
    base: isProduction ? {
      service: process.env.OTEL_SERVICE_NAME || 'nagersetu-api',
      env: process.env.NODE_ENV || 'development'
    } : {},
  transport,
  // Performance optimizations
  formatters: {
    level: (label) => {
      return { level: label }
    }
  },
  // Reduce serialization overhead
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err
  }
})

const write = (levelName, message, meta) => {
  if (message instanceof Error) {
    baseLogger[levelName]({ err: message, ...(meta && !(meta instanceof Error) ? meta : {}) }, message.message)
    return
  }

  if (meta instanceof Error) {
    baseLogger[levelName]({ err: meta }, message)
    return
  }

  if (meta && typeof meta === 'object' && Object.keys(meta).length) {
    baseLogger[levelName](meta, message)
    return
  }

  baseLogger[levelName](message)
}

  logger = {
  info(message, meta) {
    write('info', message, meta)
  },
  warn(message, meta) {
    write('warn', message, meta)
  },
  error(message, meta) {
    write('error', message, meta)
  },
  debug(message, meta) {
    if (baseLogger.isLevelEnabled('debug')) {
      write('debug', message, meta)
    }
  },
  child(bindings = {}) {
    const child = baseLogger.child(bindings)
    return {
      info: (msg, meta) => child.info(meta && !(meta instanceof Error) ? meta : {}, msg),
      warn: (msg, meta) => child.warn(meta && !(meta instanceof Error) ? meta : {}, msg),
      error: (msg, meta) => {
        if (msg instanceof Error) {
          child.error({ err: msg, ...(meta && !(meta instanceof Error) ? meta : {}) }, msg.message)
        } else if (meta instanceof Error) {
          child.error({ err: meta }, msg)
        } else {
          child.error(meta && typeof meta === 'object' ? meta : {}, msg)
        }
      },
      debug: (msg, meta) => {
        if (child.isLevelEnabled('debug')) {
          child.debug(meta && typeof meta === 'object' ? meta : {}, msg)
        }
      }
    }
  },
  flush() {
    return baseLogger.flush?.()
  }
}

  createHttpLogger = () => pinoHttp({
  logger: baseLogger,
  // Optimize HTTP logging - only log important information
  autoLogging: {
    ignore: (req) => req.url === '/health' || req.url === '/health/live' || req.url === '/health/ready'
  },
  // Reduce serialization - only include essential data
  customSuccessMessage: (req, res) => {
    if (res.statusCode >= 400) {
      return `request failed`
    }
    // In development, use short message for successful requests
    if (!isProduction) {
      return `✓ ${req.method} ${req.url}`
    }
    return null // Don't log successful requests in production for performance
  },
  customErrorMessage: (req, res, err) => {
    return `✗ ${req.method} ${req.url} - ${err.message}`
  },
  // Only log slow requests or errors
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return 'error'
    if (res.statusCode >= 400) return 'warn'
    if (res.responseTime > 1000) return 'warn' // Log slow requests
    if (isProduction) return 'silent' // Skip successful fast requests in production
    return 'info'
  },
  // Reduce serialization overhead
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      // Only include headers and other details for errors or in debug mode
      ...(process.env.LOG_LEVEL === 'debug' && {
        id: req.id,
        headers: req.headers,
        query: req.query,
        params: req.params,
        remoteAddress: req.remoteAddress,
        remotePort: req.remotePort
      })
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      // Only include headers for errors or in debug mode
      ...(process.env.LOG_LEVEL === 'debug' && {
        headers: res.getHeaders?.() || res.headers
      })
    })
  },
  // Custom attributes to include
  customAttributeKeys: {
    req: 'req',
    res: 'res',
    err: 'err',
    responseTime: 'responseTime'
  }
})

  rawLogger = baseLogger
}

// Export at the end, outside conditional blocks
export { createHttpLogger, rawLogger, logger }
export default logger
