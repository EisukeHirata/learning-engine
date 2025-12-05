'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChatInterface } from '@/components/features/chat-interface'
import { Database } from '@/lib/database.types'
import { Loader2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

type Content = Database['public']['Tables']['contents']['Row']
type Message = Database['public']['Tables']['chat_messages']['Row']

export default function ContentPage() {
  const params = useParams()
  const id = params.id as string
  const [content, setContent] = useState<Content | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch content
      const { data: contentData } = await supabase
        .from('contents')
        .select('*')
        .eq('id', id)
        .single()
      
      if (contentData) {
        setContent(contentData)
        
        // Fetch existing session
        const { data: sessionData } = await supabase
            .from('chat_sessions')
            .select('id')
            .eq('content_id', id)
            .eq('user_id', user.id)
            .single()

        if (sessionData) {
            setSessionId(sessionData.id)
            // Fetch messages
            const { data: messagesData } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('chat_session_id', sessionData.id)
                .order('created_at', { ascending: true })
            
            if (messagesData) {
                setMessages(messagesData)
            }
        }
      }
      setLoading(false)
    }
    fetchData()
  }, [id, supabase])

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
  if (!content) return <div className="p-8 text-center">Content not found</div>

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-10">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-semibold absolute left-1/2 -translate-x-1/2">{content.title}</h1>
        <div className="w-9" /> {/* Spacer for centering */}
      </div>

      {/* Main Content */}
      <div className="pt-14">
        <ChatInterface contentId={id} initialMessages={messages} sessionId={sessionId} />
      </div>
    </div>
  )
}
