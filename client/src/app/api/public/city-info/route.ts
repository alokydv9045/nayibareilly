import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    // Static city information for public display
    const cityInfo = {
      name: 'Nayibareilly',
      population: 856409,
      area: 264.4,
      wards: 50,
      mayorName: 'Shri Rajesh Kumar Singh',
      establishedYear: 1857,
      coordinates: {
        center: { lat: 28.6139, lng: 77.209 },
        bounds: {
          north: 28.7,
          south: 28.5,
          east: 77.3,
          west: 77.1
        }
      },
      description: 'Nayibareilly is a vibrant city committed to citizen welfare and transparent governance.',
      website: 'https://nayibareilly.gov.in',
      emergencyNumbers: {
        police: '100',
        fire: '101',
        ambulance: '102',
        municipal: '1800-180-1800'
      },
      departments: [
        'Public Works Department',
        'Water Supply Department',
        'Electricity Department',
        'Sanitation Department',
        'Transport Department',
        'Health Department'
      ],
      statistics: {
        totalIssuesResolved: 12547,
        averageResolutionTime: '3.2 days',
        citizenSatisfactionRate: '87%',
        ongoingProjects: 45
      }
    }

    return NextResponse.json({
      success: true,
      city: cityInfo,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching city information:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch city information',
        city: null
      },
      { status: 500 }
    )
  }
}