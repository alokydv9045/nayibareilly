import { redirect } from 'next/navigation'

interface PageProps { 
  params: Promise<{ id: string }> 
}

export default async function LegacyIssueRedirect({ params }: PageProps) {
  const { id } = await params
  redirect(`/app/issue/${id}`)
}
