'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils/helpers' // Used helper for better resolution

interface AnimatedHeadingProps {
  children: ReactNode
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  delay?: number
}

export default function AnimatedHeading({ children, className, as: Component = 'h2', delay = 0 }: AnimatedHeadingProps) {
  const MotionComponent = motion[Component as keyof typeof motion] as any

  if (typeof children === 'string') {
    const container: any = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.03, delayChildren: delay }
      }
    };
    
    const child: any = {
      hidden: { opacity: 0, y: 10, filter: "blur(2px)" },
      visible: { 
        opacity: 1, 
        y: 0, 
        filter: "blur(0px)",
        transition: { type: "spring", damping: 12, stiffness: 100 }
      }
    };

    const words = children.split(/(\s+)/);

    return (
      <MotionComponent
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className={cn("bg-clip-text relative z-10", className)}
      >
        {words.map((word, wordIndex) => {
          if (word.trim() === '') {
            return <span key={wordIndex}>{word}</span>;
          }
          return (
            <span key={wordIndex} className="inline-block whitespace-nowrap">
              {word.split('').map((char, charIndex) => (
                <motion.span key={charIndex} variants={child} className="inline-block">
                  {char}
                </motion.span>
              ))}
            </span>
          );
        })}
      </MotionComponent>
    );
  }

  // Fallback for non-string children
  return (
    <MotionComponent
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98],
        delay: delay
      }}
      className={cn("bg-clip-text", className)}
    >
      {children}
    </MotionComponent>
  )
}
