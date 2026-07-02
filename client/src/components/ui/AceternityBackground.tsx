'use client'

import { motion } from 'framer-motion'
import { Leaf, Droplets, Wind, Building2, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AceternityBackground() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Define floating icons to scatter across the background
  const floatingIcons = [
    { Icon: Leaf, size: 32, top: '15%', left: '10%', delay: 0, duration: 15 },
    { Icon: Droplets, size: 24, top: '25%', left: '85%', delay: 2, duration: 18 },
    { Icon: Wind, size: 36, top: '65%', left: '15%', delay: 4, duration: 20 },
    { Icon: Building2, size: 40, top: '75%', left: '80%', delay: 1, duration: 16 },
    { Icon: Sun, size: 32, top: '45%', left: '90%', delay: 3, duration: 22 },
    { Icon: Leaf, size: 20, top: '85%', left: '40%', delay: 5, duration: 14 },
    { Icon: Droplets, size: 28, top: '10%', left: '50%', delay: 6, duration: 19 },
  ]

  return (
    <div className="fixed inset-0 z-[-1] h-screen w-full bg-emerald-50/30 bg-dot-emerald flex items-center justify-center pointer-events-none overflow-hidden">
      
      {/* Radial gradient mask to fade out the dots towards the edges */}
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black_80%)]"></div>

      {/* Floating Framer Motion Icons */}
      {floatingIcons.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 100 }}
          animate={{
            opacity: [0, 0.6, 0.6, 0],
            y: [-20, -120],
            x: Math.sin(index) * 60,
            rotate: [0, 180, 360]
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear",
          }}
          className="absolute text-emerald-500/40"
          style={{ top: item.top, left: item.left }}
        >
          <item.Icon size={item.size} strokeWidth={1.5} />
        </motion.div>
      ))}
    </div>
  )
}
