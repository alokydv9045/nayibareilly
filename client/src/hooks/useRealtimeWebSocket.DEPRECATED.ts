/**
 * Unified Realtime Hook
 * Supports both Server-Sent Events (SSE) and WebSocket transports
 * 
 * Note: The main implementation is in useRealtime.ts
 * This file serves as documentation for the deprecated useWebSocket hook.
 * 
 * @deprecated Use useRealtime with transport='websocket' instead
 * 
 * Migration Guide:
 * ================
 * 
 * Old code:
 * ```tsx
 * import { useWebSocket } from '@/hooks/features/useRealtime'
 * 
 * const { connect, disconnect } = useWebSocket({
 *   issueId: '123',
 *   onEvent: handleEvent
 * })
 * ```
 * 
 * New code:
 * ```tsx
 * import { useRealtime } from '@/hooks/features/useRealtime'
 * 
 * const { connect, disconnect } = useRealtime({
 *   issueId: '123',
 *   onEvent: handleEvent,
 *   transport: 'websocket' // Specify WebSocket transport
 * })
 * ```
 * 
 * Default transport is 'sse' (Server-Sent Events)
 * Use transport='websocket' for bidirectional communication needs
 */

export const REALTIME_MIGRATION_GUIDE = {
  version: '2.0',
  deprecatedFunction: 'useWebSocket',
  replacementFunction: 'useRealtime',
  transportOption: 'websocket',
  defaultTransport: 'sse',
  
  benefits: [
    'Single implementation reduces code duplication',
    'Easier maintenance and bug fixes',
    'Consistent API across both transports',
    'Better performance monitoring',
    'Centralized error handling'
  ],
  
  breakingChanges: [
    'useWebSocket function removed',
    'Must specify transport="websocket" for WebSocket connections',
    'Default transport changed from WebSocket to SSE'
  ]
}

export default REALTIME_MIGRATION_GUIDE