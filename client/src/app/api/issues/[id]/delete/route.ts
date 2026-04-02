import { NextResponse } from 'next/server'

// This legacy route has been deprecated in favor of the custom backend.
// Frontend should call DELETE /api/issues/:id on the Express server directly.
export async function POST(req: Request) {
  const url = new URL(req.url)
  const parts = url.pathname.split('/')
  const issueId = parts[parts.indexOf('issues') + 1] || ''
  if (!issueId) {
    return NextResponse.json({ ok: false, error: 'Missing issue id' }, { status: 400 })
  }
  return NextResponse.json({ ok: false, error: 'This route is deprecated. Use backend API.' }, { status: 410 })
}
