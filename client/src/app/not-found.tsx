import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div>
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-cyan-400 text-transparent bg-clip-text">404</h1>
        <p className="text-xl text-base-content/70 max-w-md mx-auto">
          The page you are looking for doesn&apos;t exist or may have been moved.
        </p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/" className="btn btn-primary">Go Home</Link>
        <Link href="/" className="btn btn-outline">Citizen Portal</Link>
        <Link href="/login" className="btn btn-outline">Login</Link>
      </div>
    </main>
  )
}
