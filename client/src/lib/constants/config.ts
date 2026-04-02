/**
 * Configuration re-export
 * This file maintains backward compatibility for imports that expect '@/lib/constants/config'
 */

export {
  config,
  getApiUrl,
  getSocketUrl,
  isFeatureEnabled,
  getApiEndpoint,
  logConfig,
  type Config,
  type ApiConfig,
  type SocketConfig,
  type FeatureFlags
} from './app.config'

// Default export
export { default } from './app.config'