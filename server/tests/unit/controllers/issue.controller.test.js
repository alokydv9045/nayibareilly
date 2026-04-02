const request = require('supertest');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const app = require('../../../src/server');
const { AppError } = require('../../../src/utils/errorHandler');

// Mock Prisma
jest.mock('@prisma/client');
const mockPrisma = {
  issue: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  department: {
    findMany: jest.fn(),
  },
  category: {
    findMany: jest.fn(),
  },
  issueUpdate: {
    create: jest.fn(),
  },
  notification: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
};

const prisma = mockPrisma;

// Mock file upload
jest.mock('multer');
jest.mock('fs');

// Mock authentication middleware
jest.mock('../../../src/middlewares/auth', () => ({
  authenticateToken: (req, res, next) => {
    req.user = {
      id: 1,
      email: 'test@example.com',
      role: 'citizen',
      name: 'Test User',
    };
    next();
  },
  requireRole: (roles) => (req, res, next) => {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
  },
}));

describe('Issue Controller', () => {
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

  describe('POST /api/issues', () => {
    const validIssueData = {
      title: 'Broken Street Light',
      description: 'The street light on Main Street is not working',
      location: '123 Main Street, City',
      latitude: 28.6139,
      longitude: 77.2090,
      categoryId: 1,
      departmentId: 1,
      priority: 'medium',
      isAnonymous: false,
    };

    const mockCategory = {
      id: 1,
      name: 'Infrastructure',
      isActive: true,
    };

    const mockDepartment = {
      id: 1,
      name: 'Public Works',
      isActive: true,
    };

    const mockCreatedIssue = {
      id: 1,
      issueNumber: 'ISS-2024-001',
      ...validIssueData,
      status: 'pending',
      userId: 1,
      createdAt: new Date(),
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
      },
      category: mockCategory,
      department: mockDepartment,
    };

    it('should create a new issue successfully', async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategory]);
      mockPrisma.department.findMany.mockResolvedValue([mockDepartment]);
      
      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          issue: {
            create: jest.fn().mockResolvedValue(mockCreatedIssue),
          },
          notification: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const response = await request(app)
        .post('/api/issues')
        .send(validIssueData)
        .expect(201);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Issue created successfully',
        data: {
          issue: {
            id: mockCreatedIssue.id,
            issueNumber: mockCreatedIssue.issueNumber,
            title: mockCreatedIssue.title,
            description: mockCreatedIssue.description,
            status: 'pending',
          },
        },
      });
    });

    it('should create issue with image upload', async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategory]);
      mockPrisma.department.findMany.mockResolvedValue([mockDepartment]);
      
      const mockIssueWithImage = {
        ...mockCreatedIssue,
        imageUrl: '/uploads/issues/test-image.jpg',
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          issue: {
            create: jest.fn().mockResolvedValue(mockIssueWithImage),
          },
          notification: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      // Create a test image file
      const testImagePath = path.join(__dirname, '../../fixtures/test-image.jpg');
      
      const response = await request(app)
        .post('/api/issues')
        .field('title', validIssueData.title)
        .field('description', validIssueData.description)
        .field('location', validIssueData.location)
        .field('latitude', validIssueData.latitude.toString())
        .field('longitude', validIssueData.longitude.toString())
        .field('categoryId', validIssueData.categoryId.toString())
        .field('departmentId', validIssueData.departmentId.toString())
        .field('priority', validIssueData.priority)
        .attach('image', Buffer.from('fake image data'), 'test-image.jpg')
        .expect(201);

      expect(response.body.data.issue.imageUrl).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteData = {
        title: 'Test Issue',
        // Missing description, location, etc.
      };

      const response = await request(app)
        .post('/api/issues')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should return 400 for invalid category', async () => {
      mockPrisma.category.findMany.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/issues')
        .send(validIssueData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid category');
    });

    it('should return 400 for invalid department', async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategory]);
      mockPrisma.department.findMany.mockResolvedValue([]);

      const response = await request(app)
        .post('/api/issues')
        .send(validIssueData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid department');
    });

    it('should validate image file type', async () => {
      const response = await request(app)
        .post('/api/issues')
        .field('title', validIssueData.title)
        .field('description', validIssueData.description)
        .field('location', validIssueData.location)
        .field('latitude', validIssueData.latitude.toString())
        .field('longitude', validIssueData.longitude.toString())
        .field('categoryId', validIssueData.categoryId.toString())
        .field('departmentId', validIssueData.departmentId.toString())
        .field('priority', validIssueData.priority)
        .attach('image', Buffer.from('fake pdf data'), 'test.pdf')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('image');
    });

    it('should validate image file size', async () => {
      const largeBuffer = Buffer.alloc(6 * 1024 * 1024); // 6MB

      const response = await request(app)
        .post('/api/issues')
        .field('title', validIssueData.title)
        .field('description', validIssueData.description)
        .field('location', validIssueData.location)
        .field('latitude', validIssueData.latitude.toString())
        .field('longitude', validIssueData.longitude.toString())
        .field('categoryId', validIssueData.categoryId.toString())
        .field('departmentId', validIssueData.departmentId.toString())
        .field('priority', validIssueData.priority)
        .attach('image', largeBuffer, 'large-image.jpg')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('size');
    });

    it('should validate coordinates', async () => {
      const invalidData = {
        ...validIssueData,
        latitude: 91, // Invalid latitude
        longitude: 181, // Invalid longitude
      };

      const response = await request(app)
        .post('/api/issues')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate priority values', async () => {
      const invalidData = {
        ...validIssueData,
        priority: 'invalid-priority',
      };

      const response = await request(app)
        .post('/api/issues')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('priority');
    });
  });

  describe('GET /api/issues', () => {
    const mockIssues = [
      {
        id: 1,
        issueNumber: 'ISS-2024-001',
        title: 'Broken Street Light',
        description: 'Street light not working',
        status: 'pending',
        priority: 'medium',
        location: '123 Main Street',
        createdAt: new Date('2024-01-01'),
        user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        category: {
          id: 1,
          name: 'Infrastructure',
        },
        department: {
          id: 1,
          name: 'Public Works',
        },
      },
      {
        id: 2,
        issueNumber: 'ISS-2024-002',
        title: 'Pothole on Road',
        description: 'Large pothole causing issues',
        status: 'in_progress',
        priority: 'high',
        location: '456 Second Street',
        createdAt: new Date('2024-01-02'),
        user: {
          id: 2,
          name: 'Another User',
          email: 'another@example.com',
        },
        category: {
          id: 1,
          name: 'Infrastructure',
        },
        department: {
          id: 1,
          name: 'Public Works',
        },
      },
    ];

    it('should list issues with default pagination', async () => {
      mockPrisma.issue.count.mockResolvedValue(2);
      mockPrisma.issue.findMany.mockResolvedValue(mockIssues);

      const response = await request(app)
        .get('/api/issues')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          issues: mockIssues,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        },
      });

      expect(mockPrisma.issue.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter issues by status', async () => {
      const pendingIssues = mockIssues.filter(issue => issue.status === 'pending');
      mockPrisma.issue.count.mockResolvedValue(1);
      mockPrisma.issue.findMany.mockResolvedValue(pendingIssues);

      const response = await request(app)
        .get('/api/issues?status=pending')
        .expect(200);

      expect(response.body.data.issues).toHaveLength(1);
      expect(response.body.data.issues[0].status).toBe('pending');

      expect(mockPrisma.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'pending',
          },
        })
      );
    });

    it('should filter issues by priority', async () => {
      const highPriorityIssues = mockIssues.filter(issue => issue.priority === 'high');
      mockPrisma.issue.count.mockResolvedValue(1);
      mockPrisma.issue.findMany.mockResolvedValue(highPriorityIssues);

      const response = await request(app)
        .get('/api/issues?priority=high')
        .expect(200);

      expect(response.body.data.issues[0].priority).toBe('high');

      expect(mockPrisma.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            priority: 'high',
          },
        })
      );
    });

    it('should filter issues by category', async () => {
      mockPrisma.issue.count.mockResolvedValue(2);
      mockPrisma.issue.findMany.mockResolvedValue(mockIssues);

      const response = await request(app)
        .get('/api/issues?categoryId=1')
        .expect(200);

      expect(mockPrisma.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            categoryId: 1,
          },
        })
      );
    });

    it('should filter issues by department', async () => {
      mockPrisma.issue.count.mockResolvedValue(2);
      mockPrisma.issue.findMany.mockResolvedValue(mockIssues);

      const response = await request(app)
        .get('/api/issues?departmentId=1')
        .expect(200);

      expect(mockPrisma.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            departmentId: 1,
          },
        })
      );
    });

    it('should search issues by keyword', async () => {
      const searchResults = [mockIssues[0]]; // Only street light issue
      mockPrisma.issue.count.mockResolvedValue(1);
      mockPrisma.issue.findMany.mockResolvedValue(searchResults);

      const response = await request(app)
        .get('/api/issues?search=street light')
        .expect(200);

      expect(mockPrisma.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              {
                title: {
                  contains: 'street light',
                  mode: 'insensitive',
                },
              },
              {
                description: {
                  contains: 'street light',
                  mode: 'insensitive',
                },
              },
              {
                location: {
                  contains: 'street light',
                  mode: 'insensitive',
                },
              },
            ],
          },
        })
      );
    });

    it('should filter issues by date range', async () => {
      mockPrisma.issue.count.mockResolvedValue(1);
      mockPrisma.issue.findMany.mockResolvedValue([mockIssues[0]]);

      const response = await request(app)
        .get('/api/issues?startDate=2024-01-01&endDate=2024-01-01')
        .expect(200);

      expect(mockPrisma.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            createdAt: {
              gte: new Date('2024-01-01T00:00:00.000Z'),
              lte: new Date('2024-01-01T23:59:59.999Z'),
            },
          },
        })
      );
    });

    it('should handle pagination correctly', async () => {
      mockPrisma.issue.count.mockResolvedValue(25);
      mockPrisma.issue.findMany.mockResolvedValue(mockIssues);

      const response = await request(app)
        .get('/api/issues?page=2&limit=5')
        .expect(200);

      expect(response.body.data.pagination).toMatchObject({
        page: 2,
        limit: 5,
        total: 25,
        totalPages: 5,
      });

      expect(mockPrisma.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });

    it('should sort issues by different fields', async () => {
      mockPrisma.issue.count.mockResolvedValue(2);
      mockPrisma.issue.findMany.mockResolvedValue(mockIssues);

      await request(app)
        .get('/api/issues?sortBy=priority&sortOrder=asc')
        .expect(200);

      expect(mockPrisma.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            priority: 'asc',
          },
        })
      );
    });

    it('should validate pagination parameters', async () => {
      const response = await request(app)
        .get('/api/issues?page=0&limit=101')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('validation');
    });

    it('should return issues for specific user', async () => {
      const userIssues = [mockIssues[0]];
      mockPrisma.issue.count.mockResolvedValue(1);
      mockPrisma.issue.findMany.mockResolvedValue(userIssues);

      const response = await request(app)
        .get('/api/issues?userId=1')
        .expect(200);

      expect(mockPrisma.issue.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: 1,
          },
        })
      );
    });
  });

  describe('GET /api/issues/:id', () => {
    const mockIssue = {
      id: 1,
      issueNumber: 'ISS-2024-001',
      title: 'Broken Street Light',
      description: 'Street light not working',
      status: 'pending',
      priority: 'medium',
      location: '123 Main Street',
      latitude: 28.6139,
      longitude: 77.2090,
      imageUrl: '/uploads/issues/image.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        phone: '+919876543210',
      },
      category: {
        id: 1,
        name: 'Infrastructure',
      },
      department: {
        id: 1,
        name: 'Public Works',
      },
      issueUpdates: [
        {
          id: 1,
          status: 'pending',
          message: 'Issue reported',
          createdAt: new Date(),
          user: {
            id: 1,
            name: 'Test User',
            role: 'citizen',
          },
        },
      ],
    };

    it('should get issue by ID successfully', async () => {
      mockPrisma.issue.findUnique.mockResolvedValue(mockIssue);

      const response = await request(app)
        .get('/api/issues/1')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        data: {
          issue: mockIssue,
        },
      });

      expect(mockPrisma.issue.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          issueUpdates: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    });

    it('should return 404 for non-existent issue', async () => {
      mockPrisma.issue.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/issues/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Issue not found');
    });

    it('should return 400 for invalid issue ID', async () => {
      const response = await request(app)
        .get('/api/issues/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid issue ID');
    });
  });

  describe('PUT /api/issues/:id/status', () => {
    const mockIssue = {
      id: 1,
      status: 'pending',
      userId: 1,
      title: 'Test Issue',
    };

    it('should update issue status successfully', async () => {
      mockPrisma.issue.findUnique.mockResolvedValue(mockIssue);
      
      const updatedIssue = {
        ...mockIssue,
        status: 'in_progress',
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          issue: {
            update: jest.fn().mockResolvedValue(updatedIssue),
          },
          issueUpdate: {
            create: jest.fn().mockResolvedValue({}),
          },
          notification: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const response = await request(app)
        .put('/api/issues/1/status')
        .send({
          status: 'in_progress',
          message: 'Work started on this issue',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Issue status updated successfully',
        data: {
          issue: updatedIssue,
        },
      });
    });

    it('should return 404 for non-existent issue', async () => {
      mockPrisma.issue.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/issues/999/status')
        .send({
          status: 'in_progress',
          message: 'Test message',
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Issue not found');
    });

    it('should validate status values', async () => {
      mockPrisma.issue.findUnique.mockResolvedValue(mockIssue);

      const response = await request(app)
        .put('/api/issues/1/status')
        .send({
          status: 'invalid-status',
          message: 'Test message',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid status');
    });

    it('should require message for status update', async () => {
      mockPrisma.issue.findUnique.mockResolvedValue(mockIssue);

      const response = await request(app)
        .put('/api/issues/1/status')
        .send({
          status: 'in_progress',
          // Missing message
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('message');
    });
  });

  describe('Access Control', () => {
    it('should allow citizens to view their own issues', async () => {
      const userIssue = {
        id: 1,
        userId: 1, // Same as req.user.id
        title: 'My Issue',
        status: 'pending',
      };

      mockPrisma.issue.findUnique.mockResolvedValue(userIssue);

      const response = await request(app)
        .get('/api/issues/1')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should prevent unauthorized access to other users issues', async () => {
      const otherUserIssue = {
        id: 1,
        userId: 2, // Different from req.user.id (1)
        title: 'Other User Issue',
        status: 'pending',
      };

      mockPrisma.issue.findUnique.mockResolvedValue(otherUserIssue);

      const response = await request(app)
        .get('/api/issues/1')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('access');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockPrisma.issue.findMany.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/issues')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('error');
    });

    it('should handle file upload errors', async () => {
      // Mock multer error
      const multerError = new Error('File too large');
      multerError.code = 'LIMIT_FILE_SIZE';

      const response = await request(app)
        .post('/api/issues')
        .field('title', 'Test Issue')
        .attach('image', Buffer.alloc(10 * 1024 * 1024), 'large.jpg') // 10MB
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Input Sanitization', () => {
    it('should sanitize HTML in issue content', async () => {
      const maliciousData = {
        title: '<script>alert("xss")</script>Test Issue',
        description: '<img src="x" onerror="alert(1)">Description',
        location: '123 Main St',
        latitude: 28.6139,
        longitude: 77.2090,
        categoryId: 1,
        departmentId: 1,
        priority: 'medium',
      };

      mockPrisma.category.findMany.mockResolvedValue([{ id: 1, name: 'Test', isActive: true }]);
      mockPrisma.department.findMany.mockResolvedValue([{ id: 1, name: 'Test', isActive: true }]);

      const sanitizedIssue = {
        id: 1,
        title: 'Test Issue', // HTML stripped
        description: 'Description', // HTML stripped
        ...maliciousData,
        status: 'pending',
        userId: 1,
      };

      mockPrisma.$transaction.mockImplementation(async (callback) => {
        return callback({
          issue: {
            create: jest.fn().mockResolvedValue(sanitizedIssue),
          },
          notification: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      const response = await request(app)
        .post('/api/issues')
        .send(maliciousData)
        .expect(201);

      expect(response.body.data.issue.title).not.toContain('<script>');
      expect(response.body.data.issue.description).not.toContain('<img');
    });
  });
});