-- Creates the management_notes table (the Dashboard "Notes from
-- Management" widget) — previously localStorage-only, meaning a note
-- posted by one person never actually reached anyone else's screen,
-- despite being an explicitly team-facing communication widget.
-- Run once in the Supabase SQL Editor.

create table if not exists public.management_notes (
  id text primary key,
  message text not null,
  author text not null,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.management_notes enable row level security;

create policy "Authenticated users can view management_notes"
on public.management_notes for select
to authenticated
using (true);

create policy "Authenticated users can insert management_notes"
on public.management_notes for insert
to authenticated
with check (true);

create policy "Authenticated users can update management_notes"
on public.management_notes for update
to authenticated
using (true);

create policy "Authenticated users can delete management_notes"
on public.management_notes for delete
to authenticated
using (true);

alter publication supabase_realtime add table public.management_notes;

insert into public.management_notes (id, message, author, created_date) values
  ('NOTE-000001', 'Focus on getting the roofing project back on track.', 'Ben', '2026-07-10T00:00:00.000Z')
on conflict (id) do nothing;
