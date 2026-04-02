import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/constants/config'

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the real backend server
    const serverUrl = config.api.fullUrl || 'https://nayibareilly.onrender.com/api'
    const apiUrl = `${serverUrl}/api/v1/issues/my-issues`
    
    // Extract authorization header from the request
    const authHeader = request.headers.get('Authorization')
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      throw new Error(`Backend server responded with ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error forwarding my-issues request:', error)
    
    // Return empty array on error to prevent app crash
    return NextResponse.json({
      success: true,
      data: {
        items: []
      }
    })
  }
}
