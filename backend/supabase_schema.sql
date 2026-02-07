-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for RAG
CREATE EXTENSION IF NOT EXISTS vector;

-- 0. RAG Document Chunks Table
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- e.g. {"source": "manual.pdf", "page": 1}
    embedding vector(1536),             -- OpenAI text-embedding-3-small
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to match documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 1. Support Tickets Table (Matches /ticket endpoint)
-- Handles submissions from "Help & Support" > "Submit Ticket"
-- Payload: { category, priority, subject, description, user_id }
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id), -- Nullable if guest, or enforce auth
    category TEXT NOT NULL CHECK (category IN ('Technical', 'Billing', 'Feature', 'General')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Feedback Submissions Table (Matches /feedback endpoint)
-- Handles submissions from "Feedback" tab
-- Payload: { message, category, user_id }
CREATE TABLE IF NOT EXISTS feedback_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    category TEXT DEFAULT 'General',
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Chat Sessions Table (For /chat endpoint session management)
-- Tracks the high-level conversation metadata
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Maps to 'sessionId' in API
    user_id UUID REFERENCES auth.users(id),       -- Optional, link to logged-in user
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_metadata JSONB DEFAULT '{}'::jsonb       -- Store browser, OS, locale, etc.
);

-- 4. Chat Messages Table (For /chat endpoint history)
-- Stores the actual exchange of messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    recommendations JSONB DEFAULT '[]'::jsonb,    -- Store "Next Steps" or chips suggested by bot
    meta JSONB DEFAULT '{}'::jsonb,               -- Store latency, source (kb/llm), model_used
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Row Level Security (RLS) Policies (Optional but Recommended)
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Example Policy: Users can only see their own tickets
-- CREATE POLICY "Users can only view their own tickets" ON support_tickets
--     FOR SELECT USING (auth.uid() = user_id);

-- Example Policy: Anyone can insert (if public chatbot), or auth required
-- CREATE POLICY "Authenticated users can insert tickets" ON support_tickets
--     FOR INSERT WITH CHECK (auth.uid() = user_id);
