import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/constants/config'

export async function GET(request: NextRequest) {
  try {
    // Forward the request to the real backend server
    const serverUrl = config.api.fullUrl || 'https://nayibareilly.onrender.com/api'
    const searchParams = request.nextUrl.searchParams
    const queryString = searchParams.toString()
    // Remove /api from serverUrl if it exists and add the correct path
    const baseUrl = serverUrl.replace(/\/api$/, '')
    const apiUrl = `${baseUrl}/api/v1/moderator/pending${queryString ? `?${queryString}` : ''}`
    
    // Extract authorization header from the request
    const authHeader = request.headers.get('Authorization')
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    console.log('[API Route] Forwarding to:', apiUrl)
    console.log('[API Route] Headers:', headers)
    
    // Forward the request to the backend
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      console.error('[API Route] Backend error:', response.status, response.statusText)
      throw new Error(`Backend server responded with ${response.status}`)
    }
    
    const data = await response.json()
    console.log('[API Route] Backend response:', data)
    return NextResponse.json(data)
    
  } catch (error) {
    console.error('Error forwarding moderator pending request:', error)
    
    // Return empty array on error to prevent app crash
    return NextResponse.json({
      success: true,
      data: {
        items: []
      }
    })
  }
}