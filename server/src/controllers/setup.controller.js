/**
 * One-time setup endpoint to seed admin user
 * Should be disabled/removed after initial setup
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Use separate Prisma instance for setup to avoid dependency issues
const prisma = new PrismaClient()

export async function setupAdmin(req, res) {
  try {
    // Security check: Only allow with a secret key
    const setupKey = req.headers['x-setup-key'] || req.query.key
    const expectedKey = process.env.SETUP_SECRET_KEY || 'your-secret-setup-key-change-this'
    
    if (setupKey !== expectedKey) {
      return res.status(403).json({
        success: false,
        message: 'Invalid setup key. Add SETUP_SECRET_KEY environment variable in Render dashboard.'
      })
    }

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@nayibareilly.com' }
    })

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists. You can login with existing credentials.',
        data: {
          email: existingAdmin.email,
          id: existingAdmin.id,
          hint: 'If you forgot password, contact support or reset via database.'
        }
      })
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@nayibareilly.com',
        name: 'System Administrator',
        passwordHash: hashedPassword,
        phone: '9999999999',
        roles: ['admin', 'moderator'],
        isVerified: true,
        isActive: true
      }
    })

    return res.status(201).json({
      success: true,
      message: '✅ Admin user created successfully!',
      data: {
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          roles: admin.roles
        },
        credentials: {
          email: 'admin@nayibareilly.com',
          password: 'admin123',
          warning: '⚠️ CHANGE PASSWORD IMMEDIATELY AFTER FIRST LOGIN!'
        },
        loginUrl: `${process.env.CLIENT_ORIGIN || 'http://localhost:3000'}/login`,
        nextSteps: [
          '1. Go to your frontend login page',
          '2. Login with the credentials above',
          '3. Change your password immediately',
          '4. (Optional) Remove SETUP_SECRET_KEY from Render environment'
        ]
      }
    })

  } catch (error) {
    console.error('Setup admin error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  } finally {
    // Clean up the Prisma connection
    await prisma.$disconnect()
  }
}
