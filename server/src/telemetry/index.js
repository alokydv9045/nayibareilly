import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import pkg from '@opentelemetry/exporter-metrics-otlp-http';
const { OTLPMetricsExporter } = pkg;
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { PrismaInstrumentation } from '@prisma/instrumentation'
import logger from '../utils/logger.js'

let sdk = null
let telemetryConfigured = false

const parseHeaders = (value) => {
  if (!value) return {}
  return value
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .reduce((acc, pair) => {
      const separatorIndex = pair.indexOf('=')
      if (separatorIndex === -1) return acc
      const key = pair.slice(0, separatorIndex).trim()
      const val = pair.slice(separatorIndex + 1).trim()
      if (key) acc[key] = val
      return acc
    }, {})
}

const mergeResourceAttribute = (key, value) => {
  if (!key || value === undefined || value === null) return
  const existing = process.env.OTEL_RESOURCE_ATTRIBUTES
  const attributes = existing
    ? existing
        .split(',')
        .map((pair) => pair.trim())
        .filter(Boolean)
        .reduce((acc, item) => {
          const [attrKey, attrValue] = item.split('=')
          if (attrKey) acc[attrKey.trim()] = attrValue?.trim()
          return acc
        }, {})
    : {}
  attributes[key] = String(value)
  process.env.OTEL_RESOURCE_ATTRIBUTES = Object.entries(attributes)
    .map(([attrKey, attrValue]) => `${attrKey}=${attrValue}`)
    .join(',')
}

export const startTelemetry = async ({ serviceVersion } = {}) => {
  if (sdk || telemetryConfigured) {
    return sdk
  }

  if (process.env.ENABLE_TELEMETRY === 'false' || process.env.NODE_ENV === 'test') {
    telemetryConfigured = true
    logger.info('Telemetry disabled via configuration')
    return null
  }

  telemetryConfigured = true

  if (process.env.OTEL_DEBUG === 'true') {
    diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG)
  }

  if (!process.env.OTEL_SERVICE_NAME) {
    process.env.OTEL_SERVICE_NAME = 'nagersetu-api'
  }

  if (serviceVersion) {
    mergeResourceAttribute('service.version', serviceVersion)
  }

  if (process.env.NODE_ENV) {
    mergeResourceAttribute('deployment.environment', process.env.NODE_ENV)
  }

  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT
    ? process.env.OTEL_EXPORTER_OTLP_ENDPOINT.trim().replace(/\/$/, '')
    : undefined

  const headers = parseHeaders(process.env.OTEL_EXPORTER_OTLP_HEADERS)

  const traceExporterOptions = {}
  if (endpoint) {
    traceExporterOptions.url = `${endpoint}/v1/traces`
  }
  if (Object.keys(headers).length) {
    traceExporterOptions.headers = headers
  }

  const traceExporter = new OTLPTraceExporter(traceExporterOptions)

  const enableMetrics = process.env.OTEL_METRICS_ENABLED === 'true'
  let metricReader

  if (enableMetrics) {
    try {
      const metricsOptions = {}
      if (endpoint) {
        metricsOptions.url = `${endpoint}/v1/metrics`
      }
      if (Object.keys(headers).length) {
        metricsOptions.headers = headers
      }
      const exportInterval = Number(process.env.OTEL_METRICS_EXPORT_INTERVAL_MS) || 60000
      metricReader = new PeriodicExportingMetricReader({
        exporter: new OTLPMetricsExporter(metricsOptions),
        exportIntervalMillis: exportInterval
      })
    } catch (error) {
      logger.error('Failed to initialize OTLP metrics exporter', error)
    }
  }

  const instrumentations = [
    getNodeAutoInstrumentations({
      // Disable HTTP instrumentation to avoid conflict with pino-http
      '@opentelemetry/instrumentation-http': {
        enabled: false
      },
      '@opentelemetry/instrumentation-express': { enabled: true },
      '@opentelemetry/instrumentation-fs': { enabled: false }
    }),
    new PrismaInstrumentation()
  ]

  sdk = new NodeSDK({
    traceExporter,
    instrumentations,
    ...(metricReader ? { metricReader } : {})
  })

  try {
    await sdk.start()
    logger.info('Telemetry initialized', {
      exporter: endpoint || 'default',
      metricsEnabled: enableMetrics
    })
  } catch (error) {
    logger.error('Telemetry initialization failed', error)
    sdk = null
  }

  return sdk
}

export const shutdownTelemetry = async () => {
  if (!sdk) return
  try {
    await sdk.shutdown()
    logger.info('Telemetry shutdown complete')
  } catch (error) {
    logger.error('Telemetry shutdown failed', error)
  } finally {
    sdk = null
  }
}

export default {
  startTelemetry,
  shutdownTelemetry
}
