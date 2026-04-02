"use client"

import LoginPage from "../page"
import { useEffect, Suspense } from "react"

function SuperAdminLoginContent() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'superadmin')
  }, [])
  return <LoginPage />
}

export default function SuperAdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SuperAdminLoginContent />
    </Suspense>
  )
}
