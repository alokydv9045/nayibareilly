'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Camera, MapPin, Zap, ArrowRight, Shield, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AnimatedHeading from '@/components/ui/AnimatedHeading'
import TypingHeading from '@/components/ui/TypingHeading'

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const mayorContent = [
    {
      title: "Welcome to NayiBareilly",
      description: "Under the visionary leadership of Mayor Dr. Umesh Gautam, Bareilly is transforming into a smart, sustainable, and citizen-centric city.",
      highlight: "Digital Governance Initiative"
    },
    {
      title: "Smart City Revolution",
      description: "Revolutionary digital governance platform connecting citizens directly with municipal services for faster, transparent solutions.",
      highlight: "24/7 Citizen Services"
    },
    {
      title: "Building Better Future",
      description: "From infrastructure to innovation, we're making Bareilly a model city with world-class amenities and sustainable development.",
      highlight: "Infrastructure Excellence"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mayorContent.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [mayorContent.length])

  return (
    <section className="relative z-0 overflow-hidden pt-12 pb-24 min-h-[85vh] flex items-center">
      {/* Enhanced Animated Background similar to AuthLayout */}
      <div className="absolute inset-0 z-[-1] pointer-events-none">
        {/* Removed local gradient to let global Aceternity bg show through */}
        <div className="absolute inset-0" />
        
        {/* Large Gradient Orbs (Theme Colors: Emerald and Slate) */}
        <div className="absolute inset-0 opacity-60">
          <motion.div 
            animate={{ y: [0, -30, 0], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-emerald-400/20 to-teal-300/10 rounded-full blur-3xl" 
          />
          <motion.div 
            animate={{ y: [0, 40, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-tl from-slate-400/20 to-emerald-500/10 rounded-full blur-3xl" 
          />
        </div>

        {/* Floating Geometric Shapes (Actual Framer Motion) */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Diamond */}
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [45, 90, 45] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[15%] w-8 h-8 border-2 border-emerald-400/40 rounded-sm"
          />
          
          {/* Hollow Circle */}
          <motion.div
            animate={{ y: [0, 30, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-1/3 right-[10%] w-12 h-12 border-[3px] border-slate-300/50 rounded-full"
          />

          {/* Plus Sign */}
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 180, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 left-[20%] text-emerald-500/30"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </motion.div>

          {/* Triangle */}
          <motion.div
            animate={{ y: [0, 25, 0], rotate: [0, -45, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute top-1/4 right-[25%] text-slate-400/40"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round">
              <polygon points="12 3 22 20 2 20"></polygon>
            </svg>
          </motion.div>
          
          {/* Solid small dots (Particles) */}
          <motion.div
            animate={{ y: [0, -40, 0], x: [0, 20, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[15%] right-[30%] w-3 h-3 bg-emerald-500/40 rounded-full"
          />
          <motion.div
            animate={{ y: [0, 30, 0], x: [0, -15, 0] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute top-[15%] left-[40%] w-2 h-2 bg-slate-500/40 rounded-full"
          />
        </div>

        {/* Removed local grid pattern to prevent conflict with global dot pattern */}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="lg:col-span-7 space-y-8"
          >
            {/* Top Badge */}
            <Badge className="px-4 py-2 text-xs sm:text-sm font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-sm uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 mr-2 text-emerald-500" />
              Smart Civic Solution
            </Badge>

            {/* Main Heading */}
            <div className="space-y-6">
              <TypingHeading 
                as="h1" 
                text="Nayi Bareilly" 
                highlightText="Bareilly" 
                className="text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight" 
              />
              
              <TypingHeading 
                as="h2" 
                delay={0.2} 
                text="Empowering Citizens, Building Smarter Cities" 
                highlightText="Building Smarter Cities"
                aceternityHighlight={true}
                className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight"
              />

              <p className="text-lg text-slate-600 leading-relaxed max-w-2xl">
                Report civic issues as easy as clicking a photo. AI-powered detection, GPS auto-tagging, and real-time transparent tracking for a cleaner, smarter city.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              {[
                { icon: Camera, text: "Photo Reporting" },
                { icon: MapPin, text: "GPS Tracking" },
                { icon: Zap, text: "AI Detection" },
                { icon: CheckCircle2, text: "Real-time Updates" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-slate-200"
                >
                  <item.icon className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-700">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg transition-all border-0 px-8 w-full sm:w-auto">
                  <Link href="/report">
                    <Camera className="w-5 h-5 mr-2" />
                    Report Issue
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Button asChild size="lg" variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all px-8 w-full sm:w-auto shadow-sm">
                  <Link href="/track">
                    <MapPin className="w-5 h-5 mr-2" />
                    Track Progress
                  </Link>
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 17 }}>
                <Button asChild size="lg" variant="outline" className="bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all px-8 w-full sm:w-auto shadow-sm">
                  <Link href="/public-map">
                    <MapPin className="w-5 h-5 mr-2" />
                    View Public Map
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Content - Mayor Enhanced Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-5 relative w-full max-w-md mx-auto lg:max-w-none"
          >
            {/* Clean Sharp Framed Layout */}
            <div className="relative bg-white rounded-2xl p-4 shadow-xl border border-slate-200">
              
              {/* Image Container */}
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                <Image 
                  src="/images/Mayorsahab.jpg" 
                  alt="Mayor Dr. Umesh Gautam" 
                  fill 
                  className="object-cover" 
                  priority 
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, 400px"
                />
                
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 text-white">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md mb-3 text-xs uppercase tracking-wider font-bold">
                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                    Office of the Mayor
                  </Badge>
                  
                  <h3 className="text-2xl font-bold mb-2 leading-tight">
                    {mayorContent[currentSlide].title}
                  </h3>
                  <p className="text-sm text-slate-200 line-clamp-3 mb-6 leading-relaxed font-medium">
                    {mayorContent[currentSlide].description}
                  </p>
                  
                  {/* Slide Indicators */}
                  <div className="flex gap-2">
                    {mayorContent.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          idx === currentSlide ? 'w-8 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/60'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Info Card */}
              <div className="flex items-center gap-4 mt-4 px-2">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    Dr. Umesh Gautam
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                    Hon'ble Mayor, Bareilly
                  </p>
                </div>
              </div>
            </div>

            {/* Subtle background shadow element (clean) */}
            <div className="absolute -top-6 -right-6 w-full h-full bg-slate-200/50 rounded-2xl z-[-1] blur-sm" />
          </motion.div>

        </div>
      </div>
    </section>
  )
}
