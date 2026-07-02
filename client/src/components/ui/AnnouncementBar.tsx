"use client"
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bell } from 'lucide-react'
import { api } from '@/lib/api/client'

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true)
        const response = await api.get('/public/announcements')
        const announcementsData = response.data?.data || response.data
        if (announcementsData && Array.isArray(announcementsData)) {
          setAnnouncements(announcementsData)
        }
      } catch (error) {
        console.error('Failed to fetch announcements', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnnouncements()
    
    // Poll for announcements every 5 minutes
    const interval = setInterval(fetchAnnouncements, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading || announcements.length === 0) {
    return null
  }

  // Double the announcements for seamless infinite scrolling
  const displayAnnouncements = [...announcements, ...announcements]

  return (
    <section className="bg-emerald-600 text-white border-b border-emerald-700 relative z-50 overflow-hidden flex items-center">
      <div className="bg-emerald-700 font-bold px-4 md:px-8 py-2 flex items-center gap-2 z-20 shadow-[10px_0_15px_-3px_rgba(0,0,0,0.1)] whitespace-nowrap text-sm">
        <Bell className="w-4 h-4 animate-swing" />
        <span className="hidden sm:inline">Latest Announcements</span>
        <span className="sm:hidden">Notice</span>
      </div>
      <div className="flex-1 overflow-hidden relative flex items-center py-2">
        <motion.div 
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
          className="flex whitespace-nowrap pr-8"
        >
          {displayAnnouncements.map((text, i) => (
            <span key={i} className="mx-8 flex items-center gap-2 font-medium text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
              {text}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
