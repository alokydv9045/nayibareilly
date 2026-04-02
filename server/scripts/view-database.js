import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function viewDatabase() {
  console.log('🔍 DATABASE CONTENTS OVERVIEW')
  console.log('=' * 50)

  try {
    // Count records in each table
    const [
      userCount,
      departmentCount,
      categoryCount,
      issueCount,
      commentCount,
      timelineCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.department.count(),
      prisma.issueCategory.count(),
      prisma.issue.count(),
      prisma.issueComment.count(),
      prisma.issueTimeline.count()
    ])

    console.log('\n📊 RECORD COUNTS:')
    console.log(`Users: ${userCount}`)
    console.log(`Departments: ${departmentCount}`)
    console.log(`Categories: ${categoryCount}`)
    console.log(`Issues: ${issueCount}`)
    console.log(`Comments: ${commentCount}`)
    console.log(`Timeline Entries: ${timelineCount}`)

    // Show sample users
    console.log('\n👥 USERS:')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        roles: true,
        isActive: true,
        isVerified: true,
        departmentId: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`)
      console.log(`   Roles: ${user.roles.join(', ')}`)
      console.log(`   Active: ${user.isActive}, Verified: ${user.isVerified}`)
      console.log(`   Department: ${user.departmentId || 'None'}`)
      console.log(`   Created: ${user.createdAt.toISOString().split('T')[0]}`)
      console.log('')
    })

    // Show departments
    console.log('\n🏢 DEPARTMENTS:')
    const departments = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        contactEmail: true,
        slaHours: true,
        isActive: true,
        _count: {
          select: {
            users: true,
            issues: true
          }
        }
      }
    })

    departments.forEach((dept, index) => {
      console.log(`${index + 1}. ${dept.name} (${dept.code})`)
      console.log(`   Contact: ${dept.contactEmail}`)
      console.log(`   SLA: ${dept.slaHours}h, Active: ${dept.isActive}`)
      console.log(`   Users: ${dept._count.users}, Issues: ${dept._count.issues}`)
      console.log('')
    })

    // Show categories
    console.log('\n📋 ISSUE CATEGORIES:')
    const categories = await prisma.issueCategory.findMany({
      select: {
        id: true,
        name: true,
        icon: true,
        color: true,
        priority: true,
        slaHours: true,
        isActive: true,
        _count: {
          select: {
            issues: true
          }
        }
      }
    })

    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.icon})`)
      console.log(`   Priority: ${cat.priority}, SLA: ${cat.slaHours}h`)
      console.log(`   Color: ${cat.color}, Active: ${cat.isActive}`)
      console.log(`   Issues: ${cat._count.issues}`)
      console.log('')
    })

    // Show recent issues
    console.log('\n🚨 RECENT ISSUES:')
    const issues = await prisma.issue.findMany({
      select: {
        id: true,
        reportId: true,
        title: true,
        status: true,
        priority: true,
        moderationStatus: true,
        reporterName: true,
        reporterEmail: true,
        address: true,
        createdAt: true,
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.reportId}: ${issue.title}`)
      console.log(`   Reporter: ${issue.reporterName} (${issue.reporterEmail})`)
      console.log(`   Status: ${issue.status}, Priority: ${issue.priority}`)
      console.log(`   Moderation: ${issue.moderationStatus}`)
      console.log(`   Category: ${issue.category?.name || 'Uncategorized'}`)
      console.log(`   Location: ${issue.address || 'No address'}`)
      console.log(`   Created: ${issue.createdAt.toISOString().split('T')[0]}`)
      console.log('')
    })

  } catch (error) {
    console.error('Error querying database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

viewDatabase()