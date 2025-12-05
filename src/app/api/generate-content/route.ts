import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const generateContentSchema = z.object({
  topics: z.array(z.string()),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const json = await request.json()
  const { topics } = generateContentSchema.parse(json)

  if (topics.length === 0) {
    return NextResponse.json({ error: 'No topics provided' }, { status: 400 })
  }

  // Save topics
  for (const topic of topics) {
    await supabase.from('learning_topics').insert({
      user_id: user.id,
      name: topic,
    })
  }

  const generatedContents = []

  // Generate content for each topic
  // In a real app, we might want to do this in parallel or a background job
  for (const topic of topics) {
    const prompt = `Generate 3 learning content items for the topic: "${topic}". 
    For each item, provide a title and a short summary (max 2 sentences). 
    Return strictly as a JSON object with a key "contents" containing an array of objects with keys "title" and "summary".`

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // or gpt-3.5-turbo
        messages: [
          { role: 'system', content: 'You are a helpful educational assistant. Output JSON only.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
      })

      const content = completion.choices[0].message.content
      if (content) {
        const parsed = JSON.parse(content)
        const items = parsed.contents || []

        for (const item of items) {
          const { data, error } = await supabase.from('contents').insert({
            user_id: user.id,
            title: item.title,
            summary: item.summary,
            topic_name: topic,
            source_type: 'generated'
          }).select().single()
          
          if (data) generatedContents.push(data)
        }
      }
    } catch (e) {
      console.error(`Error generating content for ${topic}:`, e)
    }
  }

  return NextResponse.json({ contents: generatedContents })
}
