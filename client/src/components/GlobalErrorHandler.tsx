'use client'

import { useEffect } from 'react'

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        // Safely handle any type of rejection
        const reason = event.reason
        
        // If reason is null, undefined, or empty, just prevent and return
        if (reason === null || reason === undefined || reason === '') {
          console.log('Handled null/empty promise rejection')
          event.preventDefault()
          return
        }
        
        // Only log meaningful errors
        if (reason && typeof reason === 'object' && reason.message) {
          console.error('Unhandled promise rejection:', reason.message)
        } else if (reason && typeof reason === 'string') {
          console.error('Unhandled promise rejection:', reason)
        } else {
          console.log('Handled non-standard promise rejection')
          event.preventDefault()
          return
        }
        
        // Check if it's an authentication error
        const message = reason?.message || reason?.toString() || ''
        if (message.includes('401') || 
            message.includes('Unauthorized') ||
            reason?.status === 401) {
          console.log('Authentication error caught and handled')
          event.preventDefault()
          return
        }
        
        // Check if it's a network error
        if (message.includes('fetch') || 
            message.includes('TypeError') ||
            reason?.name === 'TypeError') {
          console.log('Network error caught and handled')
          event.preventDefault()
          return
        }
      } catch {
        // If anything goes wrong in error handling, just prevent the event
        console.log('Error in promise rejection handler, prevented')
        event.preventDefault()
      }
    }

    // Handle unhandled errors
    const handleError = (event: ErrorEvent) => {
      try {
        // Safely handle any type of error
        const error = event.error
        
        // If error is null, undefined, or empty, just prevent and return
        if (error === null || error === undefined) {
          console.log('Handled null error event')
          event.preventDefault()
          return
        }
        
        // Only log meaningful errors
        if (error && typeof error === 'object' && error.message) {
          console.error('Unhandled error:', error.message)
        } else if (error && typeof error === 'string') {
          console.error('Unhandled error:', error)
        } else {
          console.log('Handled non-standard error')
          event.preventDefault()
          return
        }
        
        // Check if it's an authentication error
        const message = error?.message || error?.toString() || ''
        if (message.includes('401') || 
            message.includes('Unauthorized')) {
          console.log('Authentication error caught and handled')
          event.preventDefault()
          return
        }
      } catch {
        // If anything goes wrong in error handling, just prevent the event
        console.log('Error in error handler, prevented')
        event.preventDefault()
      }
    }

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)

    // Cleanup
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [])

  return null
}