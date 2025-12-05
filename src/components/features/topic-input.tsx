'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, X } from 'lucide-react'

interface TopicInputProps {
  onGenerate: (topics: string[]) => Promise<void>
}

export function TopicInput({ onGenerate }: TopicInputProps) {
  const [input, setInput] = useState('')
  const [topics, setTopics] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleAddTopic = () => {
    if (input.trim()) {
      const newTopics = input.split(',').map(t => t.trim()).filter(t => t)
      setTopics([...topics, ...newTopics])
      setInput('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTopic()
    }
  }

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (topics.length === 0) return
    setLoading(true)
    await onGenerate(topics)
    setTopics([])
    setLoading(false)
  }

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold">What do you want to learn?</h2>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter topics (e.g. React, History, Physics)"
          disabled={loading}
        />
        <Button onClick={handleAddTopic} disabled={loading || !input.trim()} variant="secondary">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {topics.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, i) => (
            <div key={i} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {topic}
              <button onClick={() => removeTopic(i)} className="hover:text-blue-600">
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <Button onClick={handleSubmit} disabled={loading || topics.length === 0} className="w-full">
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Generate Learning Content
      </Button>
    </div>
  )
}
