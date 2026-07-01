'use client'
import { ReactNode } from 'react'
import OfficialLayout from '@/components/layout/OfficialLayout'

export default function TechAdminLayout({ children }: { children: ReactNode }) {
  return <OfficialLayout>{children}</OfficialLayout>
}

