import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/constants/config'

export async function GET(request: NextRequest) {
  try {
    // Get auth token from headers
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🔄 [API] Forwarding super-admin stats request to server...')
    
    // Forward to real server
    const serverUrl = config.api.fullUrl.replace(/\/$/, '')
    const response = await fetch(`${serverUrl}/admin/super-admin/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ [API] Super-admin stats forwarded successfully')
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ [API] Error forwarding super admin stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
