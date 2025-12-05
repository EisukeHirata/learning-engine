import { createBrowserClient } from '@supabase/ssr'
import { Database } from '../database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.')
  }

  if (!supabaseUrl.startsWith('https://')) {
    console.error('Invalid Supabase URL: URL must start with https://. Current URL:', supabaseUrl)
    throw new Error('Invalid Supabase URL: URL must start with https://')
  }

  console.log('Supabase Client Initialized with URL:', supabaseUrl)

  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  )
}
