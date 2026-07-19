-- One-time setup: a "profiles" table to track team members and their
-- role, linked to real Supabase Auth users. Run this once in the
-- Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'operations_manager',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Small team for now: any signed-in person can see everyone on the team.
create policy "Authenticated users can view all profiles"
on public.profiles for select
to authenticated
using (true);

-- Any signed-in person can update roles for now (just you and your boss).
-- Tighten this later (e.g. only system_administrator) once more people join.
create policy "Authenticated users can update profiles"
on public.profiles for update
to authenticated
using (true);

-- Auto-creates a profile row whenever someone signs in for the first time.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill anyone who already signed in before this table existed (e.g. you).
insert into public.profiles (id, email, full_name, avatar_url)
select id, email, raw_user_meta_data->>'full_name', raw_user_meta_data->>'avatar_url'
from auth.users
on conflict (id) do nothing;
