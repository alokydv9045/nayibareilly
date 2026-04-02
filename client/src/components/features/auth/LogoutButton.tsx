'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { unifiedLogout } from '@/lib/utils/unified-logout'

interface LogoutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showIcon?: boolean
  showConfirmDialog?: boolean
  onLogoutStart?: () => void
  onLogoutComplete?: () => void
  onLogoutError?: (error: string) => void
  children?: React.ReactNode
}

export default function LogoutButton({
  variant = 'ghost',
  size = 'default',
  className = '',
  showIcon = true,
  showConfirmDialog = true,
  onLogoutStart,
  onLogoutComplete,
  onLogoutError,
  children
}: LogoutButtonProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const performLogout = async () => {
    try {
      setIsLoggingOut(true)
      onLogoutStart?.()

      // Use unified logout utility
      await unifiedLogout({
        showToast: true,
        redirectTo: '/',
        onSuccess: () => {
          onLogoutComplete?.()
          // Navigate to home with a slight delay for better UX
          setTimeout(() => {
            router.push('/')
            router.refresh() // Force page refresh to clear any cached state
          }, 500)
        },
        onError: (errorMessage) => {
          onLogoutError?.(errorMessage)
          // Still navigate away even on error
          setTimeout(() => {
            router.push('/')
            router.refresh()
          }, 1000)
        },
        timeout: 10000
      })

    } catch (error) {
      console.error('Logout error:', error)
      
      // Fallback: still navigate away
      setTimeout(() => {
        router.push('/')
        router.refresh()
      }, 1000)

    } finally {
      setIsLoggingOut(false)
      setDialogOpen(false)
    }
  }

  const handleLogoutClick = () => {
    if (showConfirmDialog) {
      setDialogOpen(true)
    } else {
      void performLogout()
    }
  }

  const LogoutContent = () => (
    <>
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {children || 'Log out'}
    </>
  )

  if (showConfirmDialog) {
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant={variant} 
            size={size}
            className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
            disabled={isLoggingOut}
            onClick={handleLogoutClick}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              <LogoutContent />
            )}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-lg font-semibold">
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to log out? You&apos;ll need to sign in again to access your account.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={isLoggingOut}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={performLogout}
              disabled={isLoggingOut}
              className="flex-1"
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Yes, Log out
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Button 
      variant={variant} 
      size={size}
      className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
      disabled={isLoggingOut}
      onClick={handleLogoutClick}
    >
      {isLoggingOut ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging out...
        </>
      ) : (
        <LogoutContent />
      )}
    </Button>
  )
}

// Hook for programmatic logout
export const useLogout = () => {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const performLogout = async (options?: {
    showToast?: boolean
    redirectTo?: string
    onComplete?: () => void
    onError?: (error: string) => void
  }) => {
    const {
      showToast = true,
      redirectTo = '/',
      onComplete,
      onError
    } = options || {}

    try {
      setIsLoggingOut(true)

      // Use unified logout utility
      await unifiedLogout({
        showToast,
        redirectTo,
        onSuccess: () => {
          onComplete?.()
          setTimeout(() => {
            router.push(redirectTo)
            router.refresh()
          }, 500)
        },
        onError: (errorMessage) => {
          onError?.(errorMessage)
          // Still navigate away
          setTimeout(() => {
            router.push(redirectTo)
            router.refresh()
          }, 1000)
        },
        timeout: 10000
      })

    } catch (error) {
      console.error('Logout error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Logout failed'
      onError?.(errorMessage)

      // Still navigate away
      setTimeout(() => {
        router.push(redirectTo)
        router.refresh()
      }, 1000)

    } finally {
      setIsLoggingOut(false)
    }
  }

  return {
    logout: performLogout,
    isLoggingOut
  }
}