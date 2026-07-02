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
        name: 'Municipal Corporation',
        description: 'General municipal services and administration',
        code: 'MC',
        contactEmail: 'admin@nayibareilly.gov.in',
        contactPhone: '+91-581-2234500',
        slaHours: 24,
        priority: 1,
        budget: 63000000
      }
    })
  ])

  // 2. Create Issue Categories
  console.log('📋 Creating issue categories...')
  const categories = await Promise.all([
    // PWD Categories (Now assigned to Municipal Corporation)
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
    // Water Department (Now assigned to Municipal Corporation)
    prisma.issueCategory.create({
      data: {
        name: 'Water Supply Issue',
        description: 'No water supply, low pressure, or contaminated water',
        icon: 'droplets',
        color: '#3B82F6',
        priority: 'HIGH',
        slaHours: 24,
        requiresLocation: true,
        defaultDepartmentId: departments[0].id
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
        defaultDepartmentId: departments[0].id
      }
    }),
    // Waste Management (Now assigned to Municipal Corporation)
    prisma.issueCategory.create({
      data: {
        name: 'Garbage Collection',
        description: 'Missed garbage pickup, overflowing bins, and waste disposal',
        icon: 'trash',
        color: '#10B981',
        priority: 'MEDIUM',
        slaHours: 24,
        requiresLocation: true,
        defaultDepartmentId: departments[0].id
      }
    }),
    // Traffic (Now assigned to Municipal Corporation)
    prisma.issueCategory.create({
      data: {
        name: 'Traffic Management',
        description: 'Traffic congestion, signal issues, and parking problems',
        icon: 'traffic-light',
        color: '#F97316',
        priority: 'MEDIUM',
        slaHours: 12,
        requiresLocation: true,
        defaultDepartmentId: departments[0].id
      }
    }),
    // Health (Now assigned to Municipal Corporation)
    prisma.issueCategory.create({
      data: {
        name: 'Public Health',
        description: 'Health hazards, sanitation issues, and pest control',
        icon: 'shield-check',
        color: '#EC4899',
        priority: 'HIGH',
        slaHours: 24,
        requiresLocation: true,
        defaultDepartmentId: departments[0].id
      }
    }),
    // General (Now assigned to Municipal Corporation)
    prisma.issueCategory.create({
      data: {
        name: 'Public Safety',
        description: 'Safety concerns, security issues, and emergency services',
        icon: 'shield-alert',
        color: '#DC2626',
        priority: 'CRITICAL',
        slaHours: 6,
        requiresLocation: true,
        defaultDepartmentId: departments[0].id
      }
    })
  ])

  // 3. Create Users
  console.log('👥 Creating users...')
  
  // Admin Users (All assigned to Municipal Corporation)
  const adminUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@nayibareilly.gov.in',
        passwordHash,
        name: 'Municipal Commissioner',
        roles: ['tech_admin'],
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
        departmentId: departments[0].id,
        isActive: true,
        isVerified: true,
        lastLogin: randomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
      }
    })
  ])

  // Staff Users (All assigned to Municipal Corporation)
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
        departmentId: departments[0].id,
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
  
  const categoryImages = {
    'Road Repair': [
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978205/nayibareilly/seeds/pf9mcjugamlioxkekltk.jpg', // Pothole
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978205/nayibareilly/seeds/pf9mcjugamlioxkekltk.jpg'
    ],
    'Street Lighting': [
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978206/nayibareilly/seeds/kc8vikhiramf5ubzxk69.jpg', // Streetlight
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978206/nayibareilly/seeds/kc8vikhiramf5ubzxk69.jpg'
    ],
    'Water Supply Issue': [
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978209/nayibareilly/seeds/tb0cja8mggaghouhqhaw.jpg', // Water leak
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978209/nayibareilly/seeds/tb0cja8mggaghouhqhaw.jpg'
    ],
    'Sewerage Problem': [
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978209/nayibareilly/seeds/tb0cja8mggaghouhqhaw.jpg', // Water leak
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978208/nayibareilly/seeds/h8uqilhsmvqpgo3eem23.jpg'  // Garbage/Mess
    ],
    'Garbage Collection': [
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978208/nayibareilly/seeds/h8uqilhsmvqpgo3eem23.jpg', // Garbage
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978208/nayibareilly/seeds/h8uqilhsmvqpgo3eem23.jpg'
    ],
    'Traffic Management': [
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978205/nayibareilly/seeds/pf9mcjugamlioxkekltk.jpg', // Pothole/Road
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978206/nayibareilly/seeds/kc8vikhiramf5ubzxk69.jpg'
    ],
    'Public Health': [
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978208/nayibareilly/seeds/h8uqilhsmvqpgo3eem23.jpg'  // Garbage
    ],
    'Public Safety': [
      'https://res.cloudinary.com/dfvudsdld/image/upload/v1782978206/nayibareilly/seeds/kc8vikhiramf5ubzxk69.jpg' // Broken light
    ]
  };

  
  const issueTemplates = [
    {
      title: 'सड़क पर बड़ा गड्ढा - Massive Pothole on MG Road',
      description: 'MG Road पर LPU गेट के पास एक बहुत बड़ा गड्ढा है, जिससे रोज़ ट्रैफिक जाम हो रहा है। बारिश के कारण यह और भी खतरनाक हो गया है। There is a big pothole near Lovely Professional University gate on MG Road causing daily traffic jams. It has become extremely dangerous after the recent rains. Urgent repair needed.',
      categoryId: categories[0].id,
      priority: 'HIGH',
      location: { lat: 28.3670, lng: 79.4304, address: 'MG Road, near LPU Gate, Bareilly' }
    },
    {
      title: 'स्ट्रीट लाइट खराब है - Street Light Not Working',
      description: 'पीलीभीत रोड पर सेक्टर 7 में स्ट्रीट लाइट पोल (SL-234) पिछले एक हफ्ते से बंद है। रात में यहां पूरा अंधेरा रहता है जिससे चोरी का डर है। Street light pole number SL-234 on Pilibhit Road has been non-functional for the past week. The area becomes completely dark at night posing security risks.',
      categoryId: categories[1].id,
      priority: 'MEDIUM',
      location: { lat: 28.3587, lng: 79.4148, address: 'Pilibhit Road, Sector 7, Bareilly' }
    },
    {
      title: '3 दिन से पानी नहीं आ रहा - No Water Supply for 3 Days',
      description: 'फरीदपुर कॉलोनी के ब्लॉक ए में पिछले 3 दिनों से पानी की सप्लाई पूरी तरह ठप है। इलाके में टैंकर भी नहीं भेजा गया है। Our locality in Faridpur hasn\'t received water supply for the past 3 days. Families are facing severe shortage and no water tankers have been dispatched.',
      categoryId: categories[2].id,
      priority: 'CRITICAL',
      location: { lat: 28.3499, lng: 79.4312, address: 'Faridpur Colony, Block A, Bareilly' }
    },
    {
      title: 'स्कूल के पास सीवर ओवरफ्लो - Sewerage Overflow Near School',
      description: 'सुभाष नगर में सरकारी प्राइमरी स्कूल के ठीक बाहर सीवर का पानी बह रहा है। बच्चों के लिए यह बहुत अस्वच्छ है और बीमारी फैल सकती है। There is a massive sewerage overflow right outside the Government Primary School in Subhash Nagar. It is creating highly unhygienic conditions for children.',
      categoryId: categories[3].id,
      priority: 'HIGH',
      location: { lat: 28.3645, lng: 79.4267, address: 'Near Govt. Primary School, Subhash Nagar, Bareilly' }
    },
    {
      title: 'कचरा नहीं उठाया जा रहा - Garbage Not Collected This Week',
      description: 'नवाबगंज की ग्रीन वैली सोसाइटी में पिछले 5 दिनों से कूड़ा नहीं उठाया गया है। कचरा सड़क तक आ गया है और जानवर उसे फैला रहे हैं। Garbage in our society hasn\'t been collected for the past 5 days. Waste is spilling onto the roads and stray animals are spreading it everywhere.',
      categoryId: categories[4].id,
      priority: 'MEDIUM',
      location: { lat: 28.3712, lng: 79.4156, address: 'Green Valley Society, Nawabganj, Bareilly' }
    },
    {
      title: 'ट्रैफिक सिग्नल खराब है - Traffic Signal Malfunction',
      description: 'सिविल लाइंस चौराहे का ट्रैफिक सिग्नल पिछले 2 दिनों से हर तरफ लाल बत्ती ही दिखा रहा है, जिससे भारी जाम लग रहा है। The traffic light at Civil Lines intersection has been stuck on red on all sides for 2 days, causing massive confusion and traffic congestion.',
      categoryId: categories[5].id,
      priority: 'HIGH',
      location: { lat: 28.3598, lng: 79.4201, address: 'Civil Lines Intersection, Bareilly' }
    },
    {
      title: 'पार्क में रुका हुआ पानी - Stagnant Water Breeding Mosquitoes',
      description: 'इज्जत नगर के कम्युनिटी पार्क में हफ्तों से बारिश का पानी जमा है। यहां मच्छरों की पैदावार हो रही है, जिससे डेंगू का खतरा है। Rainwater has been stagnant in the community park for weeks. It has become a breeding ground for mosquitoes, posing a severe dengue threat.',
      categoryId: categories[6].id,
      priority: 'MEDIUM',
      location: { lat: 28.3523, lng: 79.4089, address: 'Community Park, Izzat Nagar, Bareilly' }
    },
    {
      title: 'अस्पताल की टूटी दीवार - Broken Boundary Wall Safety Concern',
      description: 'जिला अस्पताल की बाउंड्री वॉल गिर गई है। पैदल चलने वालों के लिए यह एक बड़ा खतरा है, कृपया इसे तुरंत ठीक कराएं। The boundary wall of the district hospital has collapsed. It is a major safety risk for pedestrians and patients, requiring immediate reconstruction.',
      categoryId: categories[7].id,
      priority: 'CRITICAL',
      location: { lat: 28.3634, lng: 79.4178, address: 'District Hospital Boundary, Bareilly' }
    },
    {
      title: 'नई सड़क में दरारें - Road Cracked After Heavy Rain',
      description: 'करगैना इलाके में हाल ही में बनी सड़क में पिछले हफ्ते की बारिश के बाद बड़ी दरारें आ गई हैं। निर्माण सामग्री की गुणवत्ता खराब लगती है। The newly constructed road in Kargaina has developed massive cracks after last week\'s rainfall. The material quality appears to be extremely poor.',
      categoryId: categories[0].id,
      priority: 'MEDIUM',
      location: { lat: 28.3789, lng: 79.4123, address: 'New Road, Kargaina, Bareilly' }
    },
    {
      title: 'दूषित पेयजल की सप्लाई - Water Contamination Reported',
      description: 'वार्ड 23, शाही कॉलोनी में जो पानी सप्लाई हो रहा है उसमें से बहुत गंदी बदबू आ रही है। कई लोगों को पेट खराब होने की शिकायत हुई है। The municipal water supplied to Ward 23 has a foul smell and yellow tint. Multiple residents have reported severe stomach infections after consumption.',
      categoryId: categories[2].id,
      priority: 'CRITICAL',
      location: { lat: 28.3445, lng: 79.4267, address: 'Shahi Colony, Ward 23, Bareilly' }
    }
  ]

  const issues = []
  // Generate 50 issues (5 iterations of the 10 templates)
  let issueCounter = 1;
  for (let iteration = 0; iteration < 5; iteration++) {
    for (let i = 0; i < issueTemplates.length; i++) {
      const template = issueTemplates[i]
      const reporter = randomChoice(citizens)
      const createdDate = randomDate(new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), new Date())
      
      const allStatuses = [
        'PENDING', 'PENDING', 'PENDING_MODERATOR_REVIEW', 
        'ASSIGNED_TO_DEPARTMENT', 'TRIAGED', 'ASSIGNED_TO_STAFF', 
        'STAFF_EN_ROUTE', 'IN_PROGRESS', 'IN_PROGRESS', 
        'WORK_COMPLETED', 'PENDING_CITIZEN_VERIFICATION', 
        'RESOLVED', 'RESOLVED', 'RESOLVED', 'CLOSED'
      ];
      
      const status = randomChoice(allStatuses);
      
      const categoryObj = categories.find(c => c.id === template.categoryId);
      const categoryName = categoryObj ? categoryObj.name : 'Garbage Collection';
      const possibleImages = categoryImages[categoryName] || categoryImages['Garbage Collection'];
      
      const mediaData = [
        { url: randomChoice(possibleImages), filename: 'image1.jpg', originalName: 'image1.jpg', mimeType: 'image/jpeg', size: 102400 },
        { url: randomChoice(possibleImages), filename: 'image2.jpg', originalName: 'image2.jpg', mimeType: 'image/jpeg', size: 102400 }
      ];
      
      const issue = await prisma.issue.create({
        data: {
          reportId: `REP-${String(Date.now()).slice(-4)}${String(issueCounter).padStart(3, '0')}`,
          title: template.title + (iteration > 0 ? ` (${iteration})` : ''),
          description: template.description,
          categoryId: template.categoryId,
          reporterId: reporter.id,
          reporterName: reporter.name,
          reporterEmail: reporter.email,
          priority: template.priority,
          status: status,
          moderationStatus: 'APPROVED',
          latitude: template.location.lat + (Math.random() * 0.01 - 0.005),
          longitude: template.location.lng + (Math.random() * 0.01 - 0.005),
          address: template.location.address,
          departmentId: ['PENDING', 'PENDING_MODERATOR_REVIEW'].includes(status) ? null : departments[0].id,
          isAnonymous: false,
          createdAt: createdDate,
          updatedAt: randomDate(createdDate, new Date()),
          resolvedAt: ['RESOLVED', 'CLOSED'].includes(status) ? new Date() : null,
          images: { create: mediaData }
        }
      })
      issues.push(issue)
      issueCounter++;
    }
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
  console.log(`   - Tech Admin login: admin@nayibareilly.gov.in / Admin@123`)
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