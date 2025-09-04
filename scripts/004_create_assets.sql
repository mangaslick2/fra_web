-- Create assets table for AI-detected assets
create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null references public.claims(id) on delete cascade,
  
  asset_type text not null check (asset_type in ('building', 'agricultural_land', 'water_body', 'forest_cover', 'road', 'boundary_marker', 'other')),
  confidence_score numeric(3,2) not null,
  
  -- Geographic data
  coordinates jsonb not null, -- GeoJSON geometry
  area_sqm numeric(12,4), -- area in square meters
  
  -- Detection metadata
  satellite_image_url text,
  detection_date timestamp with time zone not null,
  ai_model_version text,
  
  -- Verification status
  verified boolean default false,
  verified_by uuid references auth.users(id),
  verified_at timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.assets enable row level security;

-- RLS policies for assets
create policy "assets_select_claim_owner"
  on public.assets for select
  using (
    exists (
      select 1 from public.claims c 
      where c.id = claim_id and c.user_id = auth.uid()
    )
  );

-- Allow officials to view and verify assets
create policy "assets_select_officials"
  on public.assets for select
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() 
      and p.user_type in ('government_official', 'forest_officer', 'admin')
    )
  );

create policy "assets_update_officials"
  on public.assets for update
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() 
      and p.user_type in ('government_official', 'forest_officer', 'admin')
    )
  );

-- Create indexes
create index if not exists idx_assets_claim_id on public.assets(claim_id);
create index if not exists idx_assets_type on public.assets(asset_type);
