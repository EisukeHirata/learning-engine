import Link from 'next/link'
import { Database } from '@/lib/database.types'

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
        <Link key={content.id} href={`/contents/${content.id}`}>
          <div className="h-full p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-transparent hover:border-blue-200 cursor-pointer">
            <h3 className="font-semibold text-lg mb-2">{content.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3">{content.summary}</p>
            <div className="mt-4 flex justify-between items-end text-xs text-gray-400">
              <span>Topic: {content.topic_name}</span>
              {content.learning_progress?.[0]?.last_accessed_at && (
                <span>Last studied: {new Date(content.learning_progress[0].last_accessed_at).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
