"use client"
import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log to an error reporting service in future (Sentry, etc.)
    console.error('Global app error boundary:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
        <p className="text-base-content/70 max-w-md mx-auto">An unexpected error occurred. You can try again or return to a safe page.</p>
        {error?.digest && <p className="mt-2 text-xs opacity-50">Ref: {error.digest}</p>}
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <button onClick={() => reset()} className="btn btn-primary">Retry</button>
        <Link href="/" className="btn btn-outline">Home</Link>
      </div>
    </div>
  )
}
