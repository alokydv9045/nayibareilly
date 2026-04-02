"use client"

import LoginPage from "../page"
import { useEffect, Suspense } from "react"

function StaffLoginContent() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'staff')
  }, [])
  return <LoginPage />
}

export default function StaffLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <StaffLoginContent />
    </Suspense>
  )
}
