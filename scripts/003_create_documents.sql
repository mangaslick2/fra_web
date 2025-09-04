-- Create documents table for supporting documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  
  document_type text not null check (document_type in ('identity_proof', 'residence_proof', 'land_records', 'survey_settlement', 'revenue_records', 'other')),
  file_name text not null,
  file_url text not null,
  file_size integer,
  mime_type text,
  
  -- OCR results
  ocr_text text,
  ocr_confidence numeric(3,2),
  extracted_entities jsonb, -- NER results
  
  -- Processing status
  processing_status text default 'pending' check (processing_status in ('pending', 'processing', 'completed', 'failed')),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.documents enable row level security;

-- RLS policies for documents
create policy "documents_select_own"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "documents_insert_own"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "documents_update_own"
  on public.documents for update
  using (auth.uid() = user_id);

-- Allow officials to view documents
create policy "documents_select_officials"
  on public.documents for select
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() 
      and p.user_type in ('government_official', 'forest_officer', 'admin')
    )
  );

-- Create indexes
create index if not exists idx_documents_claim_id on public.documents(claim_id);
create index if not exists idx_documents_user_id on public.documents(user_id);
