-- Creates the daily_work_plan_details table (Planning > Daily Work Plan) —
-- crew attendance, task-to-person assignments with daily completion
-- targets, procurement needs, equipment, and rain plan, per calendar day.
-- Run once in the Supabase SQL Editor.

create table if not exists public.daily_work_plan_details (
  id text primary key,
  date date not null unique,
  crew_attendance jsonb default '[]'::jsonb,
  task_assignments jsonb default '[]'::jsonb,
  procurement_needs jsonb default '[]'::jsonb,
  equipment_needed text,
  rain_plan text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.daily_work_plan_details enable row level security;

create policy "Authenticated users can view daily_work_plan_details"
on public.daily_work_plan_details for select
to authenticated
using (true);

create policy "Authenticated users can insert daily_work_plan_details"
on public.daily_work_plan_details for insert
to authenticated
with check (true);

create policy "Authenticated users can update daily_work_plan_details"
on public.daily_work_plan_details for update
to authenticated
using (true);

create policy "Authenticated users can delete daily_work_plan_details"
on public.daily_work_plan_details for delete
to authenticated
using (true);

alter publication supabase_realtime add table public.daily_work_plan_details;
