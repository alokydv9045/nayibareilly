'use client'
import { useRouter } from 'next/navigation'
import { LogOut, PlusCircle, User, Globe } from 'lucide-react'
import { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { logout } from '@/lib/api/auth'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { DynamicNavigation } from '@/components/navigation/DynamicNavigation'
import { useNavigation } from '@/hooks/navigation/useNavigation'
import { useLanguage } from '@/hooks/ui/useLanguage'

export default function CitizenLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [language, , toggleLanguage] = useLanguage()
  const { roleDisplayName, isAuthenticated } = useNavigation(language)

  const onLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch {
      router.push('/login')
    }
  }

  // toggleLanguage provided by useLanguage

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-[80vh] flex flex-col lg:grid lg:grid-cols-[260px_1fr] gap-4 lg:gap-6">
      {/* Mobile Header Navigation */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white rounded-xl border border-border">
        <div className="text-sm font-semibold text-muted-foreground">{roleDisplayName}</div>
        <Button variant="outline" size="sm" onClick={() => router.push('/report')} className="min-h-[44px]">
          <PlusCircle className="h-4 w-4 mr-2" />
          {language === 'hi' ? 'रिपोर्ट' : 'Report'}
        </Button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block rounded-2xl border border-border bg-white p-4 h-fit sticky top-4 self-start">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-xs font-semibold text-muted-foreground">{roleDisplayName}</div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className="h-8 w-8 p-0"
            title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
          >
            <Globe className="h-4 w-4" />
          </Button>
        </div>
        
        <DynamicNavigation variant="sidebar" language={language} />
        
        <Separator className="my-4" />
        <Button variant="outline" className="w-full min-h-[44px]" onClick={onLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          {language === 'hi' ? 'लॉगआउट' : 'Logout'}
        </Button>
      </aside>

      <section className="flex-1 pb-20 lg:pb-0">
        {/* Desktop Topbar */}
        <div className="hidden lg:flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            🏛️ {language === 'hi' ? 'एक बेहतर बरेली का निर्माण' : 'Building a Better Bareilly Together'}
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/report')} className="min-h-[44px]">
            <PlusCircle className="h-4 w-4 mr-2" />
            {language === 'hi' ? 'नई रिपोर्ट' : 'New Report'}
          </Button>
        </div>
        
        {/* Mobile Profile Access */}
        <div className="lg:hidden flex items-center justify-between mb-4 p-4 bg-white rounded-xl border border-border">
          <div className="text-sm text-muted-foreground">
            🏛️ {language === 'hi' ? 'नयी बरेली • स्मार्ट सिटी' : 'Nayi Bareilly • Smart City'}
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLanguage} 
              className="min-h-[44px] min-w-[44px]"
              title={language === 'en' ? 'Switch to Hindi' : 'Switch to English'}
            >
              <Globe className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push('/profile')} className="min-h-[44px] min-w-[44px]">
              <User className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onLogout} className="min-h-[44px] min-w-[44px]">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ErrorBoundary>
          <div className="space-y-6">{children}</div>
        </ErrorBoundary>
      </section>

      {/* Mobile Bottom Navigation */}
      <DynamicNavigation variant="mobile" language={language} />
    </div>
  )
}
