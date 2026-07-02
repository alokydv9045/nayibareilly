'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/helpers'

interface TypingHeadingProps {
  text: string
  highlightText?: string
  highlightClass?: string
  aceternityHighlight?: boolean
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  delay?: number
}

export default function TypingHeading({ 
  text, 
  highlightText, 
  highlightClass = "text-emerald-500", 
  aceternityHighlight = false,
  className, 
  as: Component = 'h2', 
  delay = 0 
}: TypingHeadingProps) {
  const MotionComponent = motion[Component as keyof typeof motion] as any

  const container: any = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: delay }
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

  // Split text by highlight
  const parts = highlightText 
    ? text.split(new RegExp(`(${highlightText})`, 'gi')) 
    : [text];

  return (
    <MotionComponent
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      {parts.map((part, partIndex) => {
        const isHighlight = highlightText && part.toLowerCase() === highlightText.toLowerCase();
        
        // Split part by spaces but keep the spaces in the array
        const words = part.split(/(\s+)/);
        
        return (
          <span 
            key={partIndex} 
            className={cn("relative z-10", isHighlight && !aceternityHighlight && highlightClass)}
          >
            {isHighlight && aceternityHighlight && (
              <span className="hidden" />
            )}
            {words.map((word, wordIndex) => {
              if (word.trim() === '') {
                // Return spaces normally
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
          </span>
        );
      })}
    </MotionComponent>
  )
}
