// Mock user data for testing
const mockUsers = {
  citizen: {
    id: 1,
    name: 'John Citizen',
    email: 'john.citizen@example.com',
    password: 'hashedPassword123',
    phone: '+919876543210',
    address: '123 Citizen Street, Test City',
    role: 'citizen',
    isActive: true,
    isVerified: true,
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },

  staff: {
    id: 2,
    name: 'Jane Staff',
    email: 'jane.staff@example.com',
    password: 'hashedPassword123',
    phone: '+919876543211',
    address: '456 Staff Street, Test City',
    role: 'staff',
    departmentId: 1,
    isActive: true,
    isVerified: true,
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },

  admin: {
    id: 3,
    name: 'Bob Admin',
    email: 'bob.admin@example.com',
    password: 'hashedPassword123',
    phone: '+919876543212',
    address: '789 Admin Street, Test City',
    role: 'admin',
    isActive: true,
    isVerified: true,
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },

  superAdmin: {
    id: 4,
    name: 'Alice Super Admin',
    email: 'alice.superadmin@example.com',
    password: 'hashedPassword123',
    phone: '+919876543213',
    address: '101 Super Admin Street, Test City',
    role: 'super_admin',
    isActive: true,
    isVerified: true,
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },

  inactiveUser: {
    id: 5,
    name: 'Inactive User',
    email: 'inactive@example.com',
    password: 'hashedPassword123',
    phone: '+919876543214',
    address: '202 Inactive Street, Test City',
    role: 'citizen',
    isActive: false,
    isVerified: true,
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },

  unverifiedUser: {
    id: 6,
    name: 'Unverified User',
    email: 'unverified@example.com',
    password: 'hashedPassword123',
    phone: '+919876543215',
    address: '303 Unverified Street, Test City',
    role: 'citizen',
    isActive: true,
    isVerified: false,
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },

  lockedUser: {
    id: 7,
    name: 'Locked User',
    email: 'locked@example.com',
    password: 'hashedPassword123',
    phone: '+919876543216',
    address: '404 Locked Street, Test City',
    role: 'citizen',
    isActive: true,
    isVerified: true,
    loginAttempts: 5,
    lockedUntil: new Date(Date.now() + 60 * 60 * 1000), // Locked for 1 hour
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
};

// Mock user registration data
const mockRegistrationData = {
  valid: {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'SecurePassword123!',
    phone: '+919876543217',
    address: '505 New User Street, Test City',
    role: 'citizen',
  },

  invalidEmail: {
    name: 'Invalid Email User',
    email: 'invalid-email',
    password: 'SecurePassword123!',
    phone: '+919876543218',
    address: '606 Invalid Email Street, Test City',
    role: 'citizen',
  },

  weakPassword: {
    name: 'Weak Password User',
    email: 'weakpassword@example.com',
    password: '123',
    phone: '+919876543219',
    address: '707 Weak Password Street, Test City',
    role: 'citizen',
  },

  existingEmail: {
    name: 'Existing Email User',
    email: 'john.citizen@example.com', // Same as mockUsers.citizen.email
    password: 'SecurePassword123!',
    phone: '+919876543220',
    address: '808 Existing Email Street, Test City',
    role: 'citizen',
  },

  missingFields: {
    name: 'Incomplete User',
    email: 'incomplete@example.com',
    // Missing password, phone, address
  },
};

// Mock login data
const mockLoginData = {
  validCitizen: {
    email: 'john.citizen@example.com',
    password: 'TestPassword123!',
  },

  validAdmin: {
    email: 'bob.admin@example.com',
    password: 'AdminPassword123!',
  },

  invalidCredentials: {
    email: 'john.citizen@example.com',
    password: 'WrongPassword123!',
  },

  nonExistentUser: {
    email: 'nonexistent@example.com',
    password: 'SomePassword123!',
  },

  inactiveUser: {
    email: 'inactive@example.com',
    password: 'TestPassword123!',
  },

  lockedUser: {
    email: 'locked@example.com',
    password: 'TestPassword123!',
  },
};

// Generate multiple users for testing pagination and bulk operations
const generateMockUsers = (count = 10, roleDistribution = {}) => {
  const defaultDistribution = {
    citizen: 0.7,
    staff: 0.2,
    admin: 0.1,
  };

  const distribution = { ...defaultDistribution, ...roleDistribution };
  const users = [];

  for (let i = 0; i < count; i++) {
    const random = Math.random();
    let role = 'citizen';
    
    if (random < distribution.admin) {
      role = 'admin';
    } else if (random < distribution.admin + distribution.staff) {
      role = 'staff';
    }

    users.push({
      id: 100 + i,
      name: `Test User ${i + 1}`,
      email: `testuser${i + 1}@example.com`,
      password: 'hashedPassword123',
      phone: `+9198765432${String(i).padStart(2, '0')}`,
      address: `${100 + i} Test Street, Test City`,
      role,
      departmentId: role === 'staff' ? Math.floor(Math.random() * 3) + 1 : null,
      isActive: Math.random() > 0.1, // 90% active
      isVerified: Math.random() > 0.05, // 95% verified
      loginAttempts: 0,
      lockedUntil: null,
      createdAt: new Date(2024, 0, 1 + i),
      updatedAt: new Date(2024, 0, 1 + i),
    });
  }

  return users;
};

module.exports = {
  mockUsers,
  mockRegistrationData,
  mockLoginData,
  generateMockUsers,
};