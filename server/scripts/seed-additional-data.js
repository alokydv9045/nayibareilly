import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to generate random dates within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

// Helper function to get a random item from array
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)]
}

async function main() {
  console.log('🌱 Seeding additional missing data (ActivityLogs, Notifications, Votes)...')

  // Get existing users and issues
  const users = await prisma.user.findMany()
  const issues = await prisma.issue.findMany()

  if (users.length === 0 || issues.length === 0) {
    console.error('❌ Cannot seed additional data because Users or Issues are missing. Please run seed:realistic first.')
    process.exit(1)
  }

  const superAdmin = users.find(u => u.roles.includes('super_admin'))
  const citizens = users.filter(u => u.roles.includes('citizen'))
  const staff = users.filter(u => u.roles.includes('staff') || u.roles.includes('moderator'))

  console.log('📝 Creating Activity Logs...')
  const activityActions = ['LOGIN', 'CREATED', 'STATUS_CHANGED', 'COMMENTED', 'RESOLVED', 'ASSIGNED']
  
  for (let i = 0; i < 50; i++) {
    const user = randomChoice(users)
    const issue = randomChoice(issues)
    const action = randomChoice(activityActions)
    
    await prisma.activityLog.create({
      data: {
        action: action,
        description: `User performed ${action}`,
        userId: user.id,
        issueId: ['CREATED', 'STATUS_CHANGED', 'COMMENTED', 'RESOLVED', 'ASSIGNED'].includes(action) ? issue.id : null,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
      }
    })
  }

  console.log('🔔 Creating Notifications...')
  for (let i = 0; i < 30; i++) {
    const user = randomChoice(users)
    const issue = randomChoice(issues)
    
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'New Update on Issue',
        message: `There has been an update regarding issue: ${issue.title}`,
        type: 'INFO',
        relatedIssueId: issue.id,
        read: Math.random() > 0.5,
        createdAt: randomDate(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), new Date())
      }
    })
  }

  console.log('👍 Creating Votes...')
  if (citizens.length > 0) {
    for (const issue of issues.slice(0, 20)) {
      // 1 to 5 upvotes per issue
      const numVotes = Math.floor(Math.random() * 5) + 1;
      let upvotes = 0;
      
      for(let v = 0; v < numVotes; v++) {
        const citizen = randomChoice(citizens);
        try {
          await prisma.vote.create({
            data: {
              userId: citizen.id,
              issueId: issue.id,
              isUpvote: true,
              createdAt: randomDate(issue.createdAt, new Date())
            }
          })
          upvotes++;
        } catch (e) {
          // Ignore unique constraint violations if same citizen votes twice
        }
      }
      
      // Update issue total votes
      await prisma.issue.update({
        where: { id: issue.id },
        data: {
          upvotes: upvotes,
          totalVotes: upvotes
        }
      })
    }
  }

  console.log('✅ Additional data seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
