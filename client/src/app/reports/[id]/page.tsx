"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// Layout Components
import PublicLayout from '@/components/layout/PublicLayout';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
  Flag,
  BookmarkPlus,
  Copy,
  Facebook,
  Twitter,
  MessageSquare,
  Building2
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
  category: string;
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

  // Enhanced mock data
  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Enhanced mock data
        const mockReport: ReportDetail = {
          id: reportId,
          title: 'मेन रोड पर बड़ा गड्ढा - गंभीर सुरक्षा चिंता',
          description: 'राजा रोड पर मुख्य चौराहे के पास एक बड़ा और खतरनाक गड्ढा है जो पिछले एक सप्ताह से और भी बड़ा हो गया है। यह ट्रैफिक जाम का कारण बन रहा है और वाहनों को नुकसान पहुंचा रहा है। कई दुर्घटनाएं हो चुकी हैं और स्थानीय निवासी तत्काल कार्रवाई की मांग कर रहे हैं। बारिश के बाद स्थिति और भी खराब हो गई है।',
          category: 'roads',
          status: 'in_progress',
          priority: 'high',
          location: {
            area: 'Civil Lines',
            city: 'Bareilly',
            address: 'राजा रोड मुख्य चौराहा, सिविल लाइन्स, बरेली - 243001',
            coordinates: {
              latitude: 28.6139,
              longitude: 77.209
            }
          },
          reportedBy: 'राज कुमार (Verified Citizen)',
          reportedAt: '2024-10-05T10:30:00Z',
          updatedAt: '2024-10-09T14:20:00Z',
          views: 1247,
          likes: 89,
          upvotes: 156,
          downvotes: 8,
          userVote: null,
          estimatedResolution: '3-5 working days',
          assignedDepartment: 'सड़क विकास विभाग (Road Development Department)',
          statusHistory: [
            {
              status: 'new',
              timestamp: '2024-10-05T10:30:00Z',
              note: 'नागरिक द्वारा रिपोर्ट जमा की गई',
              updatedBy: 'System'
            },
            {
              status: 'under_review',
              timestamp: '2024-10-05T16:45:00Z',
              note: 'सड़क विकास विभाग को समीक्षा के लिए भेजा गया',
              updatedBy: 'Admin Team'
            },
            {
              status: 'approved',
              timestamp: '2024-10-06T09:15:00Z',
              note: 'मरम्मत कार्य को मंजूरी दी गई, टीम को भेजा गया',
              updatedBy: 'Department Head'
            },
            {
              status: 'in_progress',
              timestamp: '2024-10-08T11:30:00Z',
              note: 'मरम्मत कार्य शुरू, सामग्री मंगवाई गई है',
              updatedBy: 'Field Engineer'
            }
          ],
          photos: [
            {
              id: '1',
              url: '/api/placeholder/600/400',
              caption: 'गड्ढे की मुख्य तस्वीर - सुबह का समय',
              type: 'image'
            },
            {
              id: '2',
              url: '/api/placeholder/600/400',
              caption: 'गड्ढे के कारण हुई क्षति',
              type: 'image'
            },
            {
              id: '3',
              url: '/api/placeholder/600/400',
              caption: 'आसपास का क्षेत्र और ट्रैफिक स्थिति',
              type: 'image'
            },
            {
              id: '4',
              url: '/api/placeholder/600/400',
              caption: 'वर्तमान मरम्मत कार्य की स्थिति',
              type: 'image'
            }
          ],
          tags: ['गड्ढा', 'सड़क', 'सुरक्षा', 'ट्रैफिक', 'तत्काल'],
          relatedReports: [
            {
              id: '2',
              title: 'पास के चौराहे पर टूटी हुई सड़क',
              status: 'new',
              distance: '0.5 km'
            },
            {
              id: '3',
              title: 'राजा रोड पर स्ट्रीट लाइट नहीं जल रही',
              status: 'resolved',
              distance: '0.3 km'
            }
          ]
        };
        
        setReport(mockReport);
        setCurrentVote(mockReport.userVote || null);
        
        // Mock comments
        const mockComments: Comment[] = [
          {
            id: '1',
            author: 'सुनीता शर्मा',
            authorAvatar: '/api/placeholder/40/40',
            content: 'बहुत अच्छी रिपोर्ट! मैं भी यही समस्या देख रही थी। इस गड्ढे के कारण मेरे वाहन को भी नुकसान हुआ है।',
            timestamp: '2024-10-06T08:15:00Z',
            likes: 12,
            isLiked: false,
            replies: [
              {
                id: '1-1',
                author: 'राज कुमार',
                authorAvatar: '/api/placeholder/40/40',
                content: 'धन्यवाद सुनीता जी! हमें मिलकर इस समस्या का समाधान करना चाहिए।',
                timestamp: '2024-10-06T10:30:00Z',
                likes: 5,
                isLiked: false
              }
            ]
          },
          {
            id: '2',
            author: 'सड़क विकास विभाग',
            authorAvatar: '/api/placeholder/40/40',
            content: 'हमने आपकी शिकायत को गंभीरता से लिया है। मरम्मत का कार्य इस सप्ताह शुरू होगा। असुविधा के लिए खेद है।',
            timestamp: '2024-10-07T14:20:00Z',
            likes: 34,
            isLiked: true,
            isOfficial: true,
            department: 'सड़क विकास विभाग'
          },
          {
            id: '3',
            author: 'अमित वर्मा',
            authorAvatar: '/api/placeholder/40/40',
            content: 'यह एक बहुत ही जरूरी मुद्दा है। मैंने भी इसी तरह की समस्या अपने क्षेत्र में देखी है।',
            timestamp: '2024-10-08T16:45:00Z',
            likes: 8,
            isLiked: false
          }
        ];
        
        setComments(mockComments);
      } catch {
        setError('रिपोर्ट विवरण लोड करने में असफल');
        toast.error('Failed to load report details');
      } finally {
        setIsLoading(false);
      }
    };

    if (reportId) {
      fetchReport();
    }
  }, [reportId]);

  // Enhanced interaction handlers
  const handleVote = async (voteType: 'up' | 'down') => {
    if (!report) return;
    
    try {
      let newUpvotes = report.upvotes;
      let newDownvotes = report.downvotes;
      
      // Remove previous vote if exists
      if (currentVote === 'up') newUpvotes--;
      if (currentVote === 'down') newDownvotes--;
      
      // Add new vote if different from current
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
      
      toast.success(currentVote !== voteType ? 'Vote recorded!' : 'Vote removed!');
    } catch {
      toast.error('Failed to record vote');
    }
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? 'Bookmark removed!' : 'Report bookmarked!');
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const comment: Comment = {
        id: Date.now().toString(),
        author: 'Current User',
        authorAvatar: '/api/placeholder/40/40',
        content: newComment,
        timestamp: new Date().toISOString(),
        likes: 0,
        isLiked: false
      };
      
      setComments([...comments, comment]);
      setNewComment('');
      toast.success('Comment added successfully!');
    } catch {
      toast.error('Failed to add comment');
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
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading report details...</p>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !report) {
    return (
      <PublicLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Report Not Found
              </h2>
              <p className="text-gray-600 mb-4">
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

  const categoryInfo = getCategoryInfo(report.category);
  const statusInfo = getStatusInfo(report.status);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 min-h-[44px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Reports
            </Button>
          </div>

          {/* Header Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{categoryInfo?.icon}</span>
                    <Badge variant="outline" className={cn('text-xs', getPriorityColor(report.priority))}>
                      {report.priority.toUpperCase()} PRIORITY
                    </Badge>
                    <Badge variant="outline" className={cn('text-xs', statusInfo?.color)}>
                      {getStatusIcon(report.status)}
                      {statusInfo?.enName}
                    </Badge>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 mb-2">
                    {report.title}
                  </h1>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{report.location.area}, {report.location.city}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(report.reportedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Enhanced Voting System */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                    <Button
                      variant={currentVote === 'up' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleVote('up')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                        currentVote === 'up' 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'hover:bg-green-50 hover:text-green-600'
                      )}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="font-medium">{report.upvotes}</span>
                    </Button>
                    <Button
                      variant={currentVote === 'down' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => handleVote('down')}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2 rounded-lg transition-all',
                        currentVote === 'down' 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'hover:bg-red-50 hover:text-red-600'
                      )}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="font-medium">{report.downvotes}</span>
                    </Button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLike}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                        isLiked ? 'text-red-600 border-red-200 bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                      )}
                    >
                      <Heart className={cn('h-4 w-4', isLiked ? 'fill-current' : '')} />
                      <span className="font-medium">{report.likes}</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBookmark}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg transition-all',
                        isBookmarked ? 'text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'
                      )}
                    >
                      <BookmarkPlus className={cn('h-4 w-4', isBookmarked ? 'fill-current' : '')} />
                      Save
                    </Button>

                    <div className="relative">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-50"
                      >
                        <Share2 className="h-4 w-4" />
                        Share
                      </Button>
                      
                      {showShareMenu && (
                        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-[180px]">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('copy')}
                            className="w-full justify-start gap-2 mb-1"
                          >
                            <Copy className="h-4 w-4" />
                            Copy Link
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('whatsapp')}
                            className="w-full justify-start gap-2 mb-1"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('facebook')}
                            className="w-full justify-start gap-2 mb-1"
                          >
                            <Facebook className="h-4 w-4" />
                            Facebook
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleShare('twitter')}
                            className="w-full justify-start gap-2"
                          >
                            <Twitter className="h-4 w-4" />
                            Twitter
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {report.description}
                  </p>
                </CardContent>
              </Card>

              {/* Photos */}
              {report.photos && report.photos.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Photos ({report.photos.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.photos.map((photo) => (
                        <div key={photo.id} className="space-y-2">
                          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={photo.url}
                              alt={photo.caption || 'Report photo'}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          {photo.caption && (
                            <p className="text-sm text-gray-600">{photo.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Status History */}
              <Card>
                <CardHeader>
                  <CardTitle>Status Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {report.statusHistory.map((history, index) => {
                      const statusInfo = getStatusInfo(history.status);
                      return (
                        <div key={index} className="flex items-start gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                            statusInfo?.color || 'bg-gray-200'
                          )}>
                            {getStatusIcon(history.status)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">
                                {statusInfo?.enName}
                              </h4>
                              <span className="text-sm text-gray-500">
                                {formatDate(history.timestamp)}
                              </span>
                            </div>
                            {history.note && (
                              <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Comments Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      Community Discussion ({comments.length})
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowComments(!showComments)}
                    >
                      {showComments ? 'Hide' : 'Show'} Comments
                    </Button>
                  </div>
                </CardHeader>
                {showComments && (
                  <CardContent className="space-y-6">
                    {/* Add Comment Form */}
                    <div className="border-b border-gray-100 pb-6">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="/api/placeholder/40/40" />
                          <AvatarFallback>You</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder="Share your thoughts or experience related to this issue..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[80px] resize-none"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {newComment.length}/500 characters
                            </span>
                            <Button
                              onClick={handleSubmitComment}
                              disabled={!newComment.trim() || isSubmittingComment}
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              {isSubmittingComment ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                              Post Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-6">
                      {comments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-lg font-medium mb-1">No comments yet</p>
                          <p className="text-sm">Be the first to share your thoughts!</p>
                        </div>
                      ) : (
                        comments.map((comment) => (
                          <div key={comment.id} className="space-y-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={comment.authorAvatar} />
                                <AvatarFallback>{comment.author[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 space-y-2">
                                <div className="bg-gray-50 rounded-xl p-4">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="font-medium text-gray-900">
                                      {comment.author}
                                    </span>
                                    {comment.isOfficial && (
                                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                        <Building2 className="h-3 w-3 mr-1" />
                                        Official
                                      </Badge>
                                    )}
                                    <span className="text-sm text-gray-500">
                                      {formatDate(comment.timestamp)}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 leading-relaxed">
                                    {comment.content}
                                  </p>
                                </div>
                                
                                {/* Comment Actions */}
                                <div className="flex items-center gap-4 text-sm">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCommentLike(comment.id)}
                                    className={cn(
                                      'flex items-center gap-1 px-2 py-1 h-auto',
                                      comment.isLiked ? 'text-red-600' : 'text-gray-500'
                                    )}
                                  >
                                    <Heart className={cn('h-3 w-3', comment.isLiked ? 'fill-current' : '')} />
                                    <span>{comment.likes}</span>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 px-2 py-1 h-auto text-gray-500"
                                  >
                                    <MessageCircle className="h-3 w-3" />
                                    Reply
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 px-2 py-1 h-auto text-gray-500"
                                  >
                                    <Flag className="h-3 w-3" />
                                    Report
                                  </Button>
                                </div>

                                {/* Replies */}
                                {comment.replies && comment.replies.length > 0 && (
                                  <div className="ml-6 space-y-3 pt-3 border-l-2 border-gray-100 pl-4">
                                    {comment.replies.map((reply) => (
                                      <div key={reply.id} className="flex items-start gap-3">
                                        <Avatar className="w-6 h-6">
                                          <AvatarImage src={reply.authorAvatar} />
                                          <AvatarFallback className="text-xs">{reply.author[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className="font-medium text-gray-900 text-sm">
                                                {reply.author}
                                              </span>
                                              <span className="text-xs text-gray-500">
                                                {formatDate(reply.timestamp)}
                                              </span>
                                            </div>
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                              {reply.content}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-3 text-xs">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className={cn(
                                                'flex items-center gap-1 px-1 py-0 h-auto',
                                                reply.isLiked ? 'text-red-600' : 'text-gray-500'
                                              )}
                                            >
                                              <Heart className={cn('h-2.5 w-2.5', reply.isLiked ? 'fill-current' : '')} />
                                              <span>{reply.likes || 0}</span>
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

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Report Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Report Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Category</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg">{categoryInfo?.icon}</span>
                      <span className="font-medium">{categoryInfo?.enName}</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Reported by</p>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{report.reportedBy}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Views</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Eye className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{report.views}</span>
                    </div>
                  </div>

                  {report.assignedDepartment && (
                    <div>
                      <p className="text-sm text-gray-600">Assigned Department</p>
                      <p className="font-medium mt-1">{report.assignedDepartment}</p>
                    </div>
                  )}

                  {report.estimatedResolution && (
                    <div>
                      <p className="text-sm text-gray-600">Estimated Resolution</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{report.estimatedResolution}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle>Location Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium mt-1">{report.location.address}</p>
                  </div>
                  
                  {report.location.coordinates && (
                    <div>
                      <p className="text-sm text-gray-600">Coordinates</p>
                      <p className="font-mono text-sm mt-1">
                        {report.location.coordinates.latitude.toFixed(6)}, {report.location.coordinates.longitude.toFixed(6)}
                      </p>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (report.location.coordinates) {
                        const { latitude, longitude } = report.location.coordinates;
                        window.open(`https://maps.google.com/?q=${latitude},${longitude}`, '_blank');
                      }
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Maps
                  </Button>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/report">
                      Report Similar Issue
                    </Link>
                  </Button>
                  
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/reports">
                      View All Reports
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
