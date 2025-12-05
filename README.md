# Learning Engine

An AI-powered learning app where users enter topics they want to learn, get a simple list of suggested contents, and engage in chat-based tutoring.

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (Postgres + Auth)
- **AI**: OpenAI API (via Vercel AI SDK)

## Setup

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Variables**:
    Copy `.env.example` to `.env.local` and fill in the values:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    OPENAI_API_KEY=your-openai-api-key
    ```
4.  **Supabase Setup**:
    - Create a new Supabase project.
    - Run the SQL migration in `supabase/migrations` (or use the provided SQL in the implementation plan) to set up the database schema.
    - Enable Email/Password and Google Auth providers in Supabase Authentication settings.
    - For Google Auth, add `http://localhost:3000/auth/callback` to the Redirect URLs.

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## How to Use

1.  **Sign Up / Login**: Create an account or log in with Google.
2.  **Dashboard**: Enter topics you want to learn (e.g., "React, History, Physics") and click "Generate".
3.  **Content List**: View the generated learning contents.
4.  **Chat Learning**: Click on a content item to open the chat interface. The AI will tutor you on the topic.
5.  **Profile**: Update your profile information in the Profile page.

## Database Schema

- `profiles`: User information.
- `learning_topics`: Topics entered by users.
- `contents`: Generated learning materials.
- `chat_sessions`: Chat session metadata.
- `chat_messages`: Chat history.
- `learning_progress`: Learning progress tracking.
