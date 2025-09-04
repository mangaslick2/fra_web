-- Create claims table for forest rights claims
create table if not exists public.claims (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  claim_number text unique,
  claim_type text not null check (claim_type in ('individual', 'community', 'cfr')),
  status text not null default 'draft' check (status in ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'pending_documents')),
  
  -- Claimant information
  claimant_name text not null,
  father_name text,
  address text,
  district text not null,
  block text not null,
  village text not null,
  
  -- Land details
  survey_number text,
  area_claimed numeric(10,4), -- in hectares
  land_type text check (land_type in ('agricultural', 'habitation', 'grazing', 'water_body', 'burial_ground', 'other')),
  
  -- Geographic boundaries (GeoJSON)
  boundaries jsonb,
  
  -- AI processing status
  ocr_processed boolean default false,
  asset_detection_status text default 'pending' check (asset_detection_status in ('pending', 'processing', 'completed', 'failed')),
  dss_recommendation jsonb,
  
  -- Timestamps
  submitted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.claims enable row level security;

-- RLS policies for claims
create policy "claims_select_own"
  on public.claims for select
  using (auth.uid() = user_id);

create policy "claims_insert_own"
  on public.claims for insert
  with check (auth.uid() = user_id);

create policy "claims_update_own"
  on public.claims for update
  using (auth.uid() = user_id);

-- Allow officials to view all claims
create policy "claims_select_officials"
  on public.claims for select
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() 
      and p.user_type in ('government_official', 'forest_officer', 'admin')
    )
  );

-- Allow officials to update claim status
create policy "claims_update_officials"
  on public.claims for update
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() 
      and p.user_type in ('government_official', 'forest_officer', 'admin')
    )
  );

-- Create index for faster queries
create index if not exists idx_claims_user_id on public.claims(user_id);
create index if not exists idx_claims_status on public.claims(status);
create index if not exists idx_claims_district_block on public.claims(district, block);
