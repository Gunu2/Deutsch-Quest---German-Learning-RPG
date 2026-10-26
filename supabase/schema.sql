-- Run this script in Supabase Dashboard > SQL Editor.
-- The profiles table only allows users to read/update their own profile.
-- Realtime Presence/Broadcast uses Supabase Realtime channels and does not require a public table.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Adventurer',
  xp integer not null default 0 check (xp >= 0),
  cefr_level text not null default 'A1' check (cefr_level in ('A1','A2','B1','B2','C1','C2')),
  completed_lessons jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists completed_lessons jsonb not null default '[]'::jsonb;
alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable by owner" on public.profiles;
create policy "Profiles are readable by owner"
on public.profiles for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

grant select, insert, update on public.profiles to authenticated;

-- Optional: auto-create a profile row after signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- IMPORTANT SECURITY ROADMAP:
-- This starter stores XP from the browser. For a public production release,
-- move reward validation to a trusted server/Edge Function to prevent XP tampering.
-- Consider adding server-validated quest completions and moderation/rate limits.
