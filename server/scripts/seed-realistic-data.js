import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function hashPassword(password) {
  return await bcrypt.hash(password, 10)
}

// Helper function to generate random dates within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to get a random item from array
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)]
}

async function main() {
  console.log('🌱 Starting realistic database seeding...')

  // Clear existing data
  console.log('🧹 Clearing existing data...')
  await prisma.notification.deleteMany()
  await prisma.refreshToken.deleteMany()
  await prisma.activityLog.deleteMany()
  await prisma.vote.deleteMany()
  await prisma.issueTimeline.deleteMany()
  await prisma.issueComment.deleteMany()
  await prisma.issueMedia.deleteMany()
  await prisma.issue.deleteMany()
  await prisma.issueCategory.deleteMany()
  await prisma.user.deleteMany()
  await prisma.department.deleteMany()

  const passwordHash = await hashPassword('Admin@123')

  // 1. Create Departments
  console.log('🏢 Creating departments...')
  const departments = await Promise.all([
    prisma.department.create({
      data: {
        name: 'Public Works Department',
        description: 'Road maintenance, construction, and infrastructure development',
        code: 'PWD',
        contactEmail: 'pwd@nayibareilly.gov.in',
        contactPhone: '+91-581-2234567',
        slaHours: 72,
        priority: 1,
        budget: 15000000
      }
    }),
    prisma.department.create({
      data: {
        name: 'Water Supply & Sewerage',
        description: 'Water supply, drainage, and sewage management services',
        code: 'WATER',
        contactEmail: 'water@nayibareilly.gov.in',
        contactPhone: '+91-581-2234568',
        slaHours: 48,
        priority: 2,
        budget: 8000000
      }
    }),
    prisma.department.create({
      data: {
        name: 'Solid Waste Management',
        description: 'Garbage collection, disposal, and waste management',
        code: 'SWM',
        contactEmail: 'swm@nayibareilly.gov.in',
        contactPhone: '+91-581-2234569',
        slaHours: 24,
        priority: 3,
        budget: 6000000
      }
    }),
    prisma.department.create({
      data: {
        name: 'Traffic Police',
        description: 'Traffic management, parking, and road safety',
        code: 'TRAFFIC',
        contactEmail: 'traffic@nayibareilly.gov.in',
        contactPhone: '+91-581-2234570',
        slaHours: 12,
        priority: 4,
        budget: 4000000
      }
    }),
    prisma.department.create({
      data: {
        name: 'Health Department',
        description: 'Public health services and sanitation monitoring',
        code: 'HEALTH',
        contactEmail: 'health@nayibareilly.gov.in',
        contactPhone: '+91-581-2234571',
        slaHours: 24,
        priority: 2,
        budget: 10000000
      }
    }),
    prisma.department.create({
      data: {
        name: 'Municipal Corporation',
        description: 'General municipal services and administration',
        code: 'MC',
        contactEmail: 'admin@nayibareilly.gov.in',
        contactPhone: '+91-581-2234500',
        slaHours: 48,
        priority: 1,
        budget: 20000000
      }
    })
  ])

  // 2. Create Issue Categories
  console.log('📋 Creating issue categories...')
  const categories = await Promise.all([
    // PWD Categories
    prisma.issueCategory.create({
      data: {
        name: 'Road Repair',
        description: 'Potholes, broken roads, and street repairs',
        icon: 'road',
        color: '#EF4444',
        priority: 'HIGH',
        slaHours: 72,
        requiresLocation: true,
        requiresImages: true,
        defaultDepartmentId: departments[0].id
      }
    }),
    prisma.issueCategory.create({
      data: {
        name: 'Street Lighting',
        description: 'Non-functional street lights and electrical issues',
        icon: 'lightbulb',
        color: '#F59E0B',
        priority: 'MEDIUM',
        slaHours: 48,
        requiresLocation: true,
        defaultDepartmentId: departments[0].id
      }
    }),
    // Water Department
    prisma.issueCategory.create({
      data: {
        name: 'Water Supply Issue',
        description: 'No water supply, low pressure, or contaminated water',
        icon: 'droplets',
        color: '#3B82F6',
        priority: 'HIGH',
        slaHours: 24,
        requiresLocation: true,
        defaultDepartmentId: departments[1].id
      }
    }),
    prisma.issueCategory.create({
      data: {
        name: 'Sewerage Problem',
        description: 'Blocked drains, overflowing sewers, and drainage issues',
        icon: 'waves',
        color: '#8B5CF6',
        priority: 'HIGH',
        slaHours: 12,
        requiresLocation: true,
        requiresImages: true,
        defaultDepartmentId: departments[1].id
      }
    }),
    // Waste Management
    prisma.issueCategory.create({
      data: {
        name: 'Garbage Collection',
        description: 'Missed garbage pickup, overflowing bins, and waste disposal',
        icon: 'trash',
        color: '#10B981',
        priority: 'MEDIUM',
        slaHours: 24,
        requiresLocation: true,
        defaultDepartmentId: departments[2].id
      }
    }),
    // Traffic
    prisma.issueCategory.create({
      data: {
        name: 'Traffic Management',
        description: 'Traffic congestion, signal issues, and parking problems',
        icon: 'traffic-light',
        color: '#F97316',
        priority: 'MEDIUM',
        slaHours: 12,
        requiresLocation: true,
        defaultDepartmentId: departments[3].id
      }
    }),
    // Health
    prisma.issueCategory.create({
      data: {
        name: 'Public Health',
        description: 'Health hazards, sanitation issues, and pest control',
        icon: 'shield-check',
        color: '#EC4899',
        priority: 'HIGH',
        slaHours: 24,
        requiresLocation: true,
        defaultDepartmentId: departments[4].id
      }
    }),
    // General
    prisma.issueCategory.create({
      data: {
        name: 'Public Safety',
        description: 'Safety concerns, security issues, and emergency services',
        icon: 'shield-alert',
        color: '#DC2626',
        priority: 'CRITICAL',
        slaHours: 6,
        requiresLocation: true,
        defaultDepartmentId: departments[5].id
      }
    })
  ])

  // 3. Create Users
  console.log('👥 Creating users...')
  
  // Admin Users
  const adminUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@nayibareilly.gov.in',
        passwordHash,
        name: 'Municipal Commissioner',
        roles: ['super_admin'],
        isActive: true,
        isVerified: true,
        lastLogin: new Date()
      }
    }),
    prisma.user.create({
      data: {
        email: 'pwd.head@nayibareilly.gov.in',
        passwordHash,
        name: 'Raj Kumar Singh',
        roles: ['dept_admin'],
        departmentId: departments[0].id,
        isActive: true,
        isVerified: true,
        lastLogin: randomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
      }
    }),
    prisma.user.create({
      data: {
        email: 'water.head@nayibareilly.gov.in',
        passwordHash,
        name: 'Priya Sharma',
        roles: ['dept_admin'],
        departmentId: departments[1].id,
        isActive: true,
        isVerified: true,
        lastLogin: randomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
      }
    })
  ])

  // Staff Users
  const staffUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'field1@nayibareilly.gov.in',
        passwordHash,
        name: 'Amit Kumar',
        roles: ['staff'],
        departmentId: departments[0].id,
        isActive: true,
        isVerified: true,
        lastLogin: randomDate(new Date(Date.now() - 6 * 60 * 60 * 1000), new Date())
      }
    }),
    prisma.user.create({
      data: {
        email: 'field2@nayibareilly.gov.in',
        passwordHash,
        name: 'Sunita Devi',
        roles: ['staff'],
        departmentId: departments[1].id,
        isActive: true,
        isVerified: true,
        lastLogin: randomDate(new Date(Date.now() - 3 * 60 * 60 * 1000), new Date())
      }
    })
  ])

  // Moderators
  const moderators = await Promise.all([
    prisma.user.create({
      data: {
        email: 'moderator1@nayibareilly.gov.in',
        passwordHash,
        name: 'Vikash Gupta',
        roles: ['moderator'],
        isActive: true,
        isVerified: true,
        lastLogin: randomDate(new Date(Date.now() - 2 * 60 * 60 * 1000), new Date())
      }
    })
  ])

  // Citizens
  const citizenNames = [
    'Rahul Verma', 'Anjali Singh', 'Deepak Agarwal', 'Pooja Kumari', 'Rohit Sharma',
    'Neha Gupta', 'Suresh Kumar', 'Kavita Devi', 'Manoj Tiwari', 'Priyanka Joshi'
  ]

  const citizens = await Promise.all(
    citizenNames.map((name, index) => 
      prisma.user.create({
        data: {
          email: `citizen${index + 1}@gmail.com`,
          passwordHash,
          name: name,
          roles: ['citizen'],
          isActive: true,
          isVerified: true,
          lastLogin: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
        }
      })
    )
  )

  // 4. Create Issues
  console.log('🚨 Creating realistic issues...')
  
  const issueTemplates = [
    {
      title: 'Large Pothole on MG Road',
      description: 'There is a big pothole near Lovely Professional University gate on MG Road. It\'s causing traffic jams and vehicle damage. Urgent repair needed.',
      categoryId: categories[0].id,
      priority: 'HIGH',
      location: { lat: 28.3670, lng: 79.4304, address: 'MG Road, near LPU Gate, Bareilly' }
    },
    {
      title: 'Street Light Not Working',
      description: 'Street light pole number SL-234 on Pilibhit Road has been non-functional for the past week. Area becomes very dark at night.',
      categoryId: categories[1].id,
      priority: 'MEDIUM',
      location: { lat: 28.3587, lng: 79.4148, address: 'Pilibhit Road, Sector 7, Bareilly' }
    },
    {
      title: 'No Water Supply for 3 Days',
      description: 'Our locality in Faridpur hasn\'t received water supply for the past 3 days. Many families are facing severe shortage.',
      categoryId: categories[2].id,
      priority: 'CRITICAL',
      location: { lat: 28.3499, lng: 79.4312, address: 'Faridpur Colony, Block A, Bareilly' }
    },
    {
      title: 'Sewerage Overflow Near School',
      description: 'There is sewerage overflow near Government Primary School in Subhash Nagar. It\'s creating unhygienic conditions for children.',
      categoryId: categories[3].id,
      priority: 'HIGH',
      location: { lat: 28.3645, lng: 79.4267, address: 'Near Govt. Primary School, Subhash Nagar, Bareilly' }
    },
    {
      title: 'Garbage Not Collected This Week',
      description: 'Garbage in our society hasn\'t been collected for the past 5 days. Waste is piling up and attracting stray animals.',
      categoryId: categories[4].id,
      priority: 'MEDIUM',
      location: { lat: 28.3712, lng: 79.4156, address: 'Green Valley Society, Nawabganj, Bareilly' }
    },
    {
      title: 'Traffic Signal Malfunction',
      description: 'Traffic light at Civil Lines intersection has been showing red on all sides for 2 days. Causing major traffic confusion.',
      categoryId: categories[5].id,
      priority: 'HIGH',
      location: { lat: 28.3598, lng: 79.4201, address: 'Civil Lines Intersection, Bareilly' }
    },
    {
      title: 'Stagnant Water Breeding Mosquitoes',
      description: 'Water has been stagnant in the park area for weeks. It\'s becoming a breeding ground for mosquitoes and health hazard.',
      categoryId: categories[6].id,
      priority: 'MEDIUM',
      location: { lat: 28.3523, lng: 79.4089, address: 'Community Park, Izzat Nagar, Bareilly' }
    },
    {
      title: 'Broken Boundary Wall Safety Concern',
      description: 'The boundary wall of the government hospital has collapsed. It\'s a safety risk for pedestrians and needs immediate attention.',
      categoryId: categories[7].id,
      priority: 'CRITICAL',
      location: { lat: 28.3634, lng: 79.4178, address: 'District Hospital Boundary, Bareilly' }
    },
    {
      title: 'Road Cracked After Heavy Rain',
      description: 'The newly constructed road in Kargaina area has developed multiple cracks after last week\'s rainfall. Quality seems poor.',
      categoryId: categories[0].id,
      priority: 'MEDIUM',
      location: { lat: 28.3789, lng: 79.4123, address: 'New Road, Kargaina, Bareilly' }
    },
    {
      title: 'Water Contamination Reported',
      description: 'Water supplied to our area has a strange smell and taste. Multiple residents are reporting stomach issues after consumption.',
      categoryId: categories[2].id,
      priority: 'CRITICAL',
      location: { lat: 28.3445, lng: 79.4267, address: 'Shahi Colony, Ward 23, Bareilly' }
    }
  ]

  const issues = []
  for (let i = 0; i < issueTemplates.length; i++) {
    const template = issueTemplates[i]
    const reporter = randomChoice(citizens)
    const createdDate = randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
    
    const issue = await prisma.issue.create({
      data: {
        reportId: `REP-${String(Date.now() + i).slice(-6)}`,
        title: template.title,
        description: template.description,
        categoryId: template.categoryId,
        reporterId: reporter.id,
        reporterName: reporter.name,
        reporterEmail: reporter.email,
        priority: template.priority,
        status: randomChoice(['PENDING', 'TRIAGED', 'IN_PROGRESS', 'RESOLVED']),
        moderationStatus: 'APPROVED',
        latitude: template.location.lat,
        longitude: template.location.lng,
        address: template.location.address,
        isAnonymous: false,
        createdAt: createdDate,
        updatedAt: randomDate(createdDate, new Date())
      }
    })
    issues.push(issue)
  }

  // 5. Add some comments and timeline entries
  console.log('💬 Adding comments and timeline entries...')
  
  for (const issue of issues.slice(0, 5)) {
    // Add some comments
    await prisma.issueComment.create({
      data: {
        issueId: issue.id,
        userId: randomChoice([...staffUsers, ...moderators]).id,
        content: 'Thank you for reporting this issue. We have forwarded it to the concerned department for immediate action.',
        createdAt: randomDate(issue.createdAt, new Date())
      }
    })

    // Add timeline entry
    await prisma.issueTimeline.create({
      data: {
        issueId: issue.id,
        status: issue.status,
        note: 'Issue has been reviewed and assigned to field team',
        performedById: randomChoice(staffUsers).id,
        createdAt: randomDate(issue.createdAt, new Date())
      }
    })
  }

  console.log('✅ Realistic database seeding completed!')
  console.log(`📊 Summary:`)
  console.log(`   - Departments: ${departments.length}`)
  console.log(`   - Categories: ${categories.length}`) 
  console.log(`   - Users: ${adminUsers.length + staffUsers.length + moderators.length + citizens.length}`)
  console.log(`   - Issues: ${issues.length}`)
  console.log(`   - Admin login: admin@nayibareilly.gov.in / Admin@123`)
  console.log(`   - Citizen login: citizen1@gmail.com / Admin@123`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })