-- ============================================================
-- 1% JOURNAL — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable RLS
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  name text,
  streak integer default 0,
  discipline_xp integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Day entries table
create table if not exists public.day_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date_key text not null, -- YYYY-MM-DD
  tasks jsonb default '{}'::jsonb,
  todos jsonb default '[]'::jsonb,
  focus1 text,
  focus2 text,
  focus3 text,
  improvement text,
  journal_main text,
  journal_intentions text,
  journal_stoic text,
  journal_business text,
  journal_reading text,
  ref_thought text,
  ref_went_well text,
  ref_big_win text,
  ref_learned text,
  ref_tomorrow text,
  ref_gratitude text,
  water integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date_key)
);

-- Goals table
create table if not exists public.goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  data jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Workout logs
create table if not exists public.workout_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date_key text not null,
  exercises jsonb default '[]'::jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, date_key)
);

-- Pomodoro sessions
create table if not exists public.pomodoro_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date_key text not null,
  completed_sessions integer default 0,
  total_focus_minutes integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles enable row level security;
alter table public.day_entries enable row level security;
alter table public.goals enable row level security;
alter table public.workout_logs enable row level security;
alter table public.pomodoro_sessions enable row level security;

-- Profiles: users can only see/edit their own
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Day entries: own data only
create policy "day_entries_select" on public.day_entries for select using (auth.uid() = user_id);
create policy "day_entries_insert" on public.day_entries for insert with check (auth.uid() = user_id);
create policy "day_entries_update" on public.day_entries for update using (auth.uid() = user_id);
create policy "day_entries_delete" on public.day_entries for delete using (auth.uid() = user_id);

-- Goals
create policy "goals_select" on public.goals for select using (auth.uid() = user_id);
create policy "goals_insert" on public.goals for insert with check (auth.uid() = user_id);
create policy "goals_update" on public.goals for update using (auth.uid() = user_id);

-- Workout logs
create policy "workout_select" on public.workout_logs for select using (auth.uid() = user_id);
create policy "workout_insert" on public.workout_logs for insert with check (auth.uid() = user_id);
create policy "workout_update" on public.workout_logs for update using (auth.uid() = user_id);

-- Pomodoro
create policy "pomodoro_select" on public.pomodoro_sessions for select using (auth.uid() = user_id);
create policy "pomodoro_insert" on public.pomodoro_sessions for insert with check (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Updated at trigger
-- ============================================================
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger day_entries_updated_at before update on public.day_entries
  for each row execute procedure public.update_updated_at();

create trigger goals_updated_at before update on public.goals
  for each row execute procedure public.update_updated_at();
