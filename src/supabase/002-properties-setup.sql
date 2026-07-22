-- Phase 2, module 1 of many: Properties.
-- One-time setup — run this once in the Supabase SQL Editor.
-- After this, every signed-in team member sees the same live Properties
-- data instead of each browser keeping its own local copy.

create table if not exists public.properties (
  id text primary key,
  name text not null,
  address text,
  town text,
  billing_entity_id text,
  related_project_id text,
  cover_photo_url text,
  google_drive_folder_url text,
  google_drive_folder_name text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.properties enable row level security;

-- Small internal team: any signed-in person can read and write.
-- Tighten later with role-based checks if needed (e.g. only certain
-- roles can delete) once the team grows.
create policy "Authenticated users can view properties"
on public.properties for select
to authenticated
using (true);

create policy "Authenticated users can insert properties"
on public.properties for insert
to authenticated
with check (true);

create policy "Authenticated users can update properties"
on public.properties for update
to authenticated
using (true);

create policy "Authenticated users can delete properties"
on public.properties for delete
to authenticated
using (true);

-- Required for realtime (live sync across browser tabs/users) to work.
alter publication supabase_realtime add table public.properties;

-- Seed with your real 14 properties, transcribed from the source workbook,
-- so the live table starts with real content instead of empty.
insert into public.properties (id, name, address, town, billing_entity_id, related_project_id, cover_photo_url, google_drive_folder_url, google_drive_folder_name)
values
  ('PROP-000001', '104 Water St', null, null, null, null, null, null, null),
  ('PROP-000002', '18 Cross St', null, null, null, null, null, null, null),
  ('PROP-000003', '321 Main St', null, null, null, null, null, null, null),
  ('PROP-000004', '335 Main St', null, null, null, null, null, null, null),
  ('PROP-000005', '344 Main St', null, null, null, null, null, null, null),
  ('PROP-000006', '373 Main St (Airbnb)', null, null, null, null, null, null, null),
  ('PROP-000007', '373 Main St (Theater)', null, null, null, null, null, null, null),
  ('PROP-000008', '391 Main St', null, null, null, null, null, null, null),
  ('PROP-000009', 'CSX', null, null, null, null, null, null, null),
  ('PROP-000010', 'CSX/Caboose/Grapefruit', null, null, null, null, null, null, null),
  ('PROP-000011', 'Caboose', null, null, null, null, null, null, null),
  ('PROP-000012', 'General', null, null, null, null, null, null, null),
  ('PROP-000013', 'Kitty''s/Mr Cat', null, null, null, null, null, null, null),
  ('PROP-000014', 'The Wick', null, null, null, null, null, null, null)
on conflict (id) do nothing;
