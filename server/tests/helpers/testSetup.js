const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Test database setup
let prisma;

// Setup function to initialize test database
const setupTestDatabase = async () => {
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/nayibareilly_test',
      },
    },
  });

  // Connect to test database
  await prisma.$connect();

  // Clean up existing data
  await cleanupTestData();

  return prisma;
};

// Cleanup function to remove test data
const cleanupTestData = async () => {
  if (!prisma) return;

  const tablenames = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables WHERE schemaname='public'
  `;

  for (const { tablename } of tablenames) {
    if (tablename !== '_prisma_migrations') {
      try {
        await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
      } catch (error) {
        console.log(`Error cleaning up ${tablename}:`, error.message);
      }
    }
  }
};

// Teardown function to disconnect from database
const teardownTestDatabase = async () => {
  if (prisma) {
    await cleanupTestData();
    await prisma.$disconnect();
  }
};

// Helper to create test user
const createTestUser = async (userData = {}) => {
  const defaultUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: await bcrypt.hash('TestPassword123!', 12),
    phone: '+919876543210',
    address: '123 Test Street, Test City',
    role: 'citizen',
    isActive: true,
    isVerified: true,
  };

  return await prisma.user.create({
    data: { ...defaultUser, ...userData },
  });
};

// Helper to create test admin user
const createTestAdmin = async (userData = {}) => {
  const defaultAdmin = {
    name: 'Test Admin',
    email: 'admin@example.com',
    password: await bcrypt.hash('AdminPassword123!', 12),
    phone: '+919876543211',
    address: '456 Admin Street, Admin City',
    role: 'admin',
    isActive: true,
    isVerified: true,
  };

  return await prisma.user.create({
    data: { ...defaultAdmin, ...userData },
  });
};

// Helper to create test department
const createTestDepartment = async (departmentData = {}) => {
  const defaultDepartment = {
    name: 'Test Department',
    description: 'Test department for testing purposes',
    contactEmail: 'dept@example.com',
    contactPhone: '+919876543212',
    isActive: true,
  };

  return await prisma.department.create({
    data: { ...defaultDepartment, ...departmentData },
  });
};

// Helper to create test category
const createTestCategory = async (categoryData = {}) => {
  const defaultCategory = {
    name: 'Test Category',
    description: 'Test category for testing purposes',
    isActive: true,
  };

  return await prisma.category.create({
    data: { ...defaultCategory, ...categoryData },
  });
};

// Helper to create test issue
const createTestIssue = async (issueData = {}) => {
  // Ensure we have required relationships
  let userId = issueData.userId;
  let categoryId = issueData.categoryId;
  let departmentId = issueData.departmentId;

  if (!userId) {
    const user = await createTestUser();
    userId = user.id;
  }

  if (!categoryId) {
    const category = await createTestCategory();
    categoryId = category.id;
  }

  if (!departmentId) {
    const department = await createTestDepartment();
    departmentId = department.id;
  }

  const defaultIssue = {
    title: 'Test Issue',
    description: 'This is a test issue for testing purposes',
    location: '123 Test Location',
    latitude: 28.6139,
    longitude: 77.2090,
    priority: 'medium',
    status: 'pending',
    userId,
    categoryId,
    departmentId,
    issueNumber: `ISS-${Date.now()}`,
  };

  return await prisma.issue.create({
    data: { ...defaultIssue, ...issueData },
    include: {
      user: true,
      category: true,
      department: true,
    },
  });
};

// Helper to create test refresh token
const createTestRefreshToken = async (userId, tokenData = {}) => {
  const defaultToken = {
    token: `refresh_token_${Date.now()}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    userId,
  };

  return await prisma.refreshToken.create({
    data: { ...defaultToken, ...tokenData },
  });
};

// Helper to create test notification
const createTestNotification = async (userId, notificationData = {}) => {
  const defaultNotification = {
    title: 'Test Notification',
    message: 'This is a test notification',
    type: 'info',
    userId,
    isRead: false,
  };

  return await prisma.notification.create({
    data: { ...defaultNotification, ...notificationData },
  });
};

// Helper to create test issue update
const createTestIssueUpdate = async (issueId, userId, updateData = {}) => {
  const defaultUpdate = {
    status: 'in_progress',
    message: 'Test status update',
    issueId,
    userId,
  };

  return await prisma.issueUpdate.create({
    data: { ...defaultUpdate, ...updateData },
  });
};

// Helper to authenticate test user (returns JWT token)
const authenticateTestUser = async (user) => {
  const jwt = require('jsonwebtoken');
  
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
    expiresIn: '1h',
  });
};

// Helper to create authentication headers
const createAuthHeaders = (token) => {
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Helper to wait for a specified time (for testing timers)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate random string
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Helper to generate random email
const generateRandomEmail = () => {
  return `test_${generateRandomString(8)}@example.com`;
};

// Helper to generate random phone
const generateRandomPhone = () => {
  const number = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `+91${number}`;
};

// Helper to create multiple test users
const createMultipleTestUsers = async (count = 5, baseData = {}) => {
  const users = [];
  for (let i = 0; i < count; i++) {
    const user = await createTestUser({
      ...baseData,
      email: generateRandomEmail(),
      phone: generateRandomPhone(),
      name: `Test User ${i + 1}`,
    });
    users.push(user);
  }
  return users;
};

// Helper to create multiple test issues
const createMultipleTestIssues = async (count = 5, baseData = {}) => {
  const issues = [];
  for (let i = 0; i < count; i++) {
    const issue = await createTestIssue({
      ...baseData,
      title: `Test Issue ${i + 1}`,
      issueNumber: `ISS-2024-${String(i + 1).padStart(3, '0')}`,
    });
    issues.push(issue);
  }
  return issues;
};

// Error helpers
const expectValidationError = (response, field) => {
  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message.toLowerCase()).toContain(field.toLowerCase());
};

const expectNotFoundError = (response, resource = 'resource') => {
  expect(response.status).toBe(404);
  expect(response.body.success).toBe(false);
  expect(response.body.message.toLowerCase()).toContain('not found');
};

const expectAuthenticationError = (response) => {
  expect(response.status).toBe(401);
  expect(response.body.success).toBe(false);
  expect(response.body.message.toLowerCase()).toContain('unauthorized');
};

const expectAuthorizationError = (response) => {
  expect(response.status).toBe(403);
  expect(response.body.success).toBe(false);
  expect(response.body.message.toLowerCase()).toContain('permission');
};

module.exports = {
  // Database setup
  setupTestDatabase,
  cleanupTestData,
  teardownTestDatabase,
  
  // Entity creators
  createTestUser,
  createTestAdmin,
  createTestDepartment,
  createTestCategory,
  createTestIssue,
  createTestRefreshToken,
  createTestNotification,
  createTestIssueUpdate,
  
  // Multiple entity creators
  createMultipleTestUsers,
  createMultipleTestIssues,
  
  // Authentication helpers
  authenticateTestUser,
  createAuthHeaders,
  
  // Utility helpers
  wait,
  generateRandomString,
  generateRandomEmail,
  generateRandomPhone,
  
  // Assertion helpers
  expectValidationError,
  expectNotFoundError,
  expectAuthenticationError,
  expectAuthorizationError,
  
  // Direct prisma access for advanced operations
  getPrisma: () => prisma,
};