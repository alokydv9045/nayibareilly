"use client"

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Layout and Auth
import RequireUser from '@/components/features/auth/RequireUser';
import CitizenLayout from '@/components/layout/CitizenLayout';
import { useTrackedIssueDetails } from '@/hooks/api/useTrackIssue';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle2, 
  MapPin, 
  Share2,
  Eye,
  Plus,
  Copy,
  Languages,
  Clock,
  AlertCircle
} from 'lucide-react';

// Utilities and Types
import { cn } from '@/lib/utils/helpers';
import { useTranslation, Language } from '@/lib/utils/translations';
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from '@/lib/validations/reportForm';
import { toast } from 'react-hot-toast';

// Mock data interface (replace with actual API response)
interface SubmittedIssue {
  id: string;
  title: string;
  category: string;
  description?: string;
  status: string;
  priority?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photos?: Array<{
    id: string;
    preview: string;
    file?: File;
    compressed?: boolean;
  }>;
  createdAt: string;
  submittedAt?: string;
  trackingNumber: string;
  estimatedResolution?: string;
}

// Component that uses search params
function ReportSuccessContent() {
  const [language, setLanguage] = useState<Language>('en');
  const [issue, setIssue] = useState<SubmittedIssue | null>(null);
  
  const t = useTranslation(language);
  const router = useRouter();
  const searchParams = useSearchParams();
  const issueId = searchParams.get('id');

  const { data: fetchedIssue, isLoading: isFetching, error: fetchError } = useTrackedIssueDetails(issueId || '');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Language detection from browser
  useEffect(() => {
    const browserLang = navigator.language;
    if (browserLang.startsWith('hi')) {
      setLanguage('hi');
    }
  }, []);

  // Fetch issue details
  useEffect(() => {
    if (!issueId) {
      setError('No issue ID provided');
      setIsLoading(false);
      return;
    }

    // Try to get submitted data from localStorage first
    const lastSubmittedReport = localStorage.getItem('lastSubmittedReport');
    if (lastSubmittedReport) {
      try {
        const submittedData = JSON.parse(lastSubmittedReport);
        if (submittedData.id === issueId) {
          setIssue({
            ...submittedData,
            status: 'new',
            createdAt: submittedData.submittedAt || new Date().toISOString(),
            estimatedResolution: '2-3 working days'
          });
          setIsLoading(false);
          return;
        }
      } catch {
        // ignore parse error
      }
    }

    // If not in localStorage, wait for fetched data
    if (!isFetching) {
      if (fetchedIssue) {
        setIssue({
          id: fetchedIssue.id,
          title: fetchedIssue.title,
          category: fetchedIssue.category?.id || 'roads',
          status: fetchedIssue.status.toLowerCase(),
          location: {
            latitude: fetchedIssue.latitude || 0,
            longitude: fetchedIssue.longitude || 0,
            address: fetchedIssue.address || undefined
          },
          createdAt: fetchedIssue.createdAt,
          trackingNumber: fetchedIssue.reportId || `NGR-${fetchedIssue.id.substring(0, 6)}`,
          estimatedResolution: '2-3 working days',
          photos: fetchedIssue.images?.map(img => ({ id: Math.random().toString(), preview: img.url }))
        });
        setIsLoading(false);
      } else if (fetchError) {
        setError('Failed to load issue details');
        toast.error('Could not load report details');
        setIsLoading(false);
      }
    }
  }, [issueId, fetchedIssue, isFetching, fetchError]);

  const copyTrackingNumber = () => {
    if (issue?.trackingNumber) {
      navigator.clipboard.writeText(issue.trackingNumber);
      toast.success('Tracking number copied to clipboard');
    }
  };

  const shareIssue = async () => {
    if (!issue) return;
    
    const shareData = {
      title: `Nayibareilly Issue Report - ${issue.trackingNumber}`,
      text: `Track my civic issue report: ${issue.title}`,
      url: `${window.location.origin}/reports/${issue.id}`
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to clipboard
        const shareText = `${shareData.title}\n${shareData.text}\n${shareData.url}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Share link copied to clipboard');
      }
    } catch {
      toast.error('Failed to share');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'hi' ? 'hi-IN' : 'en-IN', {
      dateStyle: 'full',
      timeStyle: 'short'
    }).format(date);
  };

  const getCategoryInfo = (categoryId: string) => {
    return ISSUE_CATEGORIES.find(c => c.id === categoryId);
  };

  const getStatusInfo = (statusId: string) => {
    return ISSUE_STATUSES.find(s => s.id === statusId);
  };

  if (isLoading) {
    return (
      <RequireUser>
        <CitizenLayout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading issue details...</p>
            </div>
          </div>
        </CitizenLayout>
      </RequireUser>
    );
  }

  if (error || !issue) {
    return (
      <RequireUser>
        <CitizenLayout>
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="max-w-md w-full mx-4">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Unable to Load Issue
                </h2>
                <p className="text-gray-600 mb-4">
                  {error || 'Issue not found'}
                </p>
                <Button onClick={() => router.push('/report')}>
                  Report New Issue
                </Button>
              </CardContent>
            </Card>
          </div>
        </CitizenLayout>
      </RequireUser>
    );
  }

  const categoryInfo = getCategoryInfo(issue.category);
  const statusInfo = getStatusInfo(issue.status);

  return (
    <RequireUser>
      <CitizenLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t.reportSubmitted}
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t.submissionSuccess}
              </p>

              {/* Language Toggle */}
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                  className="flex items-center gap-2"
                >
                  <Languages className="h-4 w-4" />
                  {language === 'en' ? 'हिंदी' : 'English'}
                </Button>
              </div>
            </div>

            {/* Tracking Information */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  {t.trackingId}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="text-xl font-mono font-semibold text-gray-900">
                        {issue.trackingNumber}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyTrackingNumber}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={cn('w-2 h-2 rounded-full', statusInfo?.color || 'bg-gray-500')} />
                        <span className="font-medium">
                          {language === 'hi' ? statusInfo?.hiName : statusInfo?.enName}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-gray-600">Submitted</p>
                      <p className="font-medium mt-1">
                        {formatDate(issue.createdAt)}
                      </p>
                    </div>
                    
                    {issue.estimatedResolution && (
                      <div>
                        <p className="text-gray-600">Estimated Resolution</p>
                        <p className="font-medium mt-1 flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {issue.estimatedResolution}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issue Details */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Issue Details Review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-medium text-gray-900">{issue.title}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{categoryInfo?.icon}</span>
                    <span className="font-medium">
                      {language === 'hi' ? categoryInfo?.hiName : categoryInfo?.enName}
                    </span>
                  </div>
                </div>

                {issue.description && (
                  <div>
                    <p className="text-sm text-gray-600">Description</p>
                    <p className="text-gray-900 whitespace-pre-wrap mt-1">{issue.description}</p>
                  </div>
                )}

                {issue.priority && (
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                      issue.priority === 'critical' ? 'bg-red-100 text-red-800' :
                      issue.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    )}>
                      {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                    </span>
                  </div>
                )}
                
                {issue.location && (
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-gray-900">
                          {issue.location.address || 
                           `${issue.location.latitude.toFixed(6)}, ${issue.location.longitude.toFixed(6)}`}
                        </p>
                        {issue.location.address && (
                          <p className="text-xs text-gray-500 mt-1">
                            Coordinates: {issue.location.latitude.toFixed(6)}, {issue.location.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {issue.photos && issue.photos.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-3">Attached Photos ({issue.photos.length})</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {issue.photos.map((photo, index) => (
                        <div key={photo.id} className="relative aspect-square group">
                          <Image
                            src={photo.preview}
                            alt={`Submitted photo ${index + 1}`}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover rounded-lg border border-gray-200 shadow-sm group-hover:shadow-md transition-shadow"
                            unoptimized
                          />
                          {photo.compressed && (
                            <div className="absolute top-2 right-2">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Compressed
                              </span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>What Happens Next?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Issue Review</p>
                      <p className="text-sm text-gray-600">Your report will be reviewed by relevant authorities within 24 hours.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Assignment</p>
                      <p className="text-sm text-gray-600">The issue will be assigned to the appropriate department for action.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Resolution</p>
                      <p className="text-sm text-gray-600">You&apos;ll receive updates as work progresses and when the issue is resolved.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                variant="outline"
                className="flex items-center gap-2"
              >
                <Link href={`/reports/${issue.id}`}>
                  <Eye className="h-4 w-4" />
                  {t.trackStatus}
                </Link>
              </Button>
              
              <Button
                onClick={shareIssue}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="h-4 w-4" />
                {t.shareLink}
              </Button>
              
              <Button
                asChild
                className="flex items-center gap-2"
              >
                <Link href="/report">
                  <Plus className="h-4 w-4" />
                  {t.reportAnother}
                </Link>
              </Button>
            </div>

            {/* Contact Information */}
            <Card className="mt-8">
              <CardContent className="p-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Need help or have questions about your report?
                </p>
                <p className="text-sm">
                  Contact us at{' '}
                  <a href="mailto:support@nayibareilly.gov.in" className="text-blue-600 hover:underline">
                    support@nayibareilly.gov.in
                  </a>
                  {' '}or call{' '}
                  <a href="tel:+911234567890" className="text-blue-600 hover:underline">
                    +91 123 456 7890
                  </a>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </CitizenLayout>
    </RequireUser>
  );
}

// Main page component with Suspense boundary
export default function ReportSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
      </div>
    }>
      <ReportSuccessContent />
    </Suspense>
  );
}