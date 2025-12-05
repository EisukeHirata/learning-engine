'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Database } from '@/lib/database.types'
import { MoreVertical, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteContent } from '@/app/actions'

type Content = Database['public']['Tables']['contents']['Row'] & {
  learning_progress: { last_accessed_at: string | null, completed_percentage: number | null }[]
}

interface ContentListProps {
  contents: Content[]
}

export function ContentList({ contents }: ContentListProps) {
  if (contents.length === 0) {
    return <div className="text-center text-gray-500 py-8">No contents yet. Add a topic to get started!</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {contents.map((content) => (
        <ContentCard key={content.id} content={content} />
      ))}
    </div>
  )
}

function ContentCard({ content }: { content: Content }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (confirm('Are you sure you want to delete this content?')) {
      setIsDeleting(true)
      try {
        await deleteContent(content.id)
      } catch (error) {
        console.error('Failed to delete content:', error)
        alert('Failed to delete content')
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <Link href={`/contents/${content.id}`}>
      <div className="relative h-full p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-transparent hover:border-blue-200 cursor-pointer group">
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 pr-8">{content.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-3">{content.summary}</p>
        <div className="mt-4 flex justify-between items-end text-xs text-gray-400">
          <span>Topic: {content.topic_name}</span>
          {content.learning_progress?.[0]?.last_accessed_at && (
            <span>Last studied: {new Date(content.learning_progress[0].last_accessed_at).toLocaleDateString()}</span>
          )}
        </div>
        {isDeleting && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}
      </div>
    </Link>
  )
}
