#!/usr/bin/env node
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const prisma = new PrismaClient()

const TEST_USERS = [
  {
    email: 'admin@nagarsetu.gov.in',
    password: 'Nagarsetu@Admin2025',
    name: 'Super Administrator',
    roles: ['super_admin'],
    isActive: true,
    isVerified: true,
  },
  {
    email: 'moderator@nagarsetu.gov.in',
    password: 'Moderator@123',
    name: 'Content Moderator',
    roles: ['moderator'],
    isActive: true,
    isVerified: true,
  },
  {
    email: 'staff@nagarsetu.gov.in',
    password: 'Staff@123',
    name: 'Field Staff Member',
    roles: ['staff'],
    isActive: true,
    isVerified: true,
  },
  {
    email: 'citizen@example.com',
    password: 'Citizen@123',
    name: 'Test Citizen',
    roles: ['citizen'],
    isActive: true,
    isVerified: true,
  },
  {
    email: 'mayor@nagarsetu.gov.in',
    password: 'Mayor@123',
    name: 'Mayor Office',
    roles: ['mayor'],
    isActive: true,
    isVerified: true,
  },
]

async function main() {
  console.log('🌱 Seeding test users...\n')

  for (const userData of TEST_USERS) {
    const { password, ...data } = userData
    const passwordHash = await bcrypt.hash(password, 10)

    let user = await prisma.user.findUnique({ where: { email: data.email } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          ...data,
          passwordHash,
          roles: { set: data.roles },
        },
      })
      console.log(`✅ Created: ${user.email} (${data.roles.join(', ')})`)
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          roles: { set: data.roles },
          isActive: true,
          isVerified: true,
        },
      })
      console.log(`♻️  Updated: ${user.email} (${data.roles.join(', ')})`)
    }
  }

  console.log('\n✨ Test users seeded successfully!\n')
  console.log('📋 Test Credentials:')
  console.log('━'.repeat(60))
  TEST_USERS.forEach(({ email, password, roles }) => {
    console.log(`\n${roles[0].toUpperCase().replace('_', ' ')}:`)
    console.log(`  Email:    ${email}`)
    console.log(`  Password: ${password}`)
  })
  console.log('\n' + '━'.repeat(60))
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
