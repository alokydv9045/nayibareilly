"use client"
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export default function AdminDiagnostic() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Diagnostic Panel</h1>
            <p className="mt-2 text-slate-600">This page is temporarily disabled during migration.</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-slate-700">
              Diagnostics will return after the migration to the new backend is complete.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
