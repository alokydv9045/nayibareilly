'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Camera, MapPin, Zap, ArrowRight, Shield, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
    <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-green-50/30 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-16 xl:gap-20 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Top Badge */}
            <Badge className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-600 to-green-600 text-white border-0 hover:shadow-lg transition-shadow">
              <Zap className="w-4 h-4 mr-2" />
              Smart Civic Solution
            </Badge>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
                  NayiBareilly
                </span>
              </h1>
              
              <p className="text-2xl lg:text-3xl font-semibold text-slate-700">
                Empowering Citizens, Building Smarter Cities
              </p>

              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                Report civic issues as easy as clicking a photo. AI-powered detection, GPS auto-tagging, and real-time transparent tracking.
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
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 hover:shadow-md hover:scale-105 transition-all cursor-pointer"
                >
                  <item.icon className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-slate-700">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105">
                <Link href="/report">
                  <Camera className="w-5 h-5 mr-2" />
                  Report Issue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              
              <Button asChild size="lg" variant="outline" className="border-2 hover:bg-slate-50 hover:scale-105 transition-all">
                <Link href="/track">
                  <MapPin className="w-5 h-5 mr-2" />
                  Track Issues
                </Link>
              </Button>

              <Button asChild size="lg" variant="outline" className="border-2 border-blue-200 hover:bg-blue-50 hover:scale-105 transition-all">
                <Link href="/public-map">
                  <MapPin className="w-5 h-5 mr-2" />
                  View Public Map
                </Link>
              </Button>
            </div>

            
          </div>

          {/* Right Content - Mayor Enhanced Card */}
          <div className="lg:col-span-3 relative group max-w-4xl mx-auto lg:max-w-3xl xl:max-w-4xl lg:ml-auto lg:mr-8 xl:mr-12">
            {/* Enhanced Main Card */}
            <div className="relative overflow-hidden rounded-3xl shadow-2xl transition-all duration-500 group-hover:shadow-3xl group-hover:scale-[1.02] border-4 border-white/50">
              
              {/* Enhanced Image Container */}
              <div className="aspect-[4/3] relative bg-gradient-to-br from-blue-100 to-green-100 overflow-hidden min-h-[300px] lg:min-h-[350px] xl:min-h-[400px]">
                {/* Mayor image from public folder */}
                <div className="absolute inset-0">
                  <Image 
                    src="/images/Mayorsahab.jpg" 
                    alt="Mayor Dr. Umesh Gautam" 
                    fill 
                    className="object-cover" 
                    priority 
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 45vw, (max-width: 1280px) 35vw, 30vw"
                  />
                </div>

                {/* Overlay with gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Auto-changing content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm mb-2 text-xs">
                    <Shield className="w-3 h-3 mr-1" />
                    Hon&apos;ble Mayor of Bareilly
                  </Badge>
                  
                  <h3 className="text-lg font-bold mb-1">
                    {mayorContent[currentSlide].title}
                  </h3>
                  <p className="text-xs text-white/90 line-clamp-2">
                    {mayorContent[currentSlide].description}
                  </p>
                  
                  {/* Slide Indicators */}
                  <div className="flex gap-2 mt-3">
                    {mayorContent.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1.5 rounded-full transition-all ${
                          idx === currentSlide ? 'w-8 bg-white' : 'w-1.5 bg-white/40'
                        }`}
                        aria-label={`Slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Info Card */}
              <div className="bg-white p-6">
                <div className="flex items-center gap-4">
                  {/* Small Avatar */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                    <Image src="/images/Mayorsahab.jpg" alt="Mayor avatar" width={64} height={64} className="object-cover" />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      Dr. Umesh Gautam
                    </h3>
                    <p className="text-base font-medium text-slate-600">
                      Hon&apos;ble Mayor
                    </p>
                    <p className="text-sm text-slate-500">
                      Bareilly Municipal Corporation
                    </p>
                  </div>
                </div>

                {/* Stats Row */}
                
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-3 -right-3 w-20 h-20 bg-blue-400/20 rounded-full blur-xl group-hover:bg-blue-400/30 transition-colors -z-10" />
            <div className="absolute -bottom-3 -left-3 w-24 h-24 bg-green-400/20 rounded-full blur-xl group-hover:bg-green-400/30 transition-colors -z-10" />
          </div>

        </div>
      </div>
    </section>
  )
}
