"use client"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

export default function UnauthorizedPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="bg-red-100 p-4 rounded-full inline-block mb-2">
          <ShieldAlert className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900">Access Denied</h1>
        <p className="text-gray-600 text-lg">
          You don't have the required permissions to access this page. If you believe this is a mistake, please contact the system administrator.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Button 
            onClick={() => router.back()} 
            variant="outline" 
            className="border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Button 
            onClick={() => router.push('/login')} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Switch Account
          </Button>
        </div>
      </div>
    </div>
  )
}
