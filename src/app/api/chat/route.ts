import { openai } from '@ai-sdk/openai'
import { streamText, convertToCoreMessages } from 'ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { messages, contentId, chatSessionId } = await req.json()
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return new Response('Unauthorized', { status: 401 })

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is missing')
      return new Response('OPENAI_API_KEY is missing', { status: 500 })
    }

    // Get content details for system prompt
    const { data: content } = await supabase
      .from('contents')
      .select('*')
      .eq('id', contentId)
      .single()
    
    if (!content) return new Response('Content not found', { status: 404 })

    // Ensure chat session exists or create it
    let sessionId = chatSessionId
    if (!sessionId) {
      // Check if session already exists for this content
      const { data: existingSession } = await supabase
          .from('chat_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('content_id', contentId)
          .single()
      
      if (existingSession) {
          sessionId = existingSession.id
      } else {
          const { data: session } = await supabase
          .from('chat_sessions')
          .insert({
              user_id: user.id,
              content_id: contentId,
              title: content.title,
          })
          .select()
          .single()
          sessionId = session?.id
      }
    }

    // Save user message if it exists
    const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null
    if (lastMessage && lastMessage.role === 'user') {
      await supabase.from('chat_messages').insert({
        chat_session_id: sessionId,
        role: 'user',
        content: lastMessage.content,
      })
    }

    // Update last_accessed_at in learning_progress
    console.log('Updating learning progress...')
    await supabase.from('learning_progress').upsert({
      user_id: user.id,
      content_id: contentId,
      last_accessed_at: new Date().toISOString(),
    }, { onConflict: 'user_id, content_id' })

    const systemPrompt = `You are an expert tutor teaching the user about "${content.title}".
    Summary of the topic: ${content.summary}.
    
    Your goal is to explain concepts clearly, answer questions, and check understanding.
    Be encouraging and concise.`

    // Validate messages
    if (!Array.isArray(messages)) {
      console.error('Messages is not an array:', messages)
      return new Response('Messages must be an array', { status: 400 })
    }

    console.log('Starting OpenAI stream with messages:', messages.length)
    
    const coreMessages = messages.map((m: any) => ({
      role: m.role as 'user' | 'assistant' | 'system',
      content: m.content
    }))

    // If no messages, inject a trigger message for the AI to start
    if (coreMessages.length === 0) {
      coreMessages.push({
        role: 'user',
        content: `Please introduce the topic "${content.title}" and start the lesson. Be concise and engaging.`
      })
    }

    const result = await streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages: coreMessages,
      onFinish: async ({ text }) => {
        // Save assistant message
        await supabase.from('chat_messages').insert({
          chat_session_id: sessionId,
          role: 'assistant',
          content: text,
        })
      },
    })

    return result.toTextStreamResponse({
        headers: {
            'x-chat-session-id': sessionId
        }
    })
  } catch (error: any) {
    console.error('API Error (Server Side):', error)
    
    // Create a serializable error object
    const serializableError = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      ...error // Spread any other properties
    }

    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      message: error.message || 'Unknown error',
      details: serializableError
    }), { status: 500 })
  }
}
