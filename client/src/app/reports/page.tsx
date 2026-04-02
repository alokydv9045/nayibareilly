"use client"

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

// Layout Components
import PublicLayout from '@/components/layout/PublicLayout';

// API Hooks
import { usePublicReports, usePublicStats } from '@/hooks/api/usePublic';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  MapPin, 
  User, 
  ArrowRight,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Eye,
  Calendar,
  Users,
  BarChart3
} from 'lucide-react';

// Utilities and Types
import { cn } from '@/lib/utils/helpers';

export default function AllReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Use public API hooks
  const { data: reportsData, isLoading: reportsLoading } = usePublicReports({
    page: 1,
    limit: 50, // Load more for filtering
    status: selectedStatus === 'all' ? undefined : selectedStatus,
    category: selectedCategory === 'all' ? undefined : selectedCategory
  });

  const { data: stats, isLoading: statsLoading } = usePublicStats();

  // Memoize reports to prevent unnecessary re-renders
  const reports = useMemo(() => reportsData?.issues || [], [reportsData?.issues]);
  const isLoading = reportsLoading || statsLoading;

  // Filter reports locally for search and priority
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           report.location?.address?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = selectedPriority === 'all' || report.priority === selectedPriority;
      
      return matchesSearch && matchesPriority;
    });
  }, [reports, searchTerm, selectedPriority]);

  // Statistics from API or computed from reports
  const displayStats = useMemo(() => {
    if (stats) {
      return {
        total: stats.totalIssues,
        new: stats.openIssues,
        inProgress: stats.inProgressIssues,
        resolved: stats.resolvedIssues,
        totalViews: reports.reduce((sum, r) => sum + (r.viewsCount || 0), 0),
        totalLikes: reports.reduce((sum, r) => sum + (r.votesCount || 0), 0),
      };
    }
    return {
      total: reports.length,
      new: reports.filter(r => r.status === 'open').length,
      inProgress: reports.filter(r => r.status === 'in_progress').length,
      resolved: reports.filter(r => r.status === 'resolved').length,
      totalViews: reports.reduce((sum, r) => sum + (r.viewsCount || 0), 0),
      totalLikes: reports.reduce((sum, r) => sum + (r.votesCount || 0), 0),
    };
  }, [stats, reports]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
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

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-2">
                All Public Reports
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Browse all civic issues reported by citizens. Stay informed about ongoing developments in your city.
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
              <Card className="bg-white border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Reports</p>
                      <p className="text-2xl font-bold text-gray-900">{displayStats.total}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">New</p>
                      <p className="text-2xl font-bold text-gray-900">{displayStats.new}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">In Progress</p>
                      <p className="text-2xl font-bold text-gray-900">{displayStats.inProgress}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Resolved</p>
                      <p className="text-2xl font-bold text-gray-900">{displayStats.resolved}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-purple-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">{displayStats.totalViews}</p>
                    </div>
                    <Eye className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-l-4 border-l-indigo-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Community Likes</p>
                      <p className="text-2xl font-bold text-gray-900">{displayStats.totalLikes}</p>
                    </div>
                    <Users className="h-8 w-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Reports
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 min-h-[44px]"
                  />
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Categories</option>
                  <option value="roads">Roads & Transportation</option>
                  <option value="waste">Waste Management</option>
                  <option value="water">Water & Drainage</option>
                  <option value="electricity">Electricity</option>
                  <option value="health">Health & Sanitation</option>
                  <option value="education">Education</option>
                  <option value="safety">Public Safety</option>
                  <option value="environment">Environment</option>
                  <option value="other">Other</option>
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Status</option>
                  <option value="open">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="min-h-[44px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="all">All Priority</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <div className="mb-4 flex items-center justify-between">
            <p className="text-gray-600">
              Showing {filteredReports.length} of {reports.length} reports
            </p>
            {isLoading && (
              <span className="text-sm text-gray-500">Loading...</span>
            )}
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const statusDisplay = report.status === 'open' ? 'New' : 
                                   report.status === 'in_progress' ? 'In Progress' : 
                                   report.status === 'resolved' ? 'Resolved' : 
                                   report.status === 'closed' ? 'Closed' : 'Unknown';

              return (
                <Card key={report.id} className="hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🏛️</span>
                        <Badge variant="outline" className={cn('text-xs', getPriorityColor(report.priority || 'medium'))}>
                          {(report.priority || 'medium').toUpperCase()}
                        </Badge>
                      </div>
                      <Badge 
                        variant="outline" 
                        className="text-xs"
                      >
                        {statusDisplay}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {report.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {report.description}
                    </p>

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                      <MapPin className="h-4 w-4" />
                      <span>{report.location?.address || 'Location not specified'}</span>
                    </div>

                    {/* Meta Info */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>{report.user?.fullName || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(report.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{report.viewsCount || 0} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{report.votesCount || 0} likes</span>
                        </div>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="w-full group-hover:bg-blue-50 group-hover:text-blue-600"
                      >
                        <Link href={`/reports/${report.id}`}>
                          View Details
                          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* No Results */}
          {filteredReports.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-12 text-center">
            <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
              <CardContent className="p-8">
                <h2 className="text-2xl font-bold mb-4">Want to Report an Issue?</h2>
                <p className="mb-6 opacity-90">
                  Help make your city better by reporting civic issues in your area.
                </p>
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <Link href="/report">
                    Report New Issue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
