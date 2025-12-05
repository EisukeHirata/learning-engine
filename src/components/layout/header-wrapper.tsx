'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePathname } from 'next/navigation'

export function HeaderWrapper() {
  const pathname = usePathname()
  const isContentPage = pathname?.startsWith('/contents/')

  if (isContentPage) return null

  return (
    <header className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-gray-900">
          Learning Engine
        </Link>
        <nav className="flex gap-4">
          <Link href="/profile">
            <Button variant="ghost">Profile</Button>
          </Link>
          <form action="/auth/signout" method="post">
             <Button variant="outline" type="submit">Sign out</Button>
          </form>
        </nav>
      </div>
    </header>
  )
}
