-- Creates the subcontractor_sourcing_requests table (Procurement >
-- Sourcing > Subcontractor Sourcing tab) — scoping/budgeting subcontractor
-- work before it's ready to go out for formal RFQs. Project and Property
-- are both optional.
-- Run once in the Supabase SQL Editor.

create table if not exists public.subcontractor_sourcing_requests (
  id text primary key,
  project_id text,
  property_id text,
  property_name text,
  trade text not null,
  scope_of_work text not null,
  budget numeric,
  notes text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.subcontractor_sourcing_requests enable row level security;

create policy "Authenticated users can view subcontractor_sourcing_requests"
on public.subcontractor_sourcing_requests for select
to authenticated
using (true);

create policy "Authenticated users can insert subcontractor_sourcing_requests"
on public.subcontractor_sourcing_requests for insert
to authenticated
with check (true);

create policy "Authenticated users can update subcontractor_sourcing_requests"
on public.subcontractor_sourcing_requests for update
to authenticated
using (true);

create policy "Authenticated users can delete subcontractor_sourcing_requests"
on public.subcontractor_sourcing_requests for delete
to authenticated
using (true);

alter publication supabase_realtime add table public.subcontractor_sourcing_requests;
