import { z } from 'zod';
import { Language, t } from '@/lib/utils/translations';

// Location data interface
export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
}

// Photo file interface
export interface PhotoFile {
  id: string;
  file: File;
  preview: string;
  uploadProgress?: number;
  error?: string;
  compressed?: boolean;
}

// Contact information (for non-authenticated users)
export interface ContactInfo {
  name?: string;
  email?: string;
  phone?: string;
  allowPublicDisplay?: boolean;
}

// Create validation schema with bilingual error messages
export const createReportFormSchema = (language: Language = 'en') => {
  return z.object({
    // Issue Title - required, 10-80 characters
    title: z
      .string()
      .min(1, t('errors.required', language))
      .min(10, t('errors.titleTooShort', language))
      .max(80, t('errors.titleTooLong', language))
      .trim(),

    // Category - required selection from predefined options
    category: z
      .enum(['roads', 'streetlights', 'sanitation', 'water', 'parks', 'safety', 'other'] as const, {
        message: t('errors.categoryRequired', language),
      }),

    // Description - required, 20-500 characters (can be voice transcribed)
    description: z
      .string()
      .min(1, t('errors.required', language))
      .min(20, t('errors.descriptionTooShort', language))
      .max(500, t('errors.descriptionTooLong', language))
      .trim(),

    // Location - required coordinates and optional address
    location: z
      .object({
        latitude: z
          .number()
          .min(-90, 'Invalid latitude')
          .max(90, 'Invalid latitude'),
        longitude: z
          .number()
          .min(-180, 'Invalid longitude')
          .max(180, 'Invalid longitude'),
        address: z.string().optional(),
        accuracy: z.number().optional(),
      }, {
        message: t('errors.locationRequired', language),
      })
      .optional(),

    // Photos - required 2-3 images
    photos: z
      .array(z.object({
        id: z.string(),
        file: z.instanceof(File),
        preview: z.string(),
        uploadProgress: z.number().optional(),
        error: z.string().optional(),
        compressed: z.boolean().optional(),
      }))
      .min(2, t('errors.photosRequired', language))
      .max(3, t('errors.photosTooMany', language)),

    // Contact info (only for non-authenticated users)
    contact: z
      .object({
        name: z.string().optional(),
        email: z.string().email('Invalid email format').optional().or(z.literal('')),
        phone: z.string().optional(),
        allowPublicDisplay: z.boolean().optional().default(false),
      })
      .optional(),

    // Priority level
    priority: z
      .enum(['low', 'medium', 'high', 'critical'] as const, {
        message: 'Priority is required',
      })
      .default('medium'),

    // Voice transcription metadata (optional)
    voiceMetadata: z
      .object({
        language: z.enum(['hi-IN', 'en-IN']).optional(),
        confidence: z.number().min(0).max(1).optional(),
        duration: z.number().optional(),
        hasAudioClip: z.boolean().default(false),
      })
      .optional(),

    // Draft saving metadata
    isDraft: z.boolean().default(false),
    draftId: z.string().optional(),
  });
};

// Form data type
export type ReportFormData = z.infer<ReturnType<typeof createReportFormSchema>>;

// Validation utilities
export const validatePhotos = (photos: PhotoFile[], language: Language = 'en') => {
  const errors: string[] = [];
  
  if (photos.length < 2) {
    errors.push(t('errors.photosRequired', language));
  }
  
  if (photos.length > 3) {
    errors.push(t('errors.photosTooMany', language));
  }
  
  photos.forEach((photo, index) => {
    // Check file size (10MB limit)
    if (photo.file.size > 10 * 1024 * 1024) {
      errors.push(`Photo ${index + 1}: ${t('errors.photoTooLarge', language)}`);
    }
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
    if (!allowedTypes.includes(photo.file.type)) {
      errors.push(`Photo ${index + 1}: ${t('errors.photoInvalidType', language)}`);
    }
  });
  
  return errors;
};

export const validateLocation = (location: LocationData | null, language: Language = 'en') => {
  if (!location) {
    return t('errors.locationRequired', language);
  }
  
  if (location.latitude < -90 || location.latitude > 90) {
    return 'Invalid latitude coordinates';
  }
  
  if (location.longitude < -180 || location.longitude > 180) {
    return 'Invalid longitude coordinates';
  }
  
  return null;
};

// Field validation helpers for real-time validation
export const validateTitle = (title: string, language: Language = 'en') => {
  if (!title || title.trim().length === 0) {
    return t('errors.required', language);
  }
  if (title.trim().length < 10) {
    return t('errors.titleTooShort', language);
  }
  if (title.trim().length > 80) {
    return t('errors.titleTooLong', language);
  }
  return null;
};

export const validateDescription = (description: string, language: Language = 'en') => {
  if (!description || description.trim().length === 0) {
    return t('errors.required', language);
  }
  if (description.trim().length < 20) {
    return t('errors.descriptionTooShort', language);
  }
  if (description.trim().length > 500) {
    return t('errors.descriptionTooLong', language);
  }
  return null;
};

export const validateCategory = (category: string | null, language: Language = 'en') => {
  if (!category) {
    return t('errors.categoryRequired', language);
  }
  
  const validCategories = ['roads', 'streetlights', 'sanitation', 'water', 'parks', 'safety', 'other'];
  if (!validCategories.includes(category)) {
    return t('errors.categoryRequired', language);
  }
  
  return null;
};

// Form completion checker
export const isFormComplete = (data: Partial<ReportFormData>) => {
  return !!(
    data.title && 
    data.title.length >= 10 &&
    data.category &&
    data.description && 
    data.description.length >= 20 &&
    data.location &&
    data.photos && 
    data.photos.length >= 2 && 
    data.photos.length <= 3
  );
};

// Progress calculation
export const calculateFormProgress = (data: Partial<ReportFormData>) => {
  let completed = 0;
  const total = 5; // title, category, description, location, photos
  
  if (data.title && data.title.length >= 10) completed++;
  if (data.category) completed++;
  if (data.description && data.description.length >= 20) completed++;
  if (data.location) completed++;
  if (data.photos && data.photos.length >= 2) completed++;
  
  return Math.round((completed / total) * 100);
};

// Export categories for the UI
export const ISSUE_CATEGORIES = [
  { 
    id: 'roads', 
    icon: '🚗', 
    enName: 'Roads & Transport',
    hiName: 'सड़क और परिवहन',
    description: 'Potholes, traffic signals, parking'
  },
  { 
    id: 'streetlights', 
    icon: '💡', 
    enName: 'Street Lights',
    hiName: 'स्ट्रीट लाइट',
    description: 'Broken lights, electrical issues'
  },
  { 
    id: 'sanitation', 
    icon: '🗑️', 
    enName: 'Sanitation & Waste',
    hiName: 'स्वच्छता और कचरा',
    description: 'Garbage collection, cleanliness'
  },
  { 
    id: 'water', 
    icon: '💧', 
    enName: 'Water Supply',
    hiName: 'पानी की आपूर्ति',
    description: 'Shortage, leakage, quality issues'
  },
  { 
    id: 'parks', 
    icon: '🌳', 
    enName: 'Parks & Recreation',
    hiName: 'पार्क और मनोरंजन',
    description: 'Maintenance, facilities, safety'
  },
  { 
    id: 'safety', 
    icon: '🛡️', 
    enName: 'Public Safety',
    hiName: 'सार्वजनिक सुरक्षा',
    description: 'Crime, accidents, security concerns'
  },
  { 
    id: 'other', 
    icon: '📋', 
    enName: 'Other Issues',
    hiName: 'अन्य समस्याएं',
    description: 'General civic concerns'
  },
] as const;

export const PRIORITY_LEVELS = [
  { 
    id: 'low', 
    enName: 'Low Priority',
    hiName: 'कम प्राथमिकता',
    description: 'Non-urgent, can wait',
    color: 'bg-slate-500'
  },
  { 
    id: 'medium', 
    enName: 'Medium Priority',
    hiName: 'मध्यम प्राथमिकता',
    description: 'Moderate urgency',
    color: 'bg-emerald-500'
  },
  { 
    id: 'high', 
    enName: 'High Priority',
    hiName: 'उच्च प्राथमिकता',
    description: 'Needs quick attention',
    color: 'bg-orange-500'
  },
  { 
    id: 'critical', 
    enName: 'Critical',
    hiName: 'अत्यंत गंभीर',
    description: 'Immediate action required',
    color: 'bg-red-500'
  },
] as const;

// Status definitions for tracking
export const ISSUE_STATUSES = [
  { 
    id: 'new', 
    enName: 'New',
    hiName: 'नया',
    color: 'bg-emerald-500'
  },
  { 
    id: 'triaged', 
    enName: 'Under Review',
    hiName: 'समीक्षाधीन',
    color: 'bg-yellow-500'
  },
  { 
    id: 'assigned', 
    enName: 'Assigned',
    hiName: 'सौंपा गया',
    color: 'bg-slate-700'
  },
  { 
    id: 'in-progress', 
    enName: 'In Progress',
    hiName: 'प्रगति में',
    color: 'bg-orange-500'
  },
  { 
    id: 'on-hold', 
    enName: 'On Hold',
    hiName: 'रोक पर',
    color: 'bg-slate-500'
  },
  { 
    id: 'resolved', 
    enName: 'Resolved',
    hiName: 'हल हो गया',
    color: 'bg-green-500'
  },
  { 
    id: 'rejected', 
    enName: 'Rejected',
    hiName: 'अस्वीकृत',
    color: 'bg-red-500'
  },
] as const;