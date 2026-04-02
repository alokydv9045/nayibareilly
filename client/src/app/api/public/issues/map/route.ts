import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    // Forward request to backend API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001/api'
    
    const response = await fetch(`${apiUrl}/v1/public/issues/map`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.statusText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching public map data:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch map data',
        issues: []
      },
      { status: 500 }
    )
  }
}