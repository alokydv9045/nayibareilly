export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
