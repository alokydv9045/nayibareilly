import Link from 'next/link'
import { Home, AlertCircle, MapPin, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl aspect-square bg-slate-200/40 rounded-full blur-3xl -z-10" />

      <div className="bg-white p-10 sm:p-14 rounded-3xl shadow-xl border border-slate-100 max-w-lg w-full text-center relative">
        <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-rose-100 rotate-3 hover:rotate-6 transition-transform">
          <AlertCircle className="w-10 h-10 text-rose-500" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-7xl font-black text-slate-900 tracking-tight mb-4">
          404
        </h1>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Page Not Found
        </h2>
        
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          The civic page or resource you are looking for doesn't exist, has been moved, or you might not have access to it.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all font-bold">
            <Link href="/">
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Link>
          </Button>
          
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50 font-bold transition-colors">
            <Link href="/public-map">
              <MapPin className="w-5 h-5 mr-2" />
              Public Map
            </Link>
          </Button>
        </div>
        
        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest gap-2">
          <Shield className="w-3.5 h-3.5" />
          <span>Nayi Bareilly Portal</span>
        </div>
      </div>
    </main>
  )
}
