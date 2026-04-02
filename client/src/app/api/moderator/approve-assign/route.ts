import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/constants/config'

export async function POST(request: NextRequest) {
  try {
    // Forward the request to the real backend server
    const serverUrl = config.api.fullUrl || 'https://nayibareilly.onrender.com/api'
    const apiUrl = `${serverUrl}/api/v1/moderator/approve-assign`
    
    // Extract authorization header from the request
    const authHeader = request.headers.get('Authorization')
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    // Get request body
    const body = await request.json()
    
    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    
    if (!response.ok) {
      throw new Error(`Backend server responded with ${response.status}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error forwarding moderator approve-assign request:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to approve and assign issue'
    }, { status: 500 })
  }
}