"use client"
import RequireUser from '@/components/features/auth/RequireUser'
import CitizenLayout from '@/components/layout/CitizenLayout'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMyIssues, type Issue } from '@/hooks/api/useIssues'
import IssueCard from '@/components/features/citizen/IssueCard'
import { useState, useMemo, Suspense, useEffect } from 'react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

function CategoryContent() {
  const params = useSearchParams()
  const router = useRouter()
  const [category, setCategory] = useState('')
  const { data: issues } = useMyIssues({ category: category || undefined })

  useEffect(() => {
    const catParam = params.get('c') || ''
    setCategory(catParam)
  }, [params])

  const categories = useMemo(() => [
    'roads','water','electricity','safety','environment','health','services','other'
  ], [])

  const changeCategory = (c: string) => {
    setCategory(c)
    const qp = new URLSearchParams()
    if (c) qp.set('c', c)
    router.replace(`/category?${qp.toString()}`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Browse by Category</h1>
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => changeCategory(c)}
              className={`px-3 py-1 rounded border text-sm transition ${c===category ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-blue-50'}`}
            >
              {c}
            </button>
          ))}
          <button
            onClick={() => changeCategory('')}
            className={`px-3 py-1 rounded border text-sm transition ${category==='' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white hover:bg-gray-50'}`}
          >All</button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {(issues || []).map((i: Issue) => <IssueCard key={i.id} issue={i} />)}
      </div>
    </div>
  )
}

export default function CategoryBrowsePage() {
  return (
    <RequireUser>
      <CitizenLayout>
        <Suspense fallback={<div className="p-4">Loading categories...</div>}>
          <CategoryContent />
        </Suspense>
      </CitizenLayout>
    </RequireUser>
  )
}