-- Phase 2, module: Projects.
-- One-time setup — run this once in the Supabase SQL Editor.
-- Projects is the entity every other module points back to, so this is
-- the most important table to get right.

create table if not exists public.projects (
  id text primary key,
  project_number text not null,
  project_name text not null,
  property_name text,
  billing_entity_id text not null,
  cost_center text,
  internal_project_code text,

  address jsonb not null default '{}'::jsonb,

  client_name text not null,
  owner text,
  architect text,
  engineer text,
  general_contractor text,
  primary_contact text,
  contact_email text,
  contact_phone text,

  project_type text not null,
  construction_category text not null,
  contract_type text not null,
  current_phase text not null,
  manual_status text not null default 'active',
  calculated_status text not null default 'planning',
  priority text not null default 'medium',
  start_date date not null,
  planned_completion_date date not null,
  actual_completion_date date,
  estimated_contract_value numeric not null default 0,
  approved_budget numeric not null default 0,
  actual_cost_to_date numeric,

  team jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',

  health_score numeric not null default 100,
  completion_percent numeric not null default 0,
  notes text,

  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.projects enable row level security;

create policy "Authenticated users can view projects"
on public.projects for select
to authenticated
using (true);

create policy "Authenticated users can insert projects"
on public.projects for insert
to authenticated
with check (true);

create policy "Authenticated users can update projects"
on public.projects for update
to authenticated
using (true);

create policy "Authenticated users can delete projects"
on public.projects for delete
to authenticated
using (true);

alter publication supabase_realtime add table public.projects;

-- Seed with your real 15 projects, transcribed from the source workbook.
insert into public.projects (id, project_number, project_name, property_name, billing_entity_id, cost_center, internal_project_code, address, client_name, owner, architect, engineer, general_contractor, primary_contact, contact_email, contact_phone, project_type, construction_category, contract_type, current_phase, manual_status, calculated_status, priority, start_date, planned_completion_date, actual_completion_date, estimated_contract_value, approved_budget, actual_cost_to_date, team, tags, health_score, completion_percent, notes)
values
  ('PRJ-000001', '2024-01', '25 River Street Renovations', null, 'BE-000000', null, null, '{"street":"25 River Street","city":"Catskill","state":"NY","zip":"12414","country":"USA"}'::jsonb, '25 River Street Catskill LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'construction', 'active', 'active', 'medium', '2024-01-01', '2026-07-26', null, 435000, 435000, 440000, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['residential']::text[], 94, 99, null),
  ('PRJ-000002', '2026-01', '18 Cross St Garage', null, 'BE-000000', null, null, '{"street":"18 Cross Street","city":"Hudson","state":"NY","zip":"12414","country":"USA"}'::jsonb, 'Cross Street Holdings LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'construction', 'active', 'active', 'medium', '2026-01-01', '2026-08-30', null, 15000, 15000, 12000, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['roofing']::text[], 86, 75, null),
  ('PRJ-000003', '2026-02', 'Robert Taylor House', null, 'BE-000000', null, null, '{"street":"68 South 2nd Street","city":"Hudson","state":"NY","zip":"12414","country":"USA"}'::jsonb, 'Robert Taylor House LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'closeout', 'closed', 'closed', 'medium', '2026-02-02', '2026-03-30', null, 0, 0, null, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['residential']::text[], 96, 100, null),
  ('PRJ-000004', '2026-03', 'Kitty''s Renovations', null, 'BE-000000', null, null, '{"street":"60 South Front Street","city":"Hudson","state":"NY","zip":"12414","country":"USA"}'::jsonb, 'South Front Street Holdings LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'construction', 'active', 'active', 'medium', '2026-03-16', '2026-05-15', null, 621000, 621000, 750000, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['commercial']::text[], 94, 99, null),
  ('PRJ-000005', '2026-04', 'Robert Taylor House', null, 'BE-000000', null, null, '{"street":"68 South 2nd Street","city":"Hudson","state":"NY","zip":"12414","country":"USA"}'::jsonb, 'Robert Taylor House LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'procurement', 'on_hold', 'on_hold', 'high', '2026-05-01', '2027-05-01', null, 831657.5, 831657.5, null, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['residential','historic_restoration']::text[], 42, 0, null),
  ('PRJ-000006', '2026-05', '25 Cross St Exterior Renovation', null, 'BE-000000', null, null, '{"street":"25 Cross Street","city":"Hudson","state":"NY","zip":"12414","country":"USA"}'::jsonb, 'South Front Street Holdings LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'construction', 'active', 'active', 'medium', '2026-06-18', '2026-08-07', null, 155979.25, 155979.25, 50000, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['exterior_renovation']::text[], 62, 35, null),
  ('PRJ-000007', '2026-06', 'Wick Model Rooms', null, 'BE-000000', null, null, '{"street":"41 Cross Street","city":"Hudson","state":"NY","zip":"12414","country":"USA"}'::jsonb, '41 Cross Street LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'closeout', 'closed', 'closed', 'medium', '2026-06-22', '2026-06-23', null, 0, 0, null, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['internal']::text[], 96, 100, null),
  ('PRJ-000008', '2026-07', '74 Hamburg Lane (Ben''s House)', null, 'BE-000000', null, null, '{"street":"74 Hamburg Road","city":"Catskill","state":"NY","zip":"12414","country":"USA"}'::jsonb, '74 Hamburg Road LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'preconstruction', 'active', 'planning', 'medium', '2026-07-01', '2026-10-01', null, 0, 0, null, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['residential']::text[], 50, 0, null),
  ('PRJ-000009', '2026-08', '27 Cross St Exterior Renovation', null, 'BE-000000', null, null, '{"street":"27 Cross Street","city":"Hudson","state":"NY","zip":"12414","country":"USA"}'::jsonb, 'Cross Street Holdings LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'procurement', 'on_hold', 'on_hold', 'high', '2026-07-13', '2026-08-21', null, 162655, 162655, null, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['exterior_renovation']::text[], 42, 0, null),
  ('PRJ-000010', '2026-09', 'The Wick Bulkhead', null, 'BE-000000', null, null, '{"street":"41 Cross Street","city":"Hudson","state":"NY","zip":"12414","country":"USA"}'::jsonb, '41 Cross Street LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'preconstruction', 'active', 'planning', 'medium', '2026-08-01', '2026-08-30', null, 0, 0, null, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['roofing']::text[], 60, 0, null),
  ('PRJ-000011', '2026-10', 'Wick Hotel Renovations', null, 'BE-000000', null, null, '{"street":"41 Cross Street","city":"Hudson","state":"NY","zip":"12414","country":"USA"}'::jsonb, '41 Cross Street LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'preconstruction', 'active', 'planning', 'medium', '2026-11-01', '2027-05-01', null, 0, 0, null, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['commercial']::text[], 60, 0, null),
  ('PRJ-000012', '2027-01', '104 Water Street Renovations', null, 'BE-000000', null, null, '{"street":"104 Water Street","city":"Catskill","state":"NY","zip":"12414","country":"USA"}'::jsonb, '104 Water Street Catskill LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'preconstruction', 'active', 'planning', 'medium', '2027-06-07', '2028-08-10', null, 920200, 920200, null, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['historic_restoration']::text[], 60, 0, null),
  ('PRJ-000013', 'Small / ', 'Small / General Work', null, 'BE-000000', null, null, '{"street":"Multiple Properties","city":"Hudson","state":"NY","zip":"12414","country":"USA"}'::jsonb, 'Small / General Work', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'construction', 'active', 'active', 'medium', '2026-01-01', '2026-12-31', null, 0, 0, null, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['internal']::text[], 60, 0, null),
  ('PRJ-000014', '2026-11', 'The Caboose', null, 'BE-000000', null, null, '{"street":"60 South Front Street","city":"Hudson","state":"NY","zip":"12414","country":"USA"}'::jsonb, 'Caboose LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'construction', 'active', 'active', 'medium', '2026-07-16', '2026-08-13', null, 0, 0, null, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['internal']::text[], 70, 30, null),
  ('PRJ-000015', '2026-12', '321 Main Street Roof Repairs', null, 'BE-000000', null, null, '{"street":"321 Main Street","city":"Catskill","state":"NY","zip":"12414","country":"USA"}'::jsonb, '321 Main Street Catskill LLC', null, null, null, null, null, null, null, 'Renovation', 'Renovation', 'Time & Materials', 'preconstruction', 'active', 'planning', 'medium', '2026-09-21', '2026-09-24', null, 0, 0, null, '{"foreman":"Pedro (Lead)"}'::jsonb, ARRAY['roofing']::text[], 60, 0, null)
on conflict (id) do nothing;
