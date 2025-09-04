-- Create profiles table for user management
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  user_type text not null check (user_type in ('tribal_member', 'government_official', 'forest_officer', 'admin')),
  district text,
  block text,
  village text,
  preferred_language text default 'en',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Allow government officials to view all profiles
create policy "profiles_select_officials"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p 
      where p.id = auth.uid() 
      and p.user_type in ('government_official', 'forest_officer', 'admin')
    )
  );

-- Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, user_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', 'New User'),
    coalesce(new.raw_user_meta_data ->> 'user_type', 'tribal_member')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
