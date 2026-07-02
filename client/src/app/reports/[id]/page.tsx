"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePublicReport } from '@/hooks/api/usePublic';
import { api } from '@/lib/api/client';

// Layout Components
import PublicLayout from '@/components/layout/PublicLayout';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import AnimatedHeading from '@/components/ui/AnimatedHeading';
import { 
  ArrowLeft,
  MapPin, 
  Calendar,
  User, 
  Eye,
  Heart,
  Share2,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Copy,
  Twitter,
  MessageSquare,
  Building2,
  Zap,
  Info
} from 'lucide-react';

// Utilities and Types
import { cn } from '@/lib/utils/helpers';
import { ISSUE_CATEGORIES, ISSUE_STATUSES } from '@/lib/validations/reportForm';
import { toast } from 'react-hot-toast';

// Enhanced data interfaces
interface ReportDetail {
  id: string;
  title: string;
  description: string;
  category: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  status: string;
  priority: string;
  location: {
    area: string;
    city: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    address?: string;
  };
  reportedBy: string;
  reportedAt: string;
  updatedAt: string;
  views: number;
  likes: number;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  estimatedResolution?: string;
  assignedDepartment?: string;
  statusHistory: Array<{
    status: string;
    timestamp: string;
    note?: string;
    updatedBy?: string;
  }>;
  photos?: Array<{
    id: string;
    url: string;
    caption?: string;
    type?: 'image' | 'video';
  }>;
  tags?: string[];
  relatedReports?: Array<{
    id: string;
    title: string;
    status: string;
    distance?: string;
  }>;
}

interface Comment {
  id: string;
  author: string;
  authorAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  replies?: Comment[];
  isOfficial?: boolean;
  department?: string;
}

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.id as string;
  
  // Core state
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Enhanced interaction state
  const [isLiked, setIsLiked] = useState(false);
  const [currentVote, setCurrentVote] = useState<'up' | 'down' | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  
  // Photo gallery state (future feature)
  const [_selectedPhotoIndex, _setSelectedPhotoIndex] = useState<number | null>(null);
  const [_showPhotoGallery, _setShowPhotoGallery] = useState(false);
  
  // Map state
  const [_showMap, _setShowMap] = useState(false);

  const { data: fetchedReport, isLoading: isReportLoading, error: reportError } = usePublicReport(reportId);

  useEffect(() => {
    if (fetchedReport) {
      // Map API data to ReportDetail interface
      const mappedReport: ReportDetail = {
        id: fetchedReport.id,
        title: fetchedReport.title,
        description: fetchedReport.description || '',
        category: {
          id: fetchedReport.category?.id || 'unknown',
          name: fetchedReport.category?.name || fetchedReport.categoryName || 'roads',
          icon: fetchedReport.category?.icon,
          color: fetchedReport.category?.color,
        },
        status: fetchedReport.status,
        priority: fetchedReport.priority || 'medium',
        location: {
          area: fetchedReport.location?.address?.split(',')[0] || 'Unknown Area',
          city: 'Bareilly',
          address: fetchedReport.location?.address,
          coordinates: fetchedReport.location?.latitude && fetchedReport.location?.longitude ? {
            latitude: fetchedReport.location.latitude,
            longitude: fetchedReport.location.longitude
          } : undefined
        },
        reportedBy: fetchedReport.user?.fullName || 'Anonymous Citizen',
        reportedAt: fetchedReport.createdAt,
        updatedAt: fetchedReport.updatedAt || fetchedReport.createdAt,
        views: fetchedReport.viewsCount || 0,
        likes: fetchedReport.votesCount || 0,
        upvotes: fetchedReport.votesCount || 0,
        downvotes: 0,
        userVote: null,
        estimatedResolution: 'Pending Assessment',
        assignedDepartment: fetchedReport.department?.name || 'Unassigned',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        statusHistory: fetchedReport.timeline?.map((sh: any) => ({
          status: sh.status,
          timestamp: sh.createdAt,
          note: sh.note,
          updatedBy: sh.performedById
        })) || [],
        photos: fetchedReport.images?.map((img: { url: string; filename: string }, index: number) => ({
          id: img.filename || `img-${index}`,
          url: img.url,
          caption: '',
          type: 'image' as const
        })) || [],
        tags: [],
        relatedReports: []
      };
      
      setReport(mappedReport);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedComments: Comment[] = fetchedReport.comments?.map((c: any) => ({
        id: c.id,
        author: c.user?.name || 'Anonymous',
        authorAvatar: c.user?.avatarUrl || '/api/placeholder/40/40',
        content: c.content,
        timestamp: c.createdAt,
        likes: c.upvotes || 0,
        isLiked: false,
        isOfficial: c.user?.roles?.includes('STAFF') || c.user?.roles?.includes('ADMIN') || false
      })) || [];
      
      setComments(mappedComments);
      setIsLoading(false);
      setError(null);
    } else if (reportError) {
      setError('Report not found or not approved for public viewing');
      setIsLoading(false);
    } else if (!isReportLoading) {
      setIsLoading(true);
    }
  }, [fetchedReport, reportError, isReportLoading]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!report) return;
    
    try {
      // Optimistic update
      let newUpvotes = report.upvotes;
      let newDownvotes = report.downvotes;
      
      if (currentVote === 'up') newUpvotes--;
      if (currentVote === 'down') newDownvotes--;
      
      if (currentVote !== voteType) {
        if (voteType === 'up') newUpvotes++;
        if (voteType === 'down') newDownvotes++;
        setCurrentVote(voteType);
      } else {
        setCurrentVote(null);
      }
      
      setReport({ 
        ...report, 
        upvotes: newUpvotes, 
        downvotes: newDownvotes,
        userVote: currentVote !== voteType ? voteType : null
      });
      
      await api.post(`/issues/${report.id}/vote`, { type: voteType });
      toast.success(currentVote !== voteType ? 'Vote recorded!' : 'Vote removed!');
    } catch (error: unknown) {
      // Revert optimistic update here in a full implementation
      if (typeof error === 'object' && error !== null && 'response' in error && (error as { response?: { status?: number } }).response?.status === 401) {
        toast.error('Please login to vote on this report');
      } else {
        toast.error('Failed to record vote');
      }
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed!' : 'Report bookmarked!');
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !report) return;
    
    setIsSubmittingComment(true);
    try {
      await api.post(`/issues/${report.id}/comments`, { comment: newComment });
      
      // We don't have the full user object from the response easily without reloading
      // But we can do an optimistic update or refetch
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: 'Current User', // Will be correct on refresh
        authorAvatar: '/api/placeholder/40/40',
        content: newComment,
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false,
        isOfficial: false
      };
      
      setComments([newCommentObj, ...comments]); // Prepend new comment
      setNewComment('');
      toast.success('Comment added successfully!');
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error && (error as { response?: { status?: number } }).response?.status === 401) {
        toast.error('Please login to post a comment');
      } else {
        toast.error('Failed to add comment');
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleCommentLike = (commentId: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCategoryInfo = (categoryId: string) => {
    return ISSUE_CATEGORIES.find(c => c.id === categoryId);
  };

  const getStatusInfo = (statusId: string) => {
    return ISSUE_STATUSES.find(s => s.id === statusId);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-4 w-4" />;
      case 'under_review': return <Eye className="h-4 w-4" />;
      case 'in_progress': return <TrendingUp className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleLike = async () => {
    if (!report) return;
    
    // Optimistic update
    const previousState = { isLiked, likes: report.likes };
    const newLiked = !isLiked;
    const newLikes = newLiked ? report.likes + 1 : report.likes - 1;
    
    // Update UI immediately
    setIsLiked(newLiked);
    setReport({ ...report, likes: newLikes });
    
    try {
      // Show success feedback
      toast.success(
        newLiked 
          ? '❤️ Added to favorites! You can view all your liked reports in your profile.' 
          : '💔 Removed from favorites!',
        {
          duration: 2000,
          position: 'bottom-center'
        }
      );
      
      // Optional: Update localStorage for persistence
      const likedReports = JSON.parse(localStorage.getItem('likedReports') || '[]');
      if (newLiked) {
        if (!likedReports.includes(report.id)) {
          likedReports.push(report.id);
        }
      } else {
        const index = likedReports.indexOf(report.id);
        if (index > -1) {
          likedReports.splice(index, 1);
        }
      }
      localStorage.setItem('likedReports', JSON.stringify(likedReports));
      
    } catch {
      // Revert on error
      setIsLiked(previousState.isLiked);
      setReport({ ...report, likes: previousState.likes });
      toast.error('Failed to update favorites. Please try again.');
    }
  };

  const handleShare = (platform?: string) => {
    const url = window.location.href;
    const title = report?.title || 'NayiBareilly Report';
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
      return;
    }
    
    if (platform === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(title + ' - ' + url)}`);
      return;
    }
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
      return;
    }
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`);
      return;
    }
    
    // Fallback to Web Share API
    if (navigator.share) {
      navigator.share({
        title,
        text: 'Check out this civic issue report',
        url
      });
    }
    
    setShowShareMenu(false);
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
            <p className="text-slate-600">Loading report details...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !report) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Report Not Found
              </h2>
              <p className="text-slate-600 mb-4">
                {error || 'The requested report could not be found.'}
              </p>
              <Button onClick={() => router.push('/reports')}>
                Back to All Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  // Not using categoryInfo to get the icon anymore if it's dynamic
  const categoryInfo = getCategoryInfo(report.category?.id || 'other');
  const statusInfo = getStatusInfo(report.status);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-50/50 relative">
        {/* Subtle background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
          {/* Back Button */}
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Button>
          </div>

          {/* Hero Section */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-8 relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
            <div className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-3xl bg-slate-100 p-2 rounded-xl">{report.category.icon || categoryInfo?.icon || '📋'}</span>
                    <Badge className={cn('px-3 py-1 text-xs font-bold uppercase tracking-wider', getPriorityColor(report.priority))}>
                      {report.priority} PRIORITY
                    </Badge>
                    <Badge variant="outline" className={cn('px-3 py-1 text-xs font-bold uppercase tracking-wider', statusInfo?.color)}>
                      <span className="mr-1">{getStatusIcon(report.status)}</span>
                      {statusInfo?.enName || report.status}
                    </Badge>
                  </div>
                  
                  <AnimatedHeading as="h1" className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    {report.title}
                  </AnimatedHeading>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 font-medium pt-2">
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <span>{report.location.area}, {report.location.city}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      <span>{formatDate(report.reportedAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
                      <User className="h-4 w-4 text-emerald-600" />
                      <span>By {report.reportedBy}</span>
                    </div>
                  </div>
                </div>
                
                {/* Voting & Actions */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2 md:pt-0">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full p-1 shadow-sm">
                    <Button
                      variant={currentVote === 'up' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleVote('up')}
                      className={cn(
                        'rounded-full px-4 gap-2',
                        currentVote === 'up' ? 'bg-emerald-600 hover:bg-emerald-700' : 'hover:bg-emerald-50 hover:text-emerald-700 text-slate-600'
                      )}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="font-semibold">{report.upvotes}</span>
                    </Button>
                    <div className="w-px h-6 bg-slate-300 mx-1" />
                    <Button
                      variant={currentVote === 'down' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleVote('down')}
                      className={cn(
                        'rounded-full px-4 gap-2',
                        currentVote === 'down' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-red-50 hover:text-red-700 text-slate-600'
                      )}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="font-semibold">{report.downvotes}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description Section */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                    <AlertCircle className="h-5 w-5 text-emerald-500" />
                    Issue Description
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg font-medium">
                    {report.description}
                  </p>
                </CardContent>
              </Card>

              {/* Photos Section */}
              {report.photos && report.photos.length > 0 && (
                <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                  <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                      <MapPin className="h-5 w-5 text-emerald-500" />
                      Photographic Evidence
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {report.photos.map((photo) => (
                        <div key={photo.id} className="group relative rounded-xl overflow-hidden shadow-sm border border-slate-200">
                          <div className="aspect-[4/3] bg-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt={photo.caption || 'Report photo'}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          {photo.caption && (
                            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/80 to-transparent p-4">
                              <p className="text-sm text-white font-medium">{photo.caption}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timeline Section */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                    <Clock className="h-5 w-5 text-emerald-500" />
                    Resolution Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="relative border-l-2 border-slate-200 ml-4 space-y-8 py-2">
                    {report.statusHistory.map((history, index) => {
                      const statusInfo = getStatusInfo(history.status);
                      return (
                        <div key={index} className="relative pl-8">
                          <div className={cn(
                            'absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm',
                            statusInfo?.color || 'bg-slate-300 text-slate-700'
                          )}>
                            {getStatusIcon(history.status)}
                          </div>
                          <div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                              <h4 className="font-bold text-slate-900 text-lg">
                                {statusInfo?.enName}
                              </h4>
                              <span className="text-sm text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-full w-fit">
                                {formatDate(history.timestamp)}
                              </span>
                            </div>
                            {history.note && (
                              <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 mt-2">
                                <p className="text-slate-700 text-sm">{history.note}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold flex items-center gap-2 text-slate-800">
                      <MessageCircle className="h-5 w-5 text-emerald-500" />
                      Community Discussion ({comments.length})
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowComments(!showComments)}
                      className="rounded-full px-4 font-semibold"
                    >
                      {showComments ? 'Hide Comments' : 'Show Comments'}
                    </Button>
                  </div>
                </CardHeader>
                {showComments && (
                  <CardContent className="p-6 space-y-6">
                    {/* Add Comment */}
                    <div className="flex items-start gap-4 pb-6 border-b border-slate-100">
                      <Avatar className="w-12 h-12 shadow-sm border border-slate-200">
                        <AvatarImage src="/api/placeholder/48/48" />
                        <AvatarFallback>You</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Share your thoughts or update..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="min-h-[100px] resize-none bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 rounded-xl"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-full">
                            {newComment.length}/500 characters
                          </span>
                          <Button
                            onClick={handleSubmitComment}
                            disabled={!newComment.trim() || isSubmittingComment}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 shadow-md"
                          >
                            {isSubmittingComment ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            ) : (
                              <Send className="h-4 w-4 mr-2" />
                            )}
                            Post Comment
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-6">
                      {comments.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <MessageSquare className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                          <p className="text-lg font-bold text-slate-700 mb-1">No comments yet</p>
                          <p className="text-sm text-slate-500">Be the first to share your thoughts!</p>
                        </div>
                      ) : (
                        comments.map((comment) => (
                           <div key={comment.id} className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-10 h-10 shadow-sm border border-slate-200">
                                <AvatarImage src={comment.authorAvatar} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">{comment.author[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="bg-slate-50 rounded-2xl rounded-tl-sm p-4 border border-slate-100 shadow-sm">
                                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className="font-bold text-slate-900">
                                      {comment.author}
                                    </span>
                                    {comment.isOfficial && (
                                      <Badge className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-800 border-0">
                                        <Building2 className="h-3 w-3 mr-1" />
                                        Official
                                      </Badge>
                                    )}
                                    <span className="text-xs text-slate-400 font-medium ml-auto">
                                      {formatDate(comment.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 leading-relaxed text-sm">
                                    {comment.content}
                                  </p>
                                </div>
                                <div className="flex items-center gap-3 text-sm px-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCommentLike(comment.id)}
                                    className={cn(
                                      'flex items-center gap-1.5 px-2 py-1 h-auto rounded-full',
                                      comment.isLiked ? 'text-red-600 hover:text-red-700 bg-red-50' : 'text-slate-500 hover:bg-slate-100'
                                    )}
                                  >
                                    <Heart className={cn('h-3.5 w-3.5', comment.isLiked ? 'fill-current' : '')} />
                                    <span className="font-semibold">{comment.likes}</span>
                                  </Button>
                                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5 px-2 py-1 h-auto text-slate-500 hover:bg-slate-100 rounded-full">
                                    <MessageCircle className="h-3.5 w-3.5" />
                                    Reply
                                  </Button>
                                </div>
                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="ml-6 space-y-3 pt-3 border-l-2 border-slate-100 pl-4">
                                    {comment.replies.map((reply) => (
                                      <div key={reply.id} className="flex items-start gap-3">
                                        <Avatar className="w-8 h-8">
                                          <AvatarImage src={reply.authorAvatar} />
                                          <AvatarFallback className="text-xs">{reply.author[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                          <div className="bg-white border border-slate-200 rounded-xl rounded-tl-sm p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-bold text-slate-900 text-sm">
                                                {reply.author}
                                              </span>
                                              <span className="text-xs text-slate-500 font-medium ml-auto">
                                                {formatDate(reply.timestamp)}
                                              </span>
                                            </div>
                                            <p className="text-slate-700 text-sm leading-relaxed">
                                              {reply.content}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-3 text-xs px-1">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className={cn(
                                                'flex items-center gap-1 px-1 py-0 h-auto rounded-full',
                                                reply.isLiked ? 'text-red-600' : 'text-slate-500 hover:bg-slate-100'
                                              )}
                                            >
                                              <Heart className={cn('h-3 w-3', reply.isLiked ? 'fill-current' : '')} />
                                              <span className="font-semibold">{reply.likes || 0}</span>
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                           </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              
              {/* Actions Card */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-900 text-white pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Zap className="h-5 w-5 text-emerald-400" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3 bg-slate-50">
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <Button
                      variant="outline"
                      onClick={handleLike}
                      className={cn(
                        'flex flex-col h-auto py-3 gap-1 rounded-xl transition-all shadow-sm',
                        isLiked ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100' : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
                      )}
                    >
                      <Heart className={cn('h-5 w-5', isLiked ? 'fill-current' : '')} />
                      <span className="font-semibold text-xs">Save</span>
                    </Button>
                    <div className="relative">
                      <Button
                        variant="outline"
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="w-full flex flex-col h-auto py-3 gap-1 rounded-xl transition-all border-slate-200 shadow-sm bg-white hover:bg-slate-100 text-slate-700"
                      >
                        <Share2 className="h-5 w-5" />
                        <span className="font-semibold text-xs">Share</span>
                      </Button>
                      
                      {showShareMenu && (
                        <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-20">
                          <Button variant="ghost" size="sm" onClick={() => handleShare('copy')} className="w-full justify-start gap-2 mb-1 rounded-lg"><Copy className="h-4 w-4"/>Copy Link</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleShare('whatsapp')} className="w-full justify-start gap-2 mb-1 rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"><MessageCircle className="h-4 w-4"/>WhatsApp</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleShare('twitter')} className="w-full justify-start gap-2 rounded-lg text-blue-500 hover:bg-blue-50 hover:text-blue-600"><Twitter className="h-4 w-4"/>Twitter</Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md h-12">
                    <Link href="/report">
                      Report Similar Issue
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full bg-white rounded-xl shadow-sm h-12 border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                    <Link href="/reports">
                      View All Reports
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <Info className="h-5 w-5 text-emerald-500" />
                    Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Views</span>
                      </div>
                      <span className="font-bold text-slate-900">{report.views}</span>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building2 className="h-4 w-4" />
                        <span className="text-sm font-medium">Department</span>
                      </div>
                      <span className="font-bold text-slate-900 text-right max-w-[150px] truncate">{report.assignedDepartment}</span>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Resolution ETA</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="w-full justify-center bg-slate-50 py-1.5 text-slate-700 font-semibold border-slate-200 rounded-lg">
                        {report.estimatedResolution}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Card */}
              <Card className="border-0 shadow-lg rounded-2xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-900 font-medium text-sm leading-relaxed">
                      {report.location.address}
                    </p>
                  </div>
                  
                  {report.location.coordinates && (
                    <Button
                      variant="outline"
                      className="w-full rounded-xl bg-white shadow-sm border-slate-200 hover:bg-slate-50 hover:text-emerald-700 group h-11"
                      onClick={() => {
                        const { latitude, longitude } = report.location.coordinates!;
                        window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank');
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                      View on Google Maps
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}

