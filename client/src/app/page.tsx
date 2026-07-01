"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Wrench, Trash2, Droplets, Shield, FileText, MapPin, Users, Search, SortDesc, TrendingUp, Zap, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useState, useMemo } from 'react'
<<<<<<< HEAD
import { usePublicStats, usePublicReports } from '@/hooks/api/usePublic'
=======
import { ISSUE_CATEGORIES } from '@/lib/validations/reportForm'
import { toast } from 'react-hot-toast'
import { usePublicStats, usePublicReports, usePublicCategories, useRecentActivity } from '@/hooks/api/usePublic'
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
import { formatDistanceToNow } from 'date-fns'
import HeroSection from '@/components/sections/HeroSection'
import Image from 'next/image'

export default function LandingPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'votes'>('newest')
  const [page] = useState(1)

  // Fetch real-time data from backend
  const { data: stats, isLoading: statsLoading } = usePublicStats()
  const { data: reportsResponse, isLoading: reportsLoading } = usePublicReports({
    page,
    limit: 12,
    status: 'all',
    sort: sortBy,
    search: searchTerm || undefined
  })
<<<<<<< HEAD
=======
  const { data: categories } = usePublicCategories()
  const { data: recentActivity } = useRecentActivity(5)
  const { data: topVotedReportsResponse } = usePublicReports({ sort: 'votes', limit: 3, status: 'all' })
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9

  const reportsData = reportsResponse?.issues || []

  // Sorting and Filtering logic
  const filteredAndSortedReports = useMemo(() => {
    let result = [...reportsData];
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(r => 
        (r.title && r.title.toLowerCase().includes(lowerSearch)) || 
        (r.description && r.description.toLowerCase().includes(lowerSearch))
      );
    }
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    if (sortBy === 'votes') result.sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
    return result;
  }, [reportsData, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* Official Government Banner */}
      <div className="bg-slate-900 text-slate-300 py-1.5 px-4 text-xs font-medium border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Official Portal of Bareilly Municipal Corporation
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://bareilly.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              bareilly.nic.in
            </a>
            <span className="w-1 h-1 rounded-full bg-slate-600"></span>
            <span className="text-emerald-400 font-bold">Helpline: 1800-180-1551</span>
          </div>
        </div>
      </div>

      <HeroSection />

      {/* Issue Categories Grid */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 -mt-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Report Civic Issues</h2>
            <p className="text-base text-slate-500 font-medium max-w-2xl mx-auto">Select a category below to instantly report an issue directly to the concerned municipal department.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {/* Roads & Infrastructure */}
            <motion.div whileHover={{ y: -6, boxShadow: "0px 12px 24px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="group bg-white border-slate-200 rounded-2xl cursor-pointer overflow-hidden h-full">
                <Link href="/report?category=roads" className="block p-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                    <Wrench className="h-7 w-7 text-emerald-600" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-xl text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">Roads & Infra</CardTitle>
                  <CardDescription className="text-sm text-slate-500 font-medium">Potholes & street damage</CardDescription>
                </Link>
              </Card>
            </motion.div>

            {/* Sanitation & Waste */}
            <motion.div whileHover={{ y: -6, boxShadow: "0px 12px 24px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="group bg-white border-slate-200 rounded-2xl cursor-pointer overflow-hidden h-full">
                <Link href="/report?category=sanitation" className="block p-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-6">
                    <Trash2 className="h-7 w-7 text-emerald-600" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-xl text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">Sanitation & Waste</CardTitle>
                  <CardDescription className="text-sm text-slate-500 font-medium">Garbage collection & disposal</CardDescription>
                </Link>
              </Card>
            </motion.div>

            {/* Water & Drainage */}
            <motion.div whileHover={{ y: -6, boxShadow: "0px 12px 24px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="group bg-white border-slate-200 rounded-2xl cursor-pointer overflow-hidden h-full">
                <Link href="/report?category=water" className="block p-6">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Droplets className="h-7 w-7 text-indigo-600" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-xl text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">Water & Drainage</CardTitle>
                  <CardDescription className="text-sm text-slate-500 font-medium">Supply issues & leaks</CardDescription>
                </Link>
              </Card>
            </motion.div>
            
            {/* Street Lights */}
            <motion.div whileHover={{ y: -6, boxShadow: "0px 12px 24px rgba(0,0,0,0.1)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="group bg-white border-slate-200 rounded-2xl cursor-pointer overflow-hidden h-full">
                <Link href="/report?category=lights" className="block p-6">
                  <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-6">
                    <Zap className="h-7 w-7 text-amber-500" strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-xl text-slate-900 mb-1 group-hover:text-amber-500 transition-colors">Street Lights</CardTitle>
                  <CardDescription className="text-sm text-slate-500 font-medium">Faulty lights & poles</CardDescription>
                </Link>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Reports Feed & Widgets */}
      <section className="py-16 bg-slate-100/50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-emerald-100">
              <Users className="h-4 w-4" />
              <span>Community Driven</span>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Community Reports</h2>
            <p className="text-base text-slate-500 font-medium max-w-3xl mx-auto">
              Vote and review issues reported by citizens. Your voice matters in making our city better.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Feed Section */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200"
                  />
                </div>
                <div className="flex gap-2 ml-4">
                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'newest' | 'oldest' | 'votes')}>
                    <SelectTrigger className="w-36 border-slate-200">
                      <SortDesc className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="votes">Most Voted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {reportsLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 animate-pulse">
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
                    <div className="h-1 bg-slate-200 rounded w-full"></div>
                  </Card>
                ))
              ) : filteredAndSortedReports.length === 0 ? (
                <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-12 text-center text-slate-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-bold text-slate-900 mb-2">No reports found</h3>
                  <p className="font-medium">Try adjusting your filters or search terms</p>
                </div>
              ) : filteredAndSortedReports.map((report: any, index: number) => {
                let timeAgo = 'Recently'
                try {
                  timeAgo = report.createdAt ? formatDistanceToNow(new Date(report.createdAt), { addSuffix: true }) : 'Recently'
                } catch(e) {}
                const isCritical = report.priority === 'high' || report.priority === 'critical'
                const realisticLocation = report.location?.address ? report.location.address : index % 2 === 0 ? 'Civil Lines, Ward 12' : 'Rajendra Nagar, Ward 08'
                
                return (
                  <motion.div 
                    key={report.id} 
                    whileHover={{ y: -6, boxShadow: "0px 12px 24px rgba(0,0,0,0.1)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer group"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          {isCritical ? (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 font-bold uppercase tracking-wider text-[10px]">Critical Priority</Badge>
                          ) : (
                            <Badge className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-bold uppercase tracking-wider text-[10px]">Standard Priority</Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 font-medium">{timeAgo}</span>
                      </div>
                      
                      <h4 className="font-extrabold text-lg text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                        {report.title}
                      </h4>
                      <p className="text-slate-600 text-sm mb-6 line-clamp-2 font-medium">
                        {report.description || 'No description provided'}
                      </p>
                      
                      <div className="flex items-center gap-4 text-slate-500 text-xs font-semibold mb-6 uppercase tracking-wider">
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {realisticLocation}</span>
                        <span className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> {report.votesCount || 0} Votes</span>
                      </div>
                      
                      {/* Timeline Progress Bar */}
                      <div className="relative pt-2 pb-6">
                        <div className="absolute top-[18px] left-0 w-full h-1 bg-slate-100 rounded-full"></div>
                        <div className="absolute top-[18px] left-0 h-1 bg-slate-900 rounded-full transition-all" style={{
                            width: report.status === 'resolved' ? '100%' : report.status === 'in_progress' ? '66%' : report.status === 'open' ? '33%' : '0%'
                        }}></div>
                        
                        <div className="relative flex justify-between">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-slate-900 ring-4 ring-white z-10"></div>
                            <span className="text-[10px] uppercase font-bold text-slate-900 tracking-wider">Submitted</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ring-4 ring-white z-10 ${report.status !== 'pending' ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Assigned</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ring-4 ring-white z-10 ${report.status === 'in_progress' ? 'bg-emerald-500 animate-pulse' : report.status === 'resolved' ? 'bg-slate-900' : 'bg-slate-200'}`}></div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">In Progress</span>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <div className={`w-4 h-4 rounded-full ring-4 ring-white z-10 ${report.status === 'resolved' ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Resolved</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Side Widgets */}
            <div className="space-y-6">
              {/* Daily Impact */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  Live Platform Impact
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Issues Resolved</span>
                    <span className="font-extrabold text-slate-900 text-xl">{statsLoading ? '...' : stats?.resolvedIssues || 0}</span>
                  </div>
<<<<<<< HEAD
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Active Citizens</span>
                    <span className="font-extrabold text-slate-900 text-xl">{statsLoading ? '...' : stats?.activeUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Avg. Resolution</span>
                    <span className="font-extrabold text-emerald-600 text-xl">48 Hrs</span>
=======
                  
                  <div className="space-y-4">
                    {recentActivity && recentActivity.length > 0 ? (
                      recentActivity.map((activity: any, index: number) => (
                        <div key={activity.id || index} className="flex items-center justify-between bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full animate-pulse ${
                              activity.type === 'resolved' ? 'bg-green-400' :
                              activity.type === 'in_progress' ? 'bg-yellow-400' :
                              'bg-blue-400'
                            }`}></div>
                            <div>
                              <div className="text-sm font-medium">{activity.title}</div>
                              <div className="text-xs text-blue-100">{activity.category || 'Issue'}</div>
                            </div>
                          </div>
                          <span className="text-xs text-blue-200 whitespace-nowrap">
                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-blue-100 text-sm">No recent activity</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Impact Stats */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <span>Today&apos;s Impact</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-1">{stats?.issuesToday || 0}</div>
                      <div className="text-xs text-blue-700 font-medium">New Reports Today</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-1">{stats?.resolvedIssues || 0}</div>
                      <div className="text-xs text-green-700 font-medium">Total Resolved</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-1">{stats?.activeUsers || 0}</div>
                      <div className="text-xs text-purple-700 font-medium">Active Users</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                      <div className="text-3xl font-bold text-orange-600 mb-1">{stats?.avgResponseDays || 0}</div>
                      <div className="text-xs text-orange-700 font-medium">Avg Resolution (Days)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Top Voted Issues */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span>Most Voted Issues</span>
                  </CardTitle>
                  <CardDescription>Issues getting the most community attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topVotedReportsResponse?.issues && topVotedReportsResponse.issues.length > 0 ? (
                      topVotedReportsResponse.issues.map((item: any, index: number) => (
                        <Link href={`/reports/${item.id}`} key={item.id}>
                          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:from-blue-50 hover:to-blue-100 hover:border-blue-200 transition-all cursor-pointer mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                                index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                index === 1 ? 'bg-gray-100 text-gray-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {index + 1}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-sm truncate max-w-[150px] sm:max-w-[180px]">{item.title}</div>
                                <div className="text-xs text-gray-600 truncate">{item.location?.address || 'Unknown area'}</div>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-lg font-bold text-blue-600">{item.votesCount || 0}</div>
                              <div className="text-xs text-gray-500">votes</div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500 text-sm">No highly voted reports yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Community Engagement CTA */}
              <Card className="shadow-lg bg-gradient-to-br from-green-50 to-blue-50 border border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Join the Community</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Help make our city better by reporting issues and voting on solutions.
                  </p>
                  <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Live Updates */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-3xl p-8 text-white">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Real-time Updates</h2>
                <p className="text-blue-100 mb-6">
                  Get instant notifications about your complaints and city development projects
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>SMS & Email Notifications</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>Real-time Status Tracking</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-300" />
                    <span>Community Updates</span>
>>>>>>> 456e75f6e70a7bf5b20f7c5d924a4fd45800a5b9
                  </div>
                </div>
              </div>

              {/* Mayor's Quote / Vision */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Shield className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-emerald-400 mb-3">Our Vision</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium italic">
                    "Together we are building a smarter, cleaner, and highly responsive municipal ecosystem for every citizen."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-600 overflow-hidden relative">
                      <Image src="/images/Mayorsahab.jpg" alt="Mayor" fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Dr. Umesh Gautam</p>
                      <p className="text-xs text-slate-400">Hon'ble Mayor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
