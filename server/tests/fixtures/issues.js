// Mock issue data for testing
const mockIssues = {
  pending: {
    id: 1,
    issueNumber: 'ISS-2024-001',
    title: 'Broken Street Light',
    description: 'The street light on Main Street is not working properly. It has been flickering for the past week and now completely stopped working.',
    location: '123 Main Street, Test City',
    latitude: 28.6139,
    longitude: 77.2090,
    priority: 'medium',
    status: 'pending',
    isAnonymous: false,
    imageUrl: '/uploads/issues/streetlight-001.jpg',
    userId: 1,
    categoryId: 1,
    departmentId: 1,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-01T10:00:00Z'),
  },

  inProgress: {
    id: 2,
    issueNumber: 'ISS-2024-002',
    title: 'Pothole on Road',
    description: 'Large pothole on Second Street causing problems for vehicles. The hole is approximately 2 feet wide and 6 inches deep.',
    location: '456 Second Street, Test City',
    latitude: 28.6140,
    longitude: 77.2091,
    priority: 'high',
    status: 'in_progress',
    isAnonymous: false,
    imageUrl: '/uploads/issues/pothole-002.jpg',
    userId: 2,
    categoryId: 1,
    departmentId: 1,
    createdAt: new Date('2024-01-02T14:30:00Z'),
    updatedAt: new Date('2024-01-03T09:15:00Z'),
  },

  resolved: {
    id: 3,
    issueNumber: 'ISS-2024-003',
    title: 'Garbage Collection Issue',
    description: 'Garbage has not been collected from Third Street for over a week. The bins are overflowing.',
    location: '789 Third Street, Test City',
    latitude: 28.6141,
    longitude: 77.2092,
    priority: 'high',
    status: 'resolved',
    isAnonymous: false,
    imageUrl: '/uploads/issues/garbage-003.jpg',
    userId: 1,
    categoryId: 2,
    departmentId: 2,
    createdAt: new Date('2024-01-03T08:00:00Z'),
    updatedAt: new Date('2024-01-05T16:45:00Z'),
  },

  rejected: {
    id: 4,
    issueNumber: 'ISS-2024-004',
    title: 'Invalid Issue Report',
    description: 'This is not a valid civic issue. Personal complaint about neighbor.',
    location: '101 Fourth Street, Test City',
    latitude: 28.6142,
    longitude: 77.2093,
    priority: 'low',
    status: 'rejected',
    isAnonymous: true,
    imageUrl: null,
    userId: 3,
    categoryId: 3,
    departmentId: 3,
    createdAt: new Date('2024-01-04T12:20:00Z'),
    updatedAt: new Date('2024-01-04T16:30:00Z'),
  },

  anonymous: {
    id: 5,
    issueNumber: 'ISS-2024-005',
    title: 'Water Leakage',
    description: 'There is a water pipe leakage on Fifth Street. Water is being wasted continuously.',
    location: '202 Fifth Street, Test City',
    latitude: 28.6143,
    longitude: 77.2094,
    priority: 'high',
    status: 'pending',
    isAnonymous: true,
    imageUrl: '/uploads/issues/water-leak-005.jpg',
    userId: 4,
    categoryId: 4,
    departmentId: 4,
    createdAt: new Date('2024-01-05T07:45:00Z'),
    updatedAt: new Date('2024-01-05T07:45:00Z'),
  },

  withUpdates: {
    id: 6,
    issueNumber: 'ISS-2024-006',
    title: 'Park Maintenance Required',
    description: 'The park equipment needs maintenance. Swings are broken and the area needs cleaning.',
    location: 'Central Park, Test City',
    latitude: 28.6144,
    longitude: 77.2095,
    priority: 'medium',
    status: 'in_progress',
    isAnonymous: false,
    imageUrl: '/uploads/issues/park-006.jpg',
    userId: 2,
    categoryId: 5,
    departmentId: 5,
    createdAt: new Date('2024-01-06T11:00:00Z'),
    updatedAt: new Date('2024-01-07T14:20:00Z'),
  },
};

// Mock issue creation data
const mockIssueCreationData = {
  valid: {
    title: 'New Test Issue',
    description: 'This is a test issue for validation purposes.',
    location: '123 Test Street, Test City',
    latitude: 28.6139,
    longitude: 77.2090,
    categoryId: 1,
    departmentId: 1,
    priority: 'medium',
    isAnonymous: false,
  },

  withImage: {
    title: 'Issue with Image',
    description: 'Test issue that includes an image upload.',
    location: '456 Image Street, Test City',
    latitude: 28.6140,
    longitude: 77.2091,
    categoryId: 1,
    departmentId: 1,
    priority: 'high',
    isAnonymous: false,
    // image will be attached as file
  },

  anonymous: {
    title: 'Anonymous Issue Report',
    description: 'This issue is reported anonymously.',
    location: '789 Anonymous Street, Test City',
    latitude: 28.6141,
    longitude: 77.2092,
    categoryId: 2,
    departmentId: 2,
    priority: 'low',
    isAnonymous: true,
  },

  missingTitle: {
    // title missing
    description: 'Issue without title for validation testing.',
    location: '101 Missing Title Street, Test City',
    latitude: 28.6142,
    longitude: 77.2093,
    categoryId: 1,
    departmentId: 1,
    priority: 'medium',
    isAnonymous: false,
  },

  missingDescription: {
    title: 'Issue Missing Description',
    // description missing
    location: '202 Missing Description Street, Test City',
    latitude: 28.6143,
    longitude: 77.2094,
    categoryId: 1,
    departmentId: 1,
    priority: 'medium',
    isAnonymous: false,
  },

  invalidCoordinates: {
    title: 'Issue with Invalid Coordinates',
    description: 'Test issue with invalid latitude and longitude.',
    location: '303 Invalid Coords Street, Test City',
    latitude: 91, // Invalid latitude (> 90)
    longitude: 181, // Invalid longitude (> 180)
    categoryId: 1,
    departmentId: 1,
    priority: 'medium',
    isAnonymous: false,
  },

  invalidPriority: {
    title: 'Issue with Invalid Priority',
    description: 'Test issue with invalid priority value.',
    location: '404 Invalid Priority Street, Test City',
    latitude: 28.6144,
    longitude: 77.2095,
    categoryId: 1,
    departmentId: 1,
    priority: 'invalid-priority',
    isAnonymous: false,
  },

  invalidCategory: {
    title: 'Issue with Invalid Category',
    description: 'Test issue with non-existent category.',
    location: '505 Invalid Category Street, Test City',
    latitude: 28.6145,
    longitude: 77.2096,
    categoryId: 999, // Non-existent category
    departmentId: 1,
    priority: 'medium',
    isAnonymous: false,
  },

  invalidDepartment: {
    title: 'Issue with Invalid Department',
    description: 'Test issue with non-existent department.',
    location: '606 Invalid Department Street, Test City',
    latitude: 28.6146,
    longitude: 77.2097,
    categoryId: 1,
    departmentId: 999, // Non-existent department
    priority: 'medium',
    isAnonymous: false,
  },
};

// Mock issue update data
const mockIssueUpdateData = {
  statusUpdate: {
    status: 'in_progress',
    message: 'Work has started on this issue. Our team has been assigned and will begin repairs shortly.',
  },

  resolveUpdate: {
    status: 'resolved',
    message: 'Issue has been successfully resolved. The problem has been fixed and tested.',
  },

  rejectUpdate: {
    status: 'rejected',
    message: 'This issue has been rejected as it does not fall under civic responsibilities.',
  },

  invalidStatus: {
    status: 'invalid-status',
    message: 'Testing with invalid status value.',
  },

  missingMessage: {
    status: 'in_progress',
    // message missing
  },

  emptyMessage: {
    status: 'in_progress',
    message: '',
  },
};

// Mock issue filters for testing list endpoints
const mockIssueFilters = {
  byStatus: {
    pending: { status: 'pending' },
    inProgress: { status: 'in_progress' },
    resolved: { status: 'resolved' },
    rejected: { status: 'rejected' },
  },

  byPriority: {
    low: { priority: 'low' },
    medium: { priority: 'medium' },
    high: { priority: 'high' },
    critical: { priority: 'critical' },
  },

  byCategory: {
    infrastructure: { categoryId: 1 },
    sanitation: { categoryId: 2 },
    utilities: { categoryId: 3 },
  },

  byDepartment: {
    publicWorks: { departmentId: 1 },
    sanitation: { departmentId: 2 },
    utilities: { departmentId: 3 },
  },

  byDateRange: {
    today: {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    lastWeek: {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
    lastMonth: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  },

  bySearch: {
    streetLight: { search: 'street light' },
    pothole: { search: 'pothole' },
    garbage: { search: 'garbage' },
    water: { search: 'water' },
  },

  byUser: {
    user1: { userId: 1 },
    user2: { userId: 2 },
    user3: { userId: 3 },
  },

  pagination: {
    firstPage: { page: 1, limit: 10 },
    secondPage: { page: 2, limit: 10 },
    smallLimit: { page: 1, limit: 5 },
    largeLimit: { page: 1, limit: 50 },
  },

  sorting: {
    newestFirst: { sortBy: 'createdAt', sortOrder: 'desc' },
    oldestFirst: { sortBy: 'createdAt', sortOrder: 'asc' },
    titleAsc: { sortBy: 'title', sortOrder: 'asc' },
    titleDesc: { sortBy: 'title', sortOrder: 'desc' },
    priorityAsc: { sortBy: 'priority', sortOrder: 'asc' },
    priorityDesc: { sortBy: 'priority', sortOrder: 'desc' },
  },

  combined: {
    highPriorityPending: {
      status: 'pending',
      priority: 'high',
    },
    infrastructureInProgress: {
      status: 'in_progress',
      categoryId: 1,
    },
    recentHighPriority: {
      priority: 'high',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    },
  },
};

// Generate multiple issues for testing pagination and bulk operations
const generateMockIssues = (count = 20, options = {}) => {
  const {
    statusDistribution = { pending: 0.4, in_progress: 0.3, resolved: 0.2, rejected: 0.1 },
    priorityDistribution = { low: 0.2, medium: 0.5, high: 0.25, critical: 0.05 },
    userIds = [1, 2, 3, 4, 5],
    categoryIds = [1, 2, 3, 4, 5],
    departmentIds = [1, 2, 3, 4, 5],
  } = options;

  const statuses = Object.keys(statusDistribution);
  const priorities = Object.keys(priorityDistribution);
  const issues = [];

  for (let i = 0; i < count; i++) {
    // Select status based on distribution
    let statusRandom = Math.random();
    let selectedStatus = 'pending';
    let cumulative = 0;
    for (const [status, prob] of Object.entries(statusDistribution)) {
      cumulative += prob;
      if (statusRandom <= cumulative) {
        selectedStatus = status;
        break;
      }
    }

    // Select priority based on distribution
    let priorityRandom = Math.random();
    let selectedPriority = 'medium';
    cumulative = 0;
    for (const [priority, prob] of Object.entries(priorityDistribution)) {
      cumulative += prob;
      if (priorityRandom <= cumulative) {
        selectedPriority = priority;
        break;
      }
    }

    // Random date within last 6 months
    const randomDate = new Date(Date.now() - Math.random() * 6 * 30 * 24 * 60 * 60 * 1000);

    issues.push({
      id: 1000 + i,
      issueNumber: `ISS-2024-${String(1000 + i).padStart(4, '0')}`,
      title: `Generated Issue ${i + 1}`,
      description: `This is a generated test issue number ${i + 1} for testing purposes.`,
      location: `${1000 + i} Generated Street, Test City`,
      latitude: 28.6139 + (Math.random() - 0.5) * 0.1,
      longitude: 77.2090 + (Math.random() - 0.5) * 0.1,
      priority: selectedPriority,
      status: selectedStatus,
      isAnonymous: Math.random() > 0.8, // 20% anonymous
      imageUrl: Math.random() > 0.5 ? `/uploads/issues/generated-${1000 + i}.jpg` : null,
      userId: userIds[Math.floor(Math.random() * userIds.length)],
      categoryId: categoryIds[Math.floor(Math.random() * categoryIds.length)],
      departmentId: departmentIds[Math.floor(Math.random() * departmentIds.length)],
      createdAt: randomDate,
      updatedAt: new Date(randomDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
  }

  return issues.sort((a, b) => b.createdAt - a.createdAt); // Sort by newest first
};

module.exports = {
  mockIssues,
  mockIssueCreationData,
  mockIssueUpdateData,
  mockIssueFilters,
  generateMockIssues,
};