"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Wrench, Trash2, Droplets, Shield, FileText, MapPin, Users, Search, SortDesc, TrendingUp, Zap, Activity, Bell, ChevronRight, Leaf, Building, Globe } from 'lucide-react'
import AnimatedHeading from '@/components/ui/AnimatedHeading'
import TypingHeading from '@/components/ui/TypingHeading'
import { Button } from '@/components/ui/button'
import { Card, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
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
import { ISSUE_CATEGORIES } from '@/lib/validations/reportForm'
import { toast } from 'react-hot-toast'
import { usePublicStats, usePublicReports, usePublicCategories, useRecentActivity } from '@/hooks/api/usePublic'
import { formatDistanceToNow } from 'date-fns'
import HeroSection from '@/components/sections/HeroSection'
import Image from 'next/image'

export default function LandingPage() {
  const router = useRouter()
  const [showAllReports, setShowAllReports] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'votes'>('newest')
  const [page] = useState(1)

  // Fetch real-time data from backend
  const { data: stats, isLoading: statsLoading } = usePublicStats()
  const { data: reportsResponse, isLoading: reportsLoading } = usePublicReports({
    page,
    limit: showAllReports ? 50 : 5,
    status: 'all',
    sort: sortBy,
    search: searchTerm || undefined
  })
  const { data: categories } = usePublicCategories()
  const { data: recentActivity } = useRecentActivity(5)
  const { data: topVotedReportsResponse } = usePublicReports({ sort: 'votes', limit: 3, status: 'all' })

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
    <div className="min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-white bg-transparent">
      
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
            <TypingHeading as="h2" text="Report Civic Issues" highlightText="Civic Issues" className="text-3xl font-extrabold text-slate-900 justify-center mb-3" />
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
            <TypingHeading as="h2" text="Community Reports" highlightText="Reports" className="text-3xl font-extrabold text-slate-900 justify-center mb-4" />
            <p className="text-base text-slate-500 font-medium max-w-3xl mx-auto">
              Vote and review issues reported by citizens. Your voice matters in making our city better.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
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
                    onClick={() => router.push(`/reports/${report.id}`)}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden cursor-pointer group flex flex-col"
                  >
                    <div className="p-4 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {isCritical ? (
                            <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 font-bold uppercase tracking-wider text-[9px] px-1.5 py-0">Critical Priority</Badge>
                          ) : (
                            <Badge className="bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-bold uppercase tracking-wider text-[9px] px-1.5 py-0">Standard Priority</Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-medium">{timeAgo}</span>
                      </div>
                      
                      <h4 className="font-extrabold text-[15px] leading-tight text-slate-900 mb-1.5 group-hover:text-emerald-600 transition-colors">
                        {report.title}
                      </h4>
                      <p className="text-slate-600 text-[12px] mb-2.5 line-clamp-2 font-medium leading-snug">
                        {report.description || 'No description provided'}
                      </p>

                      {report.images && report.images.length > 0 && (
                        <div className={`grid gap-2 mb-4 mt-1 ${report.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                          {report.images.slice(0, 3).map((img: any, i: number, arr: any[]) => {
                            const isFirstOfThree = arr.length >= 3 && i === 0;
                            return (
                              <div 
                                key={i} 
                                className={`relative rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 group/img ${
                                  isFirstOfThree ? 'col-span-2 aspect-[2/1] max-h-[160px]' : 
                                  arr.length === 1 ? 'aspect-[16/9] max-h-[200px]' : 
                                  'aspect-square sm:aspect-[4/3] max-h-[120px]'
                                }`}
                              >
                                 {/* eslint-disable-next-line @next/next/no-img-element */}
                                 <img 
                                  src={img.url} 
                                  alt={`${report.title} image ${i + 1}`} 
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" 
                                />
                                {report.images.length > 3 && i === 2 && (
                                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px] transition-colors group-hover/img:bg-black/60">
                                    <span className="text-white font-extrabold text-lg">+{report.images.length - 3}</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 text-slate-500 text-[10px] font-semibold mb-3 uppercase tracking-wider mt-auto">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {realisticLocation}</span>
                        <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {report.votesCount || 0} Votes</span>
                       </div>
                      
                      {/* Timeline Progress Bar */}
                      <div className="relative pt-1 pb-2">
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
              {filteredAndSortedReports.length > 0 && !showAllReports && (
                <div className="text-center mt-6">
                  <Button 
                    onClick={() => setShowAllReports(true)}
                    variant="outline"
                    className="rounded-full px-8 font-semibold bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    View All Reports
                  </Button>
                </div>
              )}
            </div>

            {/* Side Widgets */}
            <div className="space-y-6">
              {/* Daily Impact */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <AnimatedHeading as="h3" className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-6">
                  <Activity className="h-5 w-5 text-emerald-500" />
                  Live Platform Impact
                </AnimatedHeading>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Issues Resolved</span>
                    <span className="font-extrabold text-slate-900 text-xl">{statsLoading ? '...' : stats?.resolvedIssues || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <span className="text-slate-500 font-medium">Active Citizens</span>
                    <span className="font-extrabold text-slate-900 text-xl">{statsLoading ? '...' : stats?.activeUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Avg. Resolution</span>
                    <span className="font-extrabold text-emerald-600 text-xl">48 Hrs</span>
                  </div>
                </div>
              </div>

              {/* Mayor's Quote / Vision */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-lg text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Shield className="w-24 h-24" />
                </div>
                <div className="relative z-10">
                  <AnimatedHeading as="h3" className="text-lg font-bold text-emerald-400 mb-3">Our Vision</AnimatedHeading>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 font-medium italic">
                    "Together we are building a smarter, cleaner, and highly responsive municipal ecosystem for every citizen."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-emerald-500 relative flex-shrink-0">
                      <Image src="/images/Mayorsahab.jpg" alt="Mayor" fill sizes="48px" className="object-cover" />
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

      {/* Key Government Initiatives */}
      <section className="py-20 relative z-10 overflow-hidden bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <Badge className="px-4 py-2 text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 mb-4 uppercase tracking-wider">
              National Programs
            </Badge>
            <TypingHeading as="h2" text="Key Civic Initiatives" highlightText="Civic Initiatives" className="text-4xl font-extrabold text-slate-900 justify-center mb-4" />
            <p className="text-slate-600 text-lg max-w-2xl mx-auto font-medium">
              Aligning with national goals to transform Bareilly into a sustainable, modern, and citizen-first metropolis.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Smart City */}
            <motion.div whileHover={{ y: -8, boxShadow: "0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="h-full border-0 shadow-lg overflow-hidden group bg-gradient-to-br from-indigo-50 to-white relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Building className="w-32 h-32 text-indigo-900" />
                </div>
                <CardContent className="p-8 relative z-10">
                  <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Building className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">Smart City Mission</h3>
                  <p className="text-slate-600 mb-6 font-medium leading-relaxed">
                    Integrating IoT sensors, centralized command centers, and digital service delivery for intelligent urban management.
                  </p>
                  <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-0 h-auto font-bold flex items-center gap-1 group/btn">
                    Explore Mission <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Swachh Bharat */}
            <motion.div whileHover={{ y: -8, boxShadow: "0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="h-full border-0 shadow-lg overflow-hidden group bg-gradient-to-br from-emerald-50 to-white relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Leaf className="w-32 h-32 text-emerald-900" />
                </div>
                <CardContent className="p-8 relative z-10">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Leaf className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-emerald-600 transition-colors">Swachh Bharat</h3>
                  <p className="text-slate-600 mb-6 font-medium leading-relaxed">
                    100% door-to-door waste collection, scientific waste processing, and community-driven cleanliness drives.
                  </p>
                  <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-0 h-auto font-bold flex items-center gap-1 group/btn">
                    View Progress <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Digital India */}
            <motion.div whileHover={{ y: -8, boxShadow: "0px 20px 25px -5px rgba(0,0,0,0.1), 0px 10px 10px -5px rgba(0,0,0,0.04)" }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
              <Card className="h-full border-0 shadow-lg overflow-hidden group bg-gradient-to-br from-sky-50 to-white relative">
                <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Globe className="w-32 h-32 text-sky-900" />
                </div>
                <CardContent className="p-8 relative z-10">
                  <div className="w-16 h-16 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-sky-600 transition-colors">Digital Governance</h3>
                  <p className="text-slate-600 mb-6 font-medium leading-relaxed">
                    Bringing all municipal services to your fingertips. Paperless approvals, online tax payments, and direct feedback.
                  </p>
                  <Button variant="ghost" className="text-sky-600 hover:text-sky-700 hover:bg-sky-50 p-0 h-auto font-bold flex items-center gap-1 group/btn">
                    Access Services <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
