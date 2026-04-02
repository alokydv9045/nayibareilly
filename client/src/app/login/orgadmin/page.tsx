"use client"

import LoginPage from "../page"
import { useEffect, Suspense } from "react"

function OrgAdminLoginContent() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'orgadmin')
  }, [])
  return <LoginPage />
}

export default function OrgAdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrgAdminLoginContent />
    </Suspense>
  )
}
