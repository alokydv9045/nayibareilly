'use client'
import { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center px-3 sm:px-4 overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-teal-50" />
        
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-60 h-60 sm:w-80 sm:h-80 bg-gradient-to-br from-purple-400/30 to-teal-400/30 rounded-full blur-3xl animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 right-1/3 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-teal-400/30 to-blue-400/30 rounded-full blur-3xl animate-float animation-delay-4000"></div>
        </div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rotate-45 animate-spin-slow"></div>
          <div className="absolute top-20 right-20 w-4 h-4 sm:w-6 sm:h-6 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-2 h-2 sm:w-3 sm:h-3 bg-teal-500 rotate-45 animate-bounce"></div>
          <div className="absolute bottom-10 right-10 w-3 h-3 sm:w-5 sm:h-5 bg-indigo-500 animate-ping"></div>
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Moving particles */}
        <div className="absolute inset-0">
          <div className="absolute top-1/6 left-1/6 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-particle-1"></div>
          <div className="absolute top-1/3 right-1/6 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-purple-500 rounded-full animate-particle-2"></div>
          <div className="absolute bottom-1/3 left-1/3 w-1.2 h-1.2 sm:w-1.5 sm:h-1.5 bg-teal-500 rounded-full animate-particle-3"></div>
          <div className="absolute bottom-1/6 right-1/3 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-indigo-500 rounded-full animate-particle-4"></div>
        </div>
      </div>
      
      {/* Content container with enhanced effects */}
      <div className="w-full max-w-sm sm:max-w-md relative">
        {/* Backdrop blur effect */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl -z-10"></div>
        {children}
      </div>
    </div>
  )
}
