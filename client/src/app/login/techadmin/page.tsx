"use client"

import LoginPage from "../page"
import { useEffect, Suspense } from "react"

function TechAdminLoginContent() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'techadmin')
  }, [])
  return <LoginPage />
}

export default function TechAdminLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <TechAdminLoginContent />
    </Suspense>
  )
}

