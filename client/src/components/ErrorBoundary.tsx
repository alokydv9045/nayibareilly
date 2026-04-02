'use client'

import React, { Component, ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetKeys?: Array<string | number>
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

/**
 * Enhanced Error Boundary Component
 * Catches JavaScript errors and provides better error handling
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private _handleError?: (event: PromiseRejectionEvent) => void

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Show toast notification
    toast.error('An unexpected error occurred')

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to monitoring service (e.g., Sentry)
    }
  }

  componentDidMount() {
    const handleError = (event: PromiseRejectionEvent) => {
      const error = event.reason
      if (error?.status === 406) {
        console.error('406 Error: Server cannot provide acceptable response')
        toast.error('Data format error. Please refresh and try again.')
      } else if (error?.status === 404) {
        console.error('404 Error: Resource not found')
      } else if (error?.status === 500) {
        toast.error('Server error. Please try again later.')
      }
    }

    window.addEventListener('unhandledrejection', handleError)
    this._handleError = handleError
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error boundary when resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      !this.areResetKeysEqual(prevProps.resetKeys, this.props.resetKeys)
    ) {
      this.reset()
    }
  }

  componentWillUnmount() {
    if (this._handleError) {
      window.removeEventListener('unhandledrejection', this._handleError)
    }
  }

  areResetKeysEqual(
    prevKeys: Array<string | number>,
    nextKeys: Array<string | number>
  ): boolean {
    if (prevKeys.length !== nextKeys.length) return false
    return prevKeys.every((key, index) => key === nextKeys[index])
  }

  reset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <DefaultErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.reset}
        />
      )
    }

    return this.props.children
  }
}

interface DefaultErrorFallbackProps {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  onReset: () => void
}

function DefaultErrorFallback({ error, errorInfo, onReset }: DefaultErrorFallbackProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-background p-4">
      <div className="max-w-2xl w-full bg-card border border-destructive/20 rounded-lg shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <div className="bg-destructive/10 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-destructive mb-4">
          Oops! Something went wrong
        </h1>

        <p className="text-center text-muted-foreground mb-6">
          We&apos;re sorry, but something unexpected happened.
          {isDevelopment 
            ? ' The error details are shown below.' 
            : ' Our team has been notified.'}
        </p>

        {isDevelopment && error && (
          <div className="mb-6 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-destructive mb-1">Error Message:</h3>
              <p className="text-sm font-mono text-muted-foreground break-all">
                {error.toString()}
              </p>
            </div>
            
            {errorInfo?.componentStack && (
              <div>
                <h3 className="text-sm font-semibold text-destructive mb-1">Component Stack:</h3>
                <pre className="text-xs font-mono text-muted-foreground overflow-auto max-h-40 whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onReset} variant="default" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline" className="gap-2">
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Page-level Error Boundary
 */
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Page Error:', {
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

/**
 * Section-level Error Boundary with compact UI
 */
export function SectionErrorBoundary({ 
  children, 
  sectionName 
}: { 
  children: ReactNode
  sectionName?: string 
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-6 border border-destructive/20 rounded-lg bg-destructive/5">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h3 className="font-semibold text-destructive">
              {sectionName ? `${sectionName} Error` : 'Section Error'}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This section couldn&apos;t be loaded. Please try refreshing the page.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="h-3 w-3" />
            Refresh Page
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Default export for backward compatibility
export default ErrorBoundary
