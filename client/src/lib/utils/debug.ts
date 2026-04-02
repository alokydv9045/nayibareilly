export async function debugConnection() {
  // This helper previously probed Supabase. During migration, it simply no-ops.
  console.log('debugConnection: backend diagnostics moved to /diagnostic page and /health endpoint')
}
