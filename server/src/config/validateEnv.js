// Centralized environment variable validation and normalization
// Focus: security-critical, operational reliability, sane fallbacks with warnings.

import crypto from 'crypto'

// Helper to parse duration strings like 5s, 10m, 7d into ms; fallback provided
function parseDurationMs(v, fallback) {
  if (!v || typeof v !== 'string') return fallback
  const m = v.trim().match(/^(\d+)(ms|s|m|h|d)?$/i)
  if (!m) return fallback
  const n = Number(m[1])
  const unit = (m[2] || 'ms').toLowerCase()
  const mult = unit === 'd' ? 86400000 : unit === 'h' ? 3600000 : unit === 'm' ? 60000 : unit === 's' ? 1000 : 1
  return n * mult
}

export function validateEnv() {
  const problems = []
  const warnings = []
  const info = []

  // Required secrets
  const requiredSecrets = ['JWT_SECRET', 'JWT_REFRESH_SECRET']
  for (const key of requiredSecrets) {
    if (!process.env[key] || !String(process.env[key]).trim()) {
      problems.push(`Missing required secret ${key}`)
      console.error(`[FATAL] ${key} is not set. Application cannot start securely.`)
      process.exit(1)
    } else if (String(process.env[key]).length < 32) {
      console.error(`[FATAL] ${key} must be at least 32 characters for security. Current length: ${String(process.env[key]).length}`)
      process.exit(1)
    }
  }

  // Optional but recommended
  if (!process.env.REFRESH_TOKEN_HASH_SECRET) {
    warnings.push('REFRESH_TOKEN_HASH_SECRET missing (HMAC key); falling back could weaken hashing if default is used elsewhere.')
  } else if (process.env.REFRESH_TOKEN_HASH_SECRET && process.env.REFRESH_TOKEN_HASH_SECRET.length < 32) {
    warnings.push('REFRESH_TOKEN_HASH_SECRET should be >= 32 chars for HMAC-SHA256')
  }

  // Durations / numeric ranges
  const refreshTtlMs = parseDurationMs(process.env.JWT_REFRESH_EXPIRES_IN || '7d', 7 * 24 * 60 * 60 * 1000)
  if (refreshTtlMs < 24 * 60 * 60 * 1000) warnings.push('JWT_REFRESH_EXPIRES_IN is under 1 day; ensure this is intentional.')
  if (refreshTtlMs > 30 * 24 * 60 * 60 * 1000) warnings.push('JWT_REFRESH_EXPIRES_IN exceeds 30 days; consider reducing for security.')

  const graceMs = Number(process.env.REFRESH_GRACE_WINDOW_MS || 5000)
  if (graceMs < 1000) warnings.push('REFRESH_GRACE_WINDOW_MS < 1000ms may cause race-condition refresh failures.')
  if (graceMs > 20000) warnings.push('REFRESH_GRACE_WINDOW_MS > 20000ms increases reuse attack window.')

  const rotationsTtl = Number(process.env.REFRESH_RECENT_ROTATIONS_TTL_MS || 60000)
  if (rotationsTtl < graceMs) warnings.push('REFRESH_RECENT_ROTATIONS_TTL_MS is less than grace window; reuse detection coverage gap possible.')

  // Boolean flags normalization
  const boolFlags = ['REFRESH_REUSE_REVOKE_ALL']
  for (const f of boolFlags) {
    if (process.env[f]) {
      const val = process.env[f].toLowerCase()
      if (!['true', 'false', '0', '1'].includes(val)) warnings.push(`${f} has non-boolean value '${process.env[f]}'`)
    }
  }

  // Random runtime derived signals (non-persistent)
  if (!process.env.INSTANCE_ID) {
    process.env.INSTANCE_ID = crypto.randomBytes(6).toString('hex')
    info.push(`INSTANCE_ID generated at runtime = ${process.env.INSTANCE_ID}`)
  }

  const summary = { problems, warnings, info }
  if (problems.length) {
    console.error('[Env][FAIL] Critical environment validation problems:')
    for (const p of problems) console.error(' -', p)
  }
  if (warnings.length) {
    console.warn('[Env][WARN] Environment validation warnings:')
    for (const w of warnings) console.warn(' -', w)
  }
  for (const i of info) console.log('[Env][Info]', i)

  return summary
}
