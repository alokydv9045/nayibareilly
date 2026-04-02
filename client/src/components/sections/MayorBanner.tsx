"use client"

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Award, Users, Building2, Heart, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface MayorBannerSlide {
  id: string
  title: string
  titleHindi: string
  description: string
  descriptionHindi: string
  image: string
  stats?: {
    icon: React.ComponentType<{ className?: string }>
    value: string
    label: string
  }[]
  cta?: {
    text: string
    href: string
  }
}

const mayorSlides: MayorBannerSlide[] = [
  {
    id: 'welcome',
    title: 'Welcome to Nayi Bareilly',
    titleHindi: 'नई बरेली में आपका स्वागत है',
    description: 'Under the dynamic leadership of Mayor Dr. Umesh Gautam, Bareilly is transforming into a modern, sustainable, and citizen-centric city.',
    descriptionHindi: 'मेयर डॉ. उमेश गौतम के गतिशील नेतृत्व में बरेली एक आधुनिक, टिकाऊ और नागरिक-केंद्रित शहर में बदल रहा है।',
    image: '/images/common/mayor-1.svg', // Placeholder - will be replaced with actual image
    stats: [
      { icon: Users, value: '7.5L+', label: 'Citizens Served' },
      { icon: Building2, value: '500+', label: 'Projects Completed' },
      { icon: Award, value: '95%', label: 'Satisfaction Rate' }
    ]
  },
  {
    id: 'initiatives',
    title: 'Smart City Initiatives',
    titleHindi: 'स्मार्ट सिटी पहल',
    description: 'Revolutionary digital governance platform connecting citizens directly with municipal services for faster, transparent solutions.',
    descriptionHindi: 'क्रांतिकारी डिजिटल शासन मंच जो नागरिकों को सीधे नगरपालिका सेवाओं से जोड़ता है, तेज और पारदर्शी समाधानों के लिए।',
    image: '/images/common/mayor-2.svg', // Placeholder
    stats: [
      { icon: Target, value: '24/7', label: 'Service Availability' },
      { icon: TrendingUp, value: '60%', label: 'Faster Resolution' },
      { icon: Heart, value: '100%', label: 'Citizen Focused' }
    ],
    cta: {
      text: 'Report an Issue',
      href: '/report'
    }
  },
  {
    id: 'achievements',
    title: 'Key Achievements',
    titleHindi: 'मुख्य उपलब्धियां',
    description: 'From waste management to infrastructure development, see how Mayor Dr. Umesh Gautam is making Bareilly a model city.',
    descriptionHindi: 'कचरा प्रबंधन से लेकर बुनियादी ढांचे के विकास तक, देखें कि मेयर डॉ. उमेश गौतम बरेली को एक आदर्श शहर कैसे बना रहे हैं।',
    image: '/images/common/mayor-3.svg', // Placeholder
    stats: [
      { icon: Building2, value: '₹500Cr+', label: 'Infrastructure Investment' },
      { icon: Users, value: '10K+', label: 'Jobs Created' },
      { icon: Award, value: '15+', label: 'National Awards' }
    ]
  }
]

export default function MayorBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % mayorSlides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mayorSlides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mayorSlides.length) % mayorSlides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const currentSlideData = mayorSlides[currentSlide]

  return (
    <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-green-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* Content Side */}
          <div className="space-y-6 animate-fadeInUp">
            {/* Mayor Title */}
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-200">
                Hon&apos;ble Mayor of Bareilly
              </h3>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                Dr. Umesh Gautam
              </h2>
              <p className="text-sm sm:text-base text-blue-200">
                भारतीय जनता पार्टी (BJP) • बरेली नगर निगम
              </p>
            </div>

            {/* Slide Content */}
            <div className="space-y-4 min-h-[200px]">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {currentSlideData.title}
                </h3>
                <h4 className="text-lg sm:text-xl font-semibold text-blue-200">
                  {currentSlideData.titleHindi}
                </h4>
              </div>

              <p className="text-base sm:text-lg text-gray-200 leading-relaxed">
                {currentSlideData.description}
              </p>
              <p className="text-sm sm:text-base text-blue-100 leading-relaxed">
                {currentSlideData.descriptionHindi}
              </p>

              {/* Stats */}
              {currentSlideData.stats && (
                <div className="grid grid-cols-3 gap-4 mt-6">
                  {currentSlideData.stats.map((stat, index) => (
                    <div key={index} className="text-center">
                      <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-blue-300" />
                      <div className="text-lg sm:text-xl font-bold text-white">
                        {stat.value}
                      </div>
                      <div className="text-xs sm:text-sm text-blue-200">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA Button */}
              {currentSlideData.cta && (
                <div className="pt-4">
                  <Button
                    asChild
                    className="bg-white text-blue-900 hover:bg-blue-50 font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    <a href={currentSlideData.cta.href}>
                      {currentSlideData.cta.text}
                    </a>
                  </Button>
                </div>
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex space-x-2">
                {mayorSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-white scale-125'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={prevSlide}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={nextSlide}
                  className="text-white hover:bg-white/20 rounded-full p-2"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Image Side */}
          <div className="relative">
            <Card className="overflow-hidden shadow-2xl border-0">
              <CardContent className="p-0">
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center relative">
                  {/* Placeholder for Mayor Image */}
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gradient-to-br from-blue-500 to-green-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
                      <Users className="h-16 w-16 sm:h-20 sm:w-20 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg sm:text-xl font-bold text-gray-800">
                        Mayor Dr. Umesh Gautam
                      </p>
                      <p className="text-sm text-gray-600">
                        Hon&apos;ble Mayor, Bareilly
                      </p>
                    </div>
                  </div>

                  {/* Overlay with slide indicator */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/50 backdrop-blur rounded-lg px-4 py-2">
                      <p className="text-white text-sm font-medium text-center">
                        {currentSlide + 1} of {mayorSlides.length}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Auto-play toggle */}
      <button
        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
        className="absolute bottom-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur rounded-full p-2 transition-all duration-300"
        aria-label={isAutoPlaying ? 'Pause auto-play' : 'Start auto-play'}
      >
        {isAutoPlaying ? (
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        ) : (
          <div className="w-0 h-0 border-l-4 border-l-white border-t-2 border-t-transparent border-b-2 border-b-transparent ml-1"></div>
        )}
      </button>
    </section>
  )
}