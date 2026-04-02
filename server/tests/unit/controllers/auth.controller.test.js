const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const app = require('../../../src/server'); // Assuming server exports app
const { AppError } = require('../../../src/utils/errorHandler');

// Mock Prisma
jest.mock('@prisma/client');
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

const prisma = mockPrisma;

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('crypto', () => ({
  randomBytes: jest.fn(() => ({ toString: () => 'mock-token' })),
}));

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset all mocks before each test
    Object.values(mockPrisma).forEach(mock => {
      if (typeof mock === 'object') {
        Object.values(mock).forEach(method => {
          if (jest.isMockFunction(method)) {
            method.mockReset();
          }
        });
      }
    });
  });

  describe('POST /api/auth/register', () => {
    const validRegistrationData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePassword123!',
      phone: '+919876543210',
      address: '123 Main St, City',
      role: 'citizen',
    };

    it('should register a new user successfully', async () => {
      // Mock dependencies
      mockPrisma.user.findFirst.mockResolvedValue(null); // No existing user
      bcrypt.hash.mockResolvedValue('hashedPassword123');
      jwt.sign.mockReturnValue('mockAccessToken');
      
      const mockUser = {
        id: 1,
        ...validRegistrationData,
        password: 'hashedPassword123',
        isActive: true,
        isVerified: false,
        createdAt: new Date(),
      };

      const mockRefreshToken = {
        id: 1,
        token: 'mockRefreshToken',
        userId: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue(mockUser),
          },
          refreshToken: {
            create: jest.fn().mockResolvedValue(mockRefreshToken),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
          },
          accessToken: 'mockAccessToken',
        },
      });

      expect(response.headers['set-cookie']).toBeDefined();
      expect(bcrypt.hash).toHaveBeenCalledWith(validRegistrationData.password, 12);
    });

    it('should return 400 for invalid email format', async () => {
      const invalidData = {
        ...validRegistrationData,
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    it('should return 400 for weak password', async () => {
      const invalidData = {
        ...validRegistrationData,
        password: '123', // Too weak
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });

    it('should return 409 for existing email', async () => {
      mockPrisma.user.findFirst.mockResolvedValue({
        id: 1,
        email: validRegistrationData.email,
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(validRegistrationData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        name: 'John Doe',
        email: 'john@example.com',
        // Missing password, phone, address
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    const validLoginData = {
      email: 'john@example.com',
      password: 'SecurePassword123!',
    };

    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashedPassword123',
      role: 'citizen',
      isActive: true,
      isVerified: true,
      loginAttempts: 0,
      lockedUntil: null,
    };

    it('should login user successfully with valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue('mockAccessToken');

      const mockRefreshToken = {
        id: 1,
        token: 'mockRefreshToken',
        userId: 1,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          user: {
            update: jest.fn().mockResolvedValue(mockUser),
          },
          refreshToken: {
            deleteMany: jest.fn().mockResolvedValue({}),
            create: jest.fn().mockResolvedValue(mockRefreshToken),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
          },
          accessToken: 'mockAccessToken',
        },
      });

      expect(response.headers['set-cookie']).toBeDefined();
      expect(bcrypt.compare).toHaveBeenCalledWith(validLoginData.password, mockUser.password);
    });

    it('should return 401 for invalid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false); // Wrong password

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          user: {
            update: jest.fn().mockResolvedValue({
              ...mockUser,
              loginAttempts: 1,
            }),
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 401 for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('should return 423 for locked account', async () => {
      const lockedUser = {
        ...mockUser,
        loginAttempts: 5,
        lockedUntil: new Date(Date.now() + 60 * 60 * 1000), // Locked for 1 hour
      };

      mockPrisma.user.findUnique.mockResolvedValue(lockedUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(423);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Account is temporarily locked');
    });

    it('should return 403 for inactive user', async () => {
      const inactiveUser = {
        ...mockUser,
        isActive: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(inactiveUser);

      const response = await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Account is deactivated');
    });

    it('should increment login attempts on failed login', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);

      const updateMock = jest.fn().mockResolvedValue({
        ...mockUser,
        loginAttempts: 1,
      });

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          user: {
            update: updateMock,
          },
          auditLog: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      await request(app)
        .post('/api/auth/login')
        .send(validLoginData)
        .expect(401);

      expect(updateMock).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          loginAttempts: { increment: 1 },
        },
      });
    });
  });

  describe('POST /api/auth/refresh', () => {
    const mockRefreshToken = {
      id: 1,
      token: 'validRefreshToken',
      userId: 1,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      user: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'citizen',
        isActive: true,
      },
    };

    it('should refresh access token successfully', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue(mockRefreshToken);
      jwt.sign.mockReturnValue('newAccessToken');

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=validRefreshToken'])
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: 'newAccessToken',
          user: {
            id: mockRefreshToken.user.id,
            name: mockRefreshToken.user.name,
            email: mockRefreshToken.user.email,
            role: mockRefreshToken.user.role,
          },
        },
      });
    });

    it('should return 401 for missing refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Refresh token required');
    });

    it('should return 401 for invalid refresh token', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=invalidToken'])
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid refresh token');
    });

    it('should return 401 for expired refresh token', async () => {
      const expiredToken = {
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      mockPrisma.refreshToken.findFirst.mockResolvedValue(expiredToken);

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', ['refreshToken=expiredToken'])
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Refresh token expired');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout user successfully', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', ['refreshToken=validToken'])
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logout successful',
      });

      // Check that refresh token cookie is cleared
      const cookies = response.headers['set-cookie'];
      expect(cookies.some(cookie => 
        cookie.includes('refreshToken=') && cookie.includes('Max-Age=0')
      )).toBe(true);
    });

    it('should handle logout without refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should initiate password reset for valid email', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        name: 'John Doe',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        resetToken: 'mockResetToken',
        resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
      });

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'john@example.com' })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Password reset instructions sent to your email',
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: expect.objectContaining({
          resetToken: expect.any(String),
          resetTokenExpires: expect.any(Date),
        }),
      });
    });

    it('should return success even for non-existent email (security)', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset instructions sent');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    const validResetData = {
      token: 'validResetToken',
      password: 'NewSecurePassword123!',
    };

    it('should reset password successfully with valid token', async () => {
      const mockUser = {
        id: 1,
        email: 'john@example.com',
        resetToken: 'validResetToken',
        resetTokenExpires: new Date(Date.now() + 60 * 60 * 1000),
      };

      mockPrisma.user.findFirst.mockResolvedValue(mockUser);
      bcrypt.hash.mockResolvedValue('newHashedPassword');
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        password: 'newHashedPassword',
        resetToken: null,
        resetTokenExpires: null,
      });

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(validResetData)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Password reset successful',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith(validResetData.password, 12);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: {
          password: 'newHashedPassword',
          resetToken: null,
          resetTokenExpires: null,
          loginAttempts: 0,
          lockedUntil: null,
        },
      });
    });

    it('should return 400 for invalid reset token', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(validResetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired reset token');
    });

    it('should return 400 for expired reset token', async () => {
      const expiredUser = {
        id: 1,
        resetToken: 'validResetToken',
        resetTokenExpires: new Date(Date.now() - 1000), // Expired
      };

      mockPrisma.user.findFirst.mockResolvedValue(expiredUser);

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(validResetData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired reset token');
    });
  });

  describe('Input Validation', () => {
    it('should validate email format', async () => {
      const invalidEmails = [
        'invalid-email',
        'test@',
        '@example.com',
        'test..test@example.com',
      ];

      for (const email of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email,
            password: 'SecurePassword123!',
            phone: '+919876543210',
            address: 'Test Address',
            role: 'citizen',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      }
    });

    it('should validate password strength', async () => {
      const weakPasswords = [
        '123',           // Too short
        'password',      // No uppercase, numbers, special chars
        'PASSWORD',      // No lowercase, numbers, special chars
        '12345678',      // No letters, special chars
        'Password1',     // No special chars
      ];

      for (const password of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            password,
            phone: '+919876543210',
            address: 'Test Address',
            role: 'citizen',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      }
    });

    it('should validate phone number format', async () => {
      const invalidPhones = [
        '123456789',      // Too short
        '+1234567890123456', // Too long
        'invalid-phone',  // Non-numeric
        '+91abcd1234',    // Contains letters
      ];

      for (const phone of invalidPhones) {
        const response = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: 'test@example.com',
            password: 'SecurePassword123!',
            phone,
            address: 'Test Address',
            role: 'citizen',
          })
          .expect(400);

        expect(response.body.success).toBe(false);
      }
    });
  });

  describe('Rate Limiting', () => {
    it('should handle rate limiting for login attempts', async () => {
      // Mock multiple failed login attempts
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        password: 'hashedPassword',
        role: 'citizen',
        isActive: true,
        isVerified: true,
        loginAttempts: 0,
        lockedUntil: null,
      });
      
      bcrypt.compare.mockResolvedValue(false);

      // Make multiple requests rapidly
      const promises = Array(6).fill().map(() =>
        request(app)
          .post('/api/auth/login')
          .send({
            email: 'john@example.com',
            password: 'wrongpassword',
          })
      );

      const responses = await Promise.all(promises);
      
      // At least one should be rate limited
      const rateLimitedResponse = responses.find(res => res.status === 429);
      expect(rateLimitedResponse).toBeDefined();
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.headers).toMatchObject({
        'x-content-type-options': 'nosniff',
        'x-frame-options': 'DENY',
        'x-xss-protection': '1; mode=block',
      });
    });
  });
});