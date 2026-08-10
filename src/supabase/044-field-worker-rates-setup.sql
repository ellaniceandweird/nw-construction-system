-- The field_worker_rates table was never actually created in your
-- database — same root cause as the billing_entities issue before.
-- This creates it properly and seeds it with your 8 real workers
-- (pulled from actual Daily Log crew attendance) and their current
-- hourly rates. Run once in the Supabase SQL Editor.

create table if not exists public.field_worker_rates (
  id text primary key,
  employee_id text not null,
  employee_name text not null,
  trade text,
  hourly_rate numeric not null,
  overtime_rate numeric,
  default_cost_code text,
  notes text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.field_worker_rates enable row level security;

drop policy if exists "Authenticated users can view field_worker_rates" on public.field_worker_rates;
create policy "Authenticated users can view field_worker_rates"
on public.field_worker_rates for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert field_worker_rates" on public.field_worker_rates;
create policy "Authenticated users can insert field_worker_rates"
on public.field_worker_rates for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update field_worker_rates" on public.field_worker_rates;
create policy "Authenticated users can update field_worker_rates"
on public.field_worker_rates for update
to authenticated
using (true);

drop policy if exists "Authenticated users can delete field_worker_rates" on public.field_worker_rates;
create policy "Authenticated users can delete field_worker_rates"
on public.field_worker_rates for delete
to authenticated
using (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'field_worker_rates'
  ) then
    alter publication supabase_realtime add table public.field_worker_rates;
  end if;
end $$;

insert into public.field_worker_rates (id, employee_id, employee_name, trade, hourly_rate, overtime_rate, default_cost_code) values
  ('RATE-000001', 'EMP-000001', 'Pedro (Lead)', 'Field Supervision', 38, 57, '01090'),
  ('RATE-000002', 'EMP-000002', 'Federico Taquez Jolon', 'Demolition', 28, 42, '02010'),
  ('RATE-000003', 'EMP-000003', 'Brandon Alexander Xoc Bucu', 'Windows', 30, 45, '085000'),
  ('RATE-000004', 'EMP-000004', 'Jose Alfredo Yucute Bucu', 'Site Preparation', 26, 39, '02010'),
  ('RATE-000005', 'EMP-000005', 'Margarito Vicente Sontay', 'Site Preparation', 26, 39, '02010'),
  ('RATE-000006', 'EMP-000006', 'Angel Francisco Garcia Bacquiax', 'Carpentry', 29, 43.5, '061000'),
  ('RATE-000007', 'EMP-000007', 'Fredy Josue Cuc Choxin', 'Carpentry', 29, 43.5, '061000'),
  ('RATE-000008', 'EMP-000008', 'Alfredo Morales', 'General Labor', 24, 36, '01090')
on conflict (id) do nothing;

-- Sanity check: should return 8.
select count(*) from public.field_worker_rates;
