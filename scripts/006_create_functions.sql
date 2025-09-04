-- Function to generate claim numbers
create or replace function generate_claim_number(district_code text, year_suffix text)
returns text
language plpgsql
as $$
declare
  sequence_num integer;
  claim_num text;
begin
  -- Get next sequence number for this district and year
  select coalesce(max(
    cast(
      substring(claim_number from '[0-9]+$') as integer
    )
  ), 0) + 1
  into sequence_num
  from public.claims
  where claim_number like district_code || year_suffix || '%';
  
  -- Format: DIST24-001, DIST24-002, etc.
  claim_num := district_code || year_suffix || '-' || lpad(sequence_num::text, 3, '0');
  
  return claim_num;
end;
$$;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Add updated_at triggers
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row
  execute function update_updated_at_column();

create trigger update_claims_updated_at
  before update on public.claims
  for each row
  execute function update_updated_at_column();

create trigger update_documents_updated_at
  before update on public.documents
  for each row
  execute function update_updated_at_column();
