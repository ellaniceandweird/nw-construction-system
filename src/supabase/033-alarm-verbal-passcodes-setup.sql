-- Creates the alarm_verbal_passcodes table (Maintenance > Alarm Verbal
-- Passcode tab) — the verbal passcode given to the alarm monitoring
-- company, kept separate from physical door/access Key Codes.
-- Run once in the Supabase SQL Editor.

create table if not exists public.alarm_verbal_passcodes (
  id text primary key,
  property_id text,
  property_name text not null,
  verbal_passcode text not null,
  notes text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.alarm_verbal_passcodes enable row level security;

create policy "Authenticated users can view alarm_verbal_passcodes"
on public.alarm_verbal_passcodes for select
to authenticated
using (true);

create policy "Authenticated users can insert alarm_verbal_passcodes"
on public.alarm_verbal_passcodes for insert
to authenticated
with check (true);

create policy "Authenticated users can update alarm_verbal_passcodes"
on public.alarm_verbal_passcodes for update
to authenticated
using (true);

create policy "Authenticated users can delete alarm_verbal_passcodes"
on public.alarm_verbal_passcodes for delete
to authenticated
using (true);

alter publication supabase_realtime add table public.alarm_verbal_passcodes;
