import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        Learning Engine
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl">
        Your AI-powered personal tutor. Enter any topic you want to learn, and we'll generate a custom curriculum and guide you through it with interactive chat.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link href="/login">
          <Button size="lg">Get Started</Button>
        </Link>
      </div>
    </div>
  )
}
