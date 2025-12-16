-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- 1. Knowledge Base (The Content Source)
create table if not exists knowledge_base (
  id uuid default gen_random_uuid() primary key,
  content text not null, -- The actual text chunk
  metadata jsonb default '{}', -- e.g., {"source": "doc", "page": "billing", "version": "1.2"}
  embedding vector(1536), -- OpenAI-compatible embedding size (requires pgvector)
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Chat Sessions (Context Containers)
create table if not exists chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  context_tags text[], -- e.g., ['billing', 'settings']
  summary text, -- Auto-generated summary of the conversation
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);

-- 3. Chat Messages ( The Dialogue )
create table if not exists chat_messages (
  id uuid default gen_random_uuid() primary key,
  session_id uuid references chat_sessions(id) on delete cascade not null,
  role text not null, -- 'user', 'assistant', 'system'
  content text not null,
  sources jsonb, -- Array of knowledge_base IDs used to generate this answer (Citations)
  confidence_score float, -- 0.0 to 1.0
  feedback_score integer, -- 1 (thumbs up) or -1 (thumbs down)
  created_at timestamptz default now()
);

-- Enable RLS
alter table knowledge_base enable row level security;
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;

-- Policies
-- Knowledge Base: Public read (or authenticated read), Admin write
create policy "Authenticated users can read KB" on knowledge_base for select using (auth.role() = 'authenticated');

-- Sessions: Users see their own
create policy "Users manage own sessions" on chat_sessions for all using (auth.uid() = user_id);

-- Messages: Users see their own via session
create policy "Users manage own messages" on chat_messages for all using (
  exists (select 1 from chat_sessions where id = chat_messages.session_id and user_id = auth.uid())
);

-- Function to match documents (Simulated Vector Search or Keyword Search)
-- Note: This is a placeholder. Real RAG uses <=> operator with embeddings.
create or replace function match_knowledge_base (
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
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.metadata,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  order by knowledge_base.embedding <=> query_embedding
  limit match_count;
end;
$$;
