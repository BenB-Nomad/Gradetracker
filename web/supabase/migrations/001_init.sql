-- Supabase schema and row-level security for UCD Grade Tracker
-- Run in your Supabase project's SQL editor or migrations pipeline

create extension if not exists "uuid-ossp";

-- profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- modules table
create table if not exists public.modules (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code text,
  title text,
  ects integer not null default 5,
  scale text not null check (scale in ('standard_40','alt_linear_40')),
  use_ucd_21 boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_modules_user on public.modules(user_id);

-- assessments table
create table if not exists public.assessments (
  id uuid primary key default uuid_generate_v4(),
  module_id uuid not null references public.modules(id) on delete cascade,
  name text,
  weight numeric(5,2) not null check (weight >= 0 and weight <= 100),
  mark numeric(5,2) check (mark is null or (mark >= 0 and mark <= 100)),
  status text not null default 'pending' check (status in ('entered','abs','nm','pending')),
  created_at timestamptz not null default now()
);

create index if not exists idx_assessments_module on public.assessments(module_id);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.modules enable row level security;
alter table public.assessments enable row level security;

-- Policies: profiles
create policy if not exists profiles_select_self on public.profiles
  for select using (id = auth.uid());

create policy if not exists profiles_insert_self on public.profiles
  for insert with check (id = auth.uid());

create policy if not exists profiles_update_self on public.profiles
  for update using (id = auth.uid());

-- Policies: modules
create policy if not exists modules_all_own on public.modules
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Policies: assessments via parent ownership
create policy if not exists assessments_all_via_module on public.assessments
  for all using (
    exists (
      select 1 from public.modules m
      where m.id = assessments.module_id and m.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.modules m
      where m.id = assessments.module_id and m.user_id = auth.uid()
    )
  );

-- Optional helper to auto-create profile on signup via trigger (requires supabase auth hook)
-- Not strictly necessary for app function but convenient.


