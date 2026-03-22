-- ============================================
-- JOB Church — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Members table (extends auth.users)
create table public.members (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  tithe_amount numeric(10, 2) default 0,
  tithe_note text,
  is_admin boolean default false,
  joined_at timestamptz default now()
);

-- Elders table
create table public.elders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  story text,
  threshold_number integer not null check (threshold_number between 1 and 5),
  created_at timestamptz default now()
);

-- Journey progress
create table public.journey_progress (
  id uuid default gen_random_uuid() primary key,
  member_id uuid references public.members(id) on delete cascade not null,
  threshold_number integer not null check (threshold_number between 1 and 5),
  status text not null default 'locked' check (status in ('locked', 'active', 'completed')),
  elder_id uuid references public.elders(id),
  declaration text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique (member_id, threshold_number)
);

-- ============================================
-- Trigger: auto-create member + journey rows on signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Create member row
  insert into public.members (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', '')
  );

  -- Create 5 journey rows (threshold 1 = active, rest = locked)
  insert into public.journey_progress (member_id, threshold_number, status, started_at)
  values
    (new.id, 1, 'active', now()),
    (new.id, 2, 'locked', null),
    (new.id, 3, 'locked', null),
    (new.id, 4, 'locked', null),
    (new.id, 5, 'locked', null);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- Row Level Security
-- ============================================

alter table public.members enable row level security;
alter table public.elders enable row level security;
alter table public.journey_progress enable row level security;

-- Members: users see their own row, admins see all
create policy "Members can view own data"
  on public.members for select
  using (auth.uid() = id);

create policy "Admins can view all members"
  on public.members for select
  using (
    exists (
      select 1 from public.members
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Members can update own data"
  on public.members for update
  using (auth.uid() = id);

-- Elders: anyone authenticated can read
create policy "Authenticated users can view elders"
  on public.elders for select
  using (auth.role() = 'authenticated');

-- Journey progress: members see own, admins see all
create policy "Members can view own journey"
  on public.journey_progress for select
  using (auth.uid() = member_id);

create policy "Admins can view all journeys"
  on public.journey_progress for select
  using (
    exists (
      select 1 from public.members
      where id = auth.uid() and is_admin = true
    )
  );

create policy "Members can update own journey"
  on public.journey_progress for update
  using (auth.uid() = member_id);

create policy "Admins can update all journeys"
  on public.journey_progress for update
  using (
    exists (
      select 1 from public.members
      where id = auth.uid() and is_admin = true
    )
  );
