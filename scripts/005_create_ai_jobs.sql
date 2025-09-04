-- Create AI jobs table for tracking async processing
create table if not exists public.ai_jobs (
  id uuid primary key default gen_random_uuid(),
  job_type text not null check (job_type in ('ocr', 'asset_detection', 'dss_recommendation', 'ner')),
  status text not null default 'queued' check (status in ('queued', 'processing', 'completed', 'failed')),
  
  -- Related entities
  claim_id uuid references public.claims(id) on delete cascade,
  document_id uuid references public.documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Job data
  input_data jsonb,
  output_data jsonb,
  error_message text,
  
  -- Processing metadata
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  processing_time_ms integer,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.ai_jobs enable row level security;

-- RLS policies for AI jobs
create policy "ai_jobs_select_own"
  on public.ai_jobs for select
  using (auth.uid() = user_id);

-- Allow system to insert jobs
create policy "ai_jobs_insert_system"
  on public.ai_jobs for insert
  with check (true);

-- Allow system to update job status
create policy "ai_jobs_update_system"
  on public.ai_jobs for update
  using (true);

-- Create indexes
create index if not exists idx_ai_jobs_status on public.ai_jobs(status);
create index if not exists idx_ai_jobs_type on public.ai_jobs(job_type);
create index if not exists idx_ai_jobs_user_id on public.ai_jobs(user_id);
