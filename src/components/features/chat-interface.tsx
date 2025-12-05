'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, Loader2 } from 'lucide-react'
import { Database } from '@/lib/database.types'
import ReactMarkdown from 'react-markdown'

type DBMessage = Database['public']['Tables']['chat_messages']['Row']

interface ChatInterfaceProps {
  contentId: string
  initialMessages?: DBMessage[]
  sessionId?: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export function ChatInterface({ contentId, initialMessages = [], sessionId: initialSessionId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>(
    initialMessages.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content
    }))
  )
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(initialSessionId)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasStartedRef = useRef(false)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-start conversation
  useEffect(() => {
    console.log('Auto-start check:', { hasStarted: hasStartedRef.current, messagesLength: messages.length })
    if (!hasStartedRef.current && messages.length === 0) {
      console.log('Triggering auto-start conversation...')
      hasStartedRef.current = true
      startConversation()
    }
  }, [])

  const startConversation = async () => {
    console.log('Starting conversation...')
    setIsLoading(true)
    try {
      await streamResponse([])
    } catch (error) {
      console.error('Failed to start conversation:', error)
      hasStartedRef.current = false // Allow retry
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      await streamResponse([...messages, userMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
      setIsLoading(false)
    }
  }

  const streamResponse = async (currentMessages: Message[]) => {
    console.log('Stream response initiated')
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: currentMessages,
        contentId,
        chatSessionId: sessionId
      })
    })

    if (!response.ok) {
      try {
        const errorData = await response.json()
        console.error('API Error Details:', errorData)
        throw new Error(errorData.details?.message || errorData.message || response.statusText)
      } catch (e) {
        throw new Error(response.statusText)
      }
    }

    // Update session ID if returned
    const newSessionId = response.headers.get('x-chat-session-id')
    if (newSessionId) setSessionId(newSessionId)

    const reader = response.body?.getReader()
    if (!reader) return

    const assistantMessageId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, {
      id: assistantMessageId,
      role: 'assistant',
      content: ''
    }])

    const decoder = new TextDecoder()
    let assistantContent = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      assistantContent += chunk

      setMessages(prev => prev.map(m => 
        m.id === assistantMessageId 
          ? { ...m, content: assistantContent }
          : m
      ))
    }
    
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] bg-white relative">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-32">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-4 max-w-3xl mx-auto ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-2xl px-5 py-3 max-w-[85%] ${
                m.role === 'user'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-900'
              }`}
            >
              <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed">
                <ReactMarkdown>{m.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
           <div className={`flex gap-4 max-w-3xl mx-auto ${messages.length > 0 && messages[messages.length - 1].role === 'user' ? 'justify-start' : 'justify-center'}`}>
              <div className="flex items-center">
                 <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message..."
              disabled={isLoading}
              className="w-full pr-12 py-6 rounded-full border-gray-200 shadow-sm focus-visible:ring-gray-200 bg-gray-50 text-base"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full w-8 h-8 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
