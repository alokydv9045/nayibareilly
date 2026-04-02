import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function addGPSDataToExistingIssues() {
  console.log('🗺️ Adding GPS coordinates to existing issues...')
  
  // Bareilly GPS coordinates around different areas
  const locations = [
    { lat: 28.3670, lng: 79.4304, address: 'Civil Lines, Bareilly' },
    { lat: 28.3587, lng: 79.4364, address: 'Subhash Nagar, Bareilly' },
    { lat: 28.3615, lng: 79.4188, address: 'MG Road, Bareilly' },
    { lat: 28.3701, lng: 79.4256, address: 'Kargaina, Bareilly' },
    { lat: 28.3562, lng: 79.4411, address: 'Faridpur Colony, Bareilly' },
    { lat: 28.3634, lng: 79.4075, address: 'Izzat Nagar, Bareilly' },
    { lat: 28.3748, lng: 79.4321, address: 'Pilibhit Road, Bareilly' },
    { lat: 28.3523, lng: 79.4267, address: 'Nawabganj, Bareilly' },
    { lat: 28.3695, lng: 79.4189, address: 'Shahi Colony, Bareilly' },
    { lat: 28.3578, lng: 79.4298, address: 'Railway Station Area, Bareilly' }
  ]

  try {
    // Get all existing issues
    const issues = await prisma.issue.findMany({
      orderBy: { createdAt: 'asc' },
      take: 10
    })

    console.log(`Found ${issues.length} issues to update with GPS data`)

    // Update each issue with GPS coordinates
    for (let i = 0; i < issues.length && i < locations.length; i++) {
      const issue = issues[i]
      const location = locations[i]
      
      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          latitude: location.lat,
          longitude: location.lng,
          address: location.address,
          ward: `Ward ${Math.floor(Math.random() * 50) + 1}`,
          isPublic: true,
          isFlagged: false,
          isSpam: false,
          viewCount: Math.floor(Math.random() * 100) + 1
        }
      })

      console.log(`✅ Updated issue ${issue.reportId} with coordinates (${location.lat}, ${location.lng})`)
    }

    console.log('🎉 Successfully added GPS coordinates to all issues!')
    
    // Verify the update
    const updatedIssues = await prisma.issue.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null }
      },
      select: {
        reportId: true,
        title: true,
        latitude: true,
        longitude: true,
        address: true,
        ward: true
      }
    })

    console.log(`\n📊 Summary: ${updatedIssues.length} issues now have GPS coordinates`)
    console.log('Sample locations:')
    updatedIssues.slice(0, 3).forEach(issue => {
      console.log(`  - ${issue.reportId}: ${issue.title} at (${issue.latitude}, ${issue.longitude})`)
    })

  } catch (error) {
    console.error('❌ Error updating issues:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addGPSDataToExistingIssues()