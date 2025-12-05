'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TopicInput } from '@/components/features/topic-input'
import { ContentList } from '@/components/features/content-list'
import { Database } from '@/lib/database.types'
import { Loader2 } from 'lucide-react'

type Content = Database['public']['Tables']['contents']['Row'] & {
  learning_progress: { last_accessed_at: string | null, completed_percentage: number | null }[]
}

export default function DashboardPage() {
  const [contents, setContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchContents = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('contents')
        .select('*, learning_progress(last_accessed_at, completed_percentage)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (data) {
        setContents(data)
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchContents()
  }, [supabase])

  const handleGenerate = async (topics: string[]) => {
    try {
      const res = await fetch('/api/generate-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topics }),
      })
      
      if (res.ok) {
        const data = await res.json()
        // Add new contents to the list
        setContents(prev => [...data.contents, ...prev])
      }
    } catch (error) {
      console.error('Failed to generate content', error)
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <TopicInput onGenerate={handleGenerate} />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">Your Learning Contents</h2>
        <ContentList contents={contents} />
      </div>
    </div>
  )
}
