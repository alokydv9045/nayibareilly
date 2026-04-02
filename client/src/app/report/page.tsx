"use client"

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// Layout and Auth
import RequireUser from '@/components/features/auth/RequireUser';
import CitizenLayout from '@/components/layout/CitizenLayout';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  Save, 
  Send, 
  Languages,
  Clock,
  MapPin,
  Camera,
  FileText
} from 'lucide-react';

// Custom Components
import VoiceInput from '@/components/ui/VoiceInput';
import LocationPicker from '@/components/ui/LocationPicker';
import PhotoUpload from '@/components/ui/PhotoUpload';
import { DuplicateIssuesModal, type DuplicateIssue } from '@/components/ui/DuplicateIssuesModal';

// Utilities and Types
import { cn } from '@/lib/utils/helpers';
import { useTranslation, Language } from '@/lib/utils/translations';
import { 
  createReportFormSchema, 
  ReportFormData, 
  ISSUE_CATEGORIES,
  calculateFormProgress,
  LocationData,
  PhotoFile
} from '@/lib/validations/reportForm';
import { useCreateIssue } from '@/hooks/api/useIssues';
import apiClient from '@/lib/api/endpoints';

// type FormStep = 'details' | 'location' | 'description' | 'photos' | 'review';

export default function EnhancedReportPage() {
  // Language and translations
  const [language, setLanguage] = useState<Language>('en');
  const t = useTranslation(language);
  
  // Form state
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  
  // Duplicate detection state
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateIssue[]>([]);
  const [pendingSubmission, setPendingSubmission] = useState<Record<string, unknown> | null>(null);
  const [_checkingDuplicates, setCheckingDuplicates] = useState(false);
  
  // Hooks
  const router = useRouter();
  const { mutate: createIssue } = useCreateIssue();
  
  // Form setup
  const schema = useMemo(() => createReportFormSchema(language), [language]);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      category: 'roads',
      description: '',
      priority: 'medium',
      photos: [],
      location: undefined,
      contact: {
        allowPublicDisplay: false
      },
      isDraft: false
    },
    mode: 'onChange'
  });

  const watchedFields = watch();
  
  // Calculate form progress
  const progress = useMemo(() => {
    return calculateFormProgress({
      ...watchedFields,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        accuracy: location.accuracy
      } : undefined,
      photos
    } as Partial<ReportFormData>);
  }, [watchedFields, location, photos]);

  // Auto-save draft functionality
  const saveDraft = useCallback(() => {
    const draftData = {
      ...getValues(),
      location,
      photos: photos.map(p => ({ ...p, file: undefined })), // Don't save file objects
      isDraft: true,
      lastSaved: new Date().toISOString()
    };
    
    localStorage.setItem('reportDraft', JSON.stringify(draftData));
    setIsDraft(true);
    toast.success(t.saveDraft + ' saved');
  }, [getValues, location, photos, t.saveDraft]);

  useEffect(() => {
    const autoSave = setTimeout(() => {
      if (progress > 0 && !isSubmitting) {
        saveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [saveDraft, progress, isSubmitting]);

  // Load saved draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('reportDraft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        reset(draft);
        if (draft.location) setLocation(draft.location);
        if (draft.photos) setPhotos(draft.photos);
        toast.success('Draft loaded');
      } catch {
        // Silent fail for draft loading
      }
    }
  }, [reset]);

  // Language detection from browser
  useEffect(() => {
    const browserLang = navigator.language;
    if (browserLang.startsWith('hi')) {
      setLanguage('hi');
    }
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem('reportDraft');
    setIsDraft(false);
  }, []);

  // Check for duplicate issues near the location
  const checkForDuplicates = useCallback(async (data: Record<string, unknown>) => {
    const locationData = data.location as { latitude?: number; longitude?: number; categoryId?: string } | undefined;
    
    if (!locationData?.latitude || !locationData?.longitude) {
      // No location, skip duplicate check
      return []
    }

    setCheckingDuplicates(true);
    try {
      const response = await apiClient.checkDuplicates({
        lat: locationData.latitude,
        lng: locationData.longitude,
        categoryId: locationData.categoryId,
        radius: 500
      });

      return response.data?.duplicates || []
    } catch {
      // Silent fail - don't block submission on duplicate check failure
      return []
    } finally {
      setCheckingDuplicates(false);
    }
  }, []);

  // Submit the issue (actual submission logic)
  const submitIssue = useCallback(async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    
    try {
      const locationData = data.location as { latitude?: number; longitude?: number; address?: string } | undefined;
      
      const payload = {
        title: String(data.title || ''),
        description: String(data.description || ''),
        category: String(data.category || ''),
        priority: (data.priority || 'medium') as 'low' | 'medium' | 'high' | 'critical',
        location: locationData?.latitude ? {
          latitude: Number(locationData.latitude),
          longitude: Number(locationData.longitude || 0),
          address: locationData.address
        } : undefined,
        attachments: photos.map(p => p.file)
      };

      createIssue(payload, {
        onSuccess: (response) => {
          toast.success(t.submissionSuccess);
          clearDraft();
          
          // Store submitted data for review page
          const submittedData = {
            id: response.id,
            title: String(data.title || ''),
            category: String(data.category || ''),
            description: String(data.description || ''),
            priority: (data.priority || 'medium') as 'low' | 'medium' | 'high' | 'critical',
            location: location,
            photos: photos,
            submittedAt: new Date().toISOString(),
            trackingNumber: `NGR-${Date.now().toString().slice(-6)}`
          };
          
          localStorage.setItem('lastSubmittedReport', JSON.stringify(submittedData));
          
          // Navigate to success page with tracking ID
          router.push(`/report/success?id=${response.id}`);
        },
        onError: () => {
          toast.error(t.submissionError);
          setIsSubmitting(false);
        }
      });
    } catch {
      toast.error(t.submissionError);
      setIsSubmitting(false);
    }
  }, [photos, createIssue, t.submissionSuccess, t.submissionError, clearDraft, router, location]);

  // Main submit handler - checks for duplicates first
  const onSubmit = useCallback(async (data: Record<string, unknown>) => {
    // Check for duplicates
    const foundDuplicates = await checkForDuplicates(data);
    
    if (foundDuplicates.length > 0) {
      // Show duplicates modal
      setDuplicates(foundDuplicates);
      setPendingSubmission(data);
      setShowDuplicatesModal(true);
    } else {
      // No duplicates, submit directly
      await submitIssue(data);
    }
  }, [checkForDuplicates, submitIssue]);

  // Handle "Submit Anyway" from duplicates modal
  const handleSubmitAnyway = useCallback(async () => {
    if (pendingSubmission) {
      setShowDuplicatesModal(false);
      await submitIssue(pendingSubmission);
      setPendingSubmission(null);
      setDuplicates([]);
    }
  }, [pendingSubmission, submitIssue]);

  const handleVoiceTranscription = useCallback((transcript: string) => {
    setValue('description', transcript, { shouldValidate: true });
  }, [setValue]);

  // Form validation
  const isFormValid = useMemo(() => {
    const current = {
      ...watchedFields,
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        accuracy: location.accuracy
      } : undefined,
      photos
    };
    
    return !!(
      current.title && current.title.length >= 10 &&
      current.category &&
      current.location &&
      current.description && current.description.length >= 20 &&
      current.photos && current.photos.length >= 2 && current.photos.length <= 3
    );
  }, [watchedFields, location, photos]);

  return (
    <RequireUser>
      <CitizenLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4 lg:py-8">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 sm:mb-4">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900">
                    {t.pageTitle}
                  </h1>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">
                    {t.pageSubtitle}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                  className="flex items-center gap-2 self-start sm:self-center min-h-[36px] touch-manipulation"
                >
                  <Languages className="h-4 w-4" />
                  <span className="hidden sm:inline">{language === 'en' ? 'हिंदी' : 'English'}</span>
                  <span className="sm:hidden">{language === 'en' ? 'हिं' : 'EN'}</span>
                </Button>
              </div>
              <div className="space-y-2 bg-white rounded-lg p-3 sm:p-4 shadow-sm border">
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="font-medium">Progress</span>
                  <span>{progress}% complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              {isDraft && (
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-600 bg-blue-50 p-2 rounded-lg">
                  <Clock className="h-4 w-4 flex-shrink-0" />
                  <span>Draft saved automatically</span>
                </div>
              )}
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="mb-4 sm:mb-6">
                <CardContent className="p-3 sm:p-4 lg:p-6 space-y-6 sm:space-y-8">
                  {/* Details */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t.title} *
                      </label>
                      <Input
                        {...register('title')}
                        placeholder={t.titlePlaceholder}
                        className={cn('min-h-[44px] text-base', errors.title && 'border-red-500')}
                        maxLength={80}
                      />
                      <div className="flex justify-between mt-1">
                        {errors.title && (
                          <p className="text-sm text-red-500">{errors.title.message}</p>
                        )}
                        <p className="text-xs text-gray-500 ml-auto">
                          {watchedFields.title?.length || 0}/80
                        </p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{t.titleHelper}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {t.category} *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                        {ISSUE_CATEGORIES.map((category) => (
                          <Card
                            key={category.id}
                            className={cn(
                              'cursor-pointer transition-all hover:shadow-md touch-manipulation',
                              watchedFields.category === category.id
                                ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                                : 'hover:border-gray-300'
                            )}
                            onClick={() => setValue('category', category.id as ReportFormData['category'], { shouldValidate: true })}
                          >
                            <CardContent className="p-3 sm:p-4">
                              <div className="flex items-start gap-3">
                                <span className="text-xl sm:text-2xl" aria-hidden="true">
                                  {category.icon}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                    {language === 'hi' ? category.hiName : category.enName}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {category.description}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {errors.category && (
                        <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                      )}
                    </div>
                  </div>
                  {/* Location */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium mb-2">
                      {t.location} *
                    </label>
                    <LocationPicker
                      value={location}
                      onChange={(loc) => {
                        setLocation(loc);
                        setValue('location', loc as ReportFormData['location'], { shouldValidate: true });
                      }}
                      language={language}
                      required={true}
                    />
                  </div>
                  {/* Description */}
                  <div className="space-y-6">
                    <label className="block text-sm font-medium mb-2">
                      {t.description} *
                    </label>
                    <VoiceInput
                      value={watchedFields.description || ''}
                      onChange={handleVoiceTranscription}
                      language={language}
                      placeholder={t.descriptionPlaceholder}
                      className="mb-4"
                    />
                    <Textarea
                      {...register('description')}
                      placeholder={t.descriptionPlaceholder}
                      rows={4}
                      className={cn('min-h-[120px] text-base resize-none', errors.description && 'border-red-500')}
                      maxLength={1000}
                    />
                    <div className="flex justify-between mt-1">
                      {errors.description && (
                        <p className="text-sm text-red-500">{errors.description.message}</p>
                      )}
                      <p className="text-xs text-gray-500 ml-auto">
                        {watchedFields.description?.length || 0}/1000
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{t.descriptionHelper}</p>
                  </div>
                  {/* Photos */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium mb-2">
                      {t.photos} *
                    </label>
                    <PhotoUpload
                      value={photos}
                      onChange={(newPhotos) => {
                        setPhotos(newPhotos);
                        setValue('photos', newPhotos, { shouldValidate: true });
                      }}
                      language={language}
                      required={true}
                      minPhotos={2}
                      maxPhotos={3}
                    />
                  </div>
                </CardContent>
              </Card>
              {/* Review Section */}
              <Card className="mb-6 sm:mb-8">
                <CardContent className="p-4 sm:p-6 space-y-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please review your report before submitting. All information will be visible to relevant authorities.
                    </AlertDescription>
                  </Alert>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          {t.issueDetails}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t.title}</p>
                          <p className="text-gray-900">{watchedFields.title}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t.category}</p>
                          <div className="flex items-center gap-2">
                            {ISSUE_CATEGORIES.find(c => c.id === watchedFields.category) && (
                              <>
                                <span className="text-lg">
                                  {ISSUE_CATEGORIES.find(c => c.id === watchedFields.category)?.icon}
                                </span>
                                <span>
                                  {language === 'hi' 
                                    ? ISSUE_CATEGORIES.find(c => c.id === watchedFields.category)?.hiName
                                    : ISSUE_CATEGORIES.find(c => c.id === watchedFields.category)?.enName
                                  }
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t.description}</p>
                          <p className="text-gray-900 whitespace-pre-wrap">{watchedFields.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                    {location && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            {t.location}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-900">
                            {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
                          </p>
                          {location.accuracy && (
                            <Badge variant="outline" className="mt-2">
                              {Math.round(location.accuracy)}m accuracy
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    {photos.length > 0 && (
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Camera className="h-5 w-5" />
                            {t.photos} ({photos.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {photos.map((photo, index) => (
                              <div key={photo.id} className="relative aspect-square">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={photo.preview}
                                  alt={`Photo ${index + 1}`}
                                  className="w-full h-full object-cover rounded-lg border"
                                />
                                {photo.compressed && (
                                  <Badge 
                                    variant="secondary" 
                                    className="absolute top-1 right-1 text-xs"
                                  >
                                    Compressed
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveDraft}
                  className="flex items-center gap-2 justify-center min-h-[44px] touch-manipulation order-2 sm:order-1"
                >
                  <Save className="h-4 w-4" />
                  <span className="text-sm sm:text-base">{t.saveDraft}</span>
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || isSubmitting}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 w-full sm:w-auto justify-center min-h-[44px] touch-manipulation order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  <span className="text-sm sm:text-base">{isSubmitting ? t.submitting : t.submitReport}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </CitizenLayout>

      {/* Duplicate Issues Modal */}
      <DuplicateIssuesModal
        open={showDuplicatesModal}
        onClose={() => {
          setShowDuplicatesModal(false);
          setPendingSubmission(null);
          setDuplicates([]);
        }}
        duplicates={duplicates}
        onSubmitAnyway={handleSubmitAnyway}
        isSubmitting={isSubmitting}
      />
    </RequireUser>
  );
}