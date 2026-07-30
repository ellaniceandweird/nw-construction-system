-- Creates the material_references table (Documents > Material Reference
-- tab) — a spec-sheet/preferred-vendor catalog per material, separate
-- from Cost Database (pricing) and Takeoff (job quantities).
-- Run once in the Supabase SQL Editor.

create table if not exists public.material_references (
  id text primary key,
  material_name text not null,
  category text,
  specification text,
  preferred_vendor text,
  reference_url text,
  notes text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.material_references enable row level security;

create policy "Authenticated users can view material_references"
on public.material_references for select
to authenticated
using (true);

create policy "Authenticated users can insert material_references"
on public.material_references for insert
to authenticated
with check (true);

create policy "Authenticated users can update material_references"
on public.material_references for update
to authenticated
using (true);

create policy "Authenticated users can delete material_references"
on public.material_references for delete
to authenticated
using (true);

alter publication supabase_realtime add table public.material_references;
