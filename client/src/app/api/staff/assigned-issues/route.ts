import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/constants/config'

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the real backend server
    const serverUrl = config.api.fullUrl || 'https://nayibareilly.onrender.com/api'
    const apiUrl = `${serverUrl}/api/v1/issues/my-assigned`
    
    // Extract authorization header from the request
    const authHeader = request.headers.get('Authorization')
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    console.log('ðŸ”„ [API] Forwarding staff assigned-issues request to server...')
    
    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`Backend server responded with ${response.status}`)
    }
    
    const data = await response.json()
    console.log('âœ… [API] Staff assigned-issues forwarded successfully')
    
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('âŒ [API] Error forwarding staff assigned-issues request:', error)
    
    // Return empty array on error to prevent app crash
    return NextResponse.json({
      success: true,
      data: {
        items: []
      }
    })
  }
}