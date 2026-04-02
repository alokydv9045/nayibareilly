// Enhanced form validation utilities with comprehensive validation rules
import { z } from 'zod'

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character')

// Email validation schema
export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')

// Name validation schema
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters long')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces')

// Phone number validation schema
export const phoneSchema = z
  .string()
  .regex(/^[+]?[\d\s\-()]+$/, 'Please enter a valid phone number')
  .min(10, 'Phone number must be at least 10 digits')
  .max(15, 'Phone number must be less than 15 digits')
  .optional()

// User registration validation schema
export const userRegistrationSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    requestedRole: z.enum(['staff', 'moderator', 'dept_admin']).optional(),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: 'You must accept the terms and conditions'
    })
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
})

// Password reset validation schema
export const passwordResetSchema = z.object({
  email: emailSchema
})

// Password update validation schema
export const passwordUpdateSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your new password')
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword']
  })

// Profile update validation schema
export const profileUpdateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  avatarUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  departmentId: z.string().optional()
})

// Issue creation validation schema
export const issueCreateSchema = z.object({
  title: z
    .string()
    .min(10, 'Title must be at least 10 characters long')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters long')
    .max(5000, 'Description must be less than 5000 characters'),
  categoryId: z.string().optional(),
  categoryName: z.string().max(50, 'Category name must be less than 50 characters').optional(),
  location: z
    .object({
      latitude: z.number().min(-90).max(90).optional(),
      longitude: z.number().min(-180).max(180).optional(),
      address: z.string().max(500, 'Address must be less than 500 characters').optional(),
      landmark: z.string().max(200, 'Landmark must be less than 200 characters').optional(),
      ward: z.string().max(100, 'Ward must be less than 100 characters').optional(),
      zone: z.string().max(100, 'Zone must be less than 100 characters').optional()
    })
    .optional(),
  isAnonymous: z.boolean().optional()
})

// Issue comment validation schema
export const issueCommentSchema = z.object({
  content: z
    .string()
    .min(10, 'Comment must be at least 10 characters long')
    .max(2000, 'Comment must be less than 2000 characters'),
  isInternal: z.boolean().optional(),
  isPublic: z.boolean().optional()
})

// Issue status update validation schema
export const issueStatusUpdateSchema = z.object({
  status: z.enum([
    'PENDING',
    'TRIAGED',
    'ASSIGNED_TO_STAFF',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED',
    'ESCALATED',
    'REJECTED'
  ]),
  note: z.string().max(1000, 'Note must be less than 1000 characters').optional(),
  resolutionSummary: z.string().max(2000, 'Resolution summary must be less than 2000 characters').optional(),
  resolutionDetails: z.string().max(5000, 'Resolution details must be less than 5000 characters').optional(),
  resolutionCost: z.number().min(0, 'Resolution cost must be positive').optional()
})

// Department validation schema
export const departmentSchema = z.object({
  name: z
    .string()
    .min(2, 'Department name must be at least 2 characters long')
    .max(100, 'Department name must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(1000, 'Description must be less than 1000 characters'),
  code: z
    .string()
    .min(2, 'Department code must be at least 2 characters long')
    .max(10, 'Department code must be less than 10 characters')
    .regex(/^[A-Z0-9_]+$/, 'Department code can only contain uppercase letters, numbers, and underscores'),
  contactEmail: emailSchema.optional(),
  contactPhone: phoneSchema,
  slaHours: z.number().min(1, 'SLA hours must be at least 1').max(720, 'SLA hours must be less than 720 (30 days)'),
  priority: z.number().min(1, 'Priority must be at least 1').max(10, 'Priority must be less than 10'),
  budget: z.number().min(0, 'Budget must be positive'),
  headId: z.string().optional()
})

// Issue category validation schema
export const issueCategorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters long')
    .max(50, 'Category name must be less than 50 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(500, 'Description must be less than 500 characters'),
  icon: z.string().min(1, 'Icon is required'),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  slaHours: z.number().min(1, 'SLA hours must be at least 1').max(720, 'SLA hours must be less than 720'),
  requiresLocation: z.boolean(),
  requiresImages: z.boolean(),
  allowsAnonymous: z.boolean(),
  defaultDepartmentId: z.string().optional(),
  autoEscalateAfterHours: z.number().min(1).max(720).optional(),
  escalateToDepartmentId: z.string().optional()
})

// Search validation schema
export const searchSchema = z.object({
  query: z
    .string()
    .min(2, 'Search query must be at least 2 characters long')
    .max(100, 'Search query must be less than 100 characters')
    .optional()
})

// Filter validation schemas
export const issueFilterSchema = z.object({
  status: z.string().optional(),
  priority: z.string().optional(),
  category: z.string().uuid().optional(),
  department: z.string().uuid().optional(),
  assignedTo: z.string().optional(),
  user: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sort: z.enum(['newest', 'oldest', 'priority', 'votes', 'updated', 'status']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
})

export const userFilterSchema = z.object({
  role: z.string().optional(),
  status: z.enum(['active', 'inactive', 'verified', 'unverified']).optional(),
  department: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
  sort: z.enum(['newest', 'oldest', 'name', 'email', 'lastLogin']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional()
})

// File upload validation
export const fileUploadSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .max(5, 'Maximum 5 files allowed')
    .refine(
      files => files.every(file => file.size <= 10 * 1024 * 1024), // 10MB
      'Each file must be less than 10MB'
    )
    .refine(
      files => files.every(file => 
        ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
      ),
      'Only image files (JPEG, PNG, GIF, WebP) are allowed'
    )
})

// Custom validation functions
export const validators = {
  // Check if string is a valid UUID
  isUUID: (value: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(value)
  },

  // Check if password meets strength requirements
  isStrongPassword: (password: string): boolean => {
    return passwordSchema.safeParse(password).success
  },

  // Check if email is valid
  isValidEmail: (email: string): boolean => {
    return emailSchema.safeParse(email).success
  },

  // Check if phone number is valid
  isValidPhone: (phone: string): boolean => {
    return phoneSchema.safeParse(phone).success
  },

  // Check if URL is valid
  isValidURL: (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },

  // Check if date string is valid
  isValidDate: (date: string): boolean => {
    const parsedDate = new Date(date)
    return !isNaN(parsedDate.getTime())
  },

  // Check if coordinates are valid
  isValidCoordinates: (lat: number, lng: number): boolean => {
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
  },

  // Check if file is valid image
  isValidImage: (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    return allowedTypes.includes(file.type) && file.size <= 10 * 1024 * 1024
  },

  // Sanitize HTML content
  sanitizeHTML: (html: string): string => {
    // Basic HTML sanitization - in production, use a library like DOMPurify
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+="[^"]*"/gi, '')
      .replace(/javascript:/gi, '')
  },

  // Validate and sanitize user input
  sanitizeInput: (input: string, maxLength: number = 1000): string => {
    return input
      .trim()
      .slice(0, maxLength)
      .replace(/[<>]/g, '') // Remove potential HTML tags
  }
}

// Validation error formatter
export const formatValidationErrors = (errors: z.ZodError) => {
  return errors.issues.map((error) => ({
    field: error.path.join('.'),
    message: error.message,
    code: error.code
  }))
}

// Form validation hook
export const useFormValidation = <T extends z.ZodType>(schema: T) => {
  const validate = (data: unknown) => {
    const result = schema.safeParse(data)
    
    if (result.success) {
      return { data: result.data, errors: null }
    } else {
      return { data: null, errors: formatValidationErrors(result.error) }
    }
  }

  const validateField = (fieldName: string, value: unknown) => {
    try {
      // Type assertion for ZodObject with proper shape property
      const objectSchema = schema as unknown as z.ZodObject<Record<string, z.ZodTypeAny>>
      const fieldSchema = objectSchema.shape[fieldName]
      if (!fieldSchema) return null
      
      const result = fieldSchema.safeParse(value)
      return result.success ? null : result.error.issues[0].message
    } catch {
      return null
    }
  }

  return { validate, validateField }
}

// Export all schemas for easy importing
export const schemas = {
  userRegistration: userRegistrationSchema,
  login: loginSchema,
  passwordReset: passwordResetSchema,
  passwordUpdate: passwordUpdateSchema,
  profileUpdate: profileUpdateSchema,
  issueCreate: issueCreateSchema,
  issueComment: issueCommentSchema,
  issueStatusUpdate: issueStatusUpdateSchema,
  department: departmentSchema,
  issueCategory: issueCategorySchema,
  search: searchSchema,
  issueFilter: issueFilterSchema,
  userFilter: userFilterSchema,
  fileUpload: fileUploadSchema
}

export default schemas