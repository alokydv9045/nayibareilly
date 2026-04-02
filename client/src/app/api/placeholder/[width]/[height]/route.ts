import { NextResponse } from 'next/server'

export async function GET(_req: Request, ctx: { params: Promise<{ width?: string; height?: string }> }) {
  const { width, height } = await ctx.params
  const w = Math.max(1, parseInt(width || '300', 10))
  const h = Math.max(1, parseInt(height || '150', 10))
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial, sans-serif" font-size="14">${w}×${h}</text>
  <rect x="0" y="0" width="100%" height="100%" fill="none" stroke="#e5e7eb"/>
</svg>`
  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, immutable'
    }
  })
}
