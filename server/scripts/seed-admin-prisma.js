#!/usr/bin/env node
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env from repo root
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') })

const prisma = new PrismaClient()

function unique(arr) {
  return Array.from(new Set(arr))
}

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@nagarsetu.gov.in'
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Nagarsetu@Admin2025'
  const name = process.env.SUPER_ADMIN_NAME || 'Super Administrator'

  const passwordHash = await bcrypt.hash(password, 10)

  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        roles: { set: [UserRole.super_admin] },
        isActive: true,
        isVerified: true,
      },
      select: { id: true, email: true, roles: true, isActive: true, isVerified: true }
    })
    console.log('Created super admin user:', user.email)
  } else {
    const roles = unique([...(user.roles || []), UserRole.super_admin])
    await prisma.user.update({ where: { id: user.id }, data: { roles: { set: roles } } })
    console.log('Ensured user has super_admin role:', email)
  }

  console.log('\nAdmin credentials:')
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${password}`)
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
