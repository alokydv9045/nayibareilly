"use client"

import LoginPage from "../page"
import { useEffect, Suspense } from "react"

function ModeratorLoginContent() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'moderator')
  }, [])
  return <LoginPage />
}

export default function ModeratorLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ModeratorLoginContent />
    </Suspense>
  )
}
