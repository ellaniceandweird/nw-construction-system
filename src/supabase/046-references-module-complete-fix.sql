-- Fixes the entire References module. Same root cause as
-- billing_entities and field_worker_rates before: these tables were
-- never actually created in your database. This creates all three
-- remaining ones (US Holidays, Cost Codes, Cost Database) and seeds
-- them with your real reference data. Safe to re-run if something
-- partially completed before.
-- Run once in the Supabase SQL Editor.

-- ============================================================
-- US HOLIDAYS
-- ============================================================
create table if not exists public.us_holidays (
  id text primary key,
  name text not null,
  date date not null,
  notes text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.us_holidays enable row level security;

drop policy if exists "Authenticated users can view us_holidays" on public.us_holidays;
create policy "Authenticated users can view us_holidays" on public.us_holidays for select to authenticated using (true);
drop policy if exists "Authenticated users can insert us_holidays" on public.us_holidays;
create policy "Authenticated users can insert us_holidays" on public.us_holidays for insert to authenticated with check (true);
drop policy if exists "Authenticated users can update us_holidays" on public.us_holidays;
create policy "Authenticated users can update us_holidays" on public.us_holidays for update to authenticated using (true);
drop policy if exists "Authenticated users can delete us_holidays" on public.us_holidays;
create policy "Authenticated users can delete us_holidays" on public.us_holidays for delete to authenticated using (true);

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'us_holidays') then
    alter publication supabase_realtime add table public.us_holidays;
  end if;
end $$;

insert into public.us_holidays (id, name, date) values
  ('HOL-000001', 'New Year''s Day', '2026-01-01'),
  ('HOL-000002', 'Memorial Day', '2026-05-25'),
  ('HOL-000003', 'Juneteenth', '2026-06-19'),
  ('HOL-000004', 'Independence Day', '2026-07-04'),
  ('HOL-000005', 'Labor Day', '2026-09-07'),
  ('HOL-000006', 'Thanksgiving Day', '2026-11-26'),
  ('HOL-000007', 'Christmas Day', '2026-12-25')
on conflict (id) do nothing;

-- ============================================================
-- COST CODES
-- ============================================================
create table if not exists public.cost_codes (
  id text primary key,
  code text not null,
  description text not null,
  division text not null,
  trade text,
  category text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.cost_codes enable row level security;

drop policy if exists "Authenticated users can view cost_codes" on public.cost_codes;
create policy "Authenticated users can view cost_codes" on public.cost_codes for select to authenticated using (true);
drop policy if exists "Authenticated users can insert cost_codes" on public.cost_codes;
create policy "Authenticated users can insert cost_codes" on public.cost_codes for insert to authenticated with check (true);
drop policy if exists "Authenticated users can update cost_codes" on public.cost_codes;
create policy "Authenticated users can update cost_codes" on public.cost_codes for update to authenticated using (true);
drop policy if exists "Authenticated users can delete cost_codes" on public.cost_codes;
create policy "Authenticated users can delete cost_codes" on public.cost_codes for delete to authenticated using (true);

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'cost_codes') then
    alter publication supabase_realtime add table public.cost_codes;
  end if;
end $$;

insert into public.cost_codes (id, code, description, division, trade) values
  ('CC-000001', '01030', 'Temporary Facilities', 'Division 01 — General Conditions', 'General'),
  ('CC-000002', '01060', 'Permits and Fees', 'Division 01 — General Conditions', 'General'),
  ('CC-000003', '01090', 'Construction Labor', 'Division 01 — General Conditions', 'General'),
  ('CC-000004', '032000', 'Concrete Reinforcing (Rebar)', 'Division 03 — Concrete', 'Concrete'),
  ('CC-000005', '033000', 'Cast-In-Place Concrete', 'Division 03 — Concrete', 'Concrete'),
  ('CC-000006', '042000', 'Unit Masonry', 'Division 04 — Masonry', 'Masonry'),
  ('CC-000007', '061000', 'Rough Carpentry (Framing & Decking)', 'Division 06 — Wood & Plastics', 'Carpentry'),
  ('CC-000008', '062000', 'Finish Carpentry (Trim, Fascia & Soffit)', 'Division 06 — Wood & Plastics', 'Carpentry'),
  ('CC-000009', '074600', 'Siding', 'Division 07 — Thermal & Moisture Protection', 'Siding'),
  ('CC-000010', '075400', 'Roofing Membrane & Shingles', 'Division 07 — Thermal & Moisture Protection', 'Roofing'),
  ('CC-000011', '076200', 'Sheet Metal Flashing & Underlayment', 'Division 07 — Thermal & Moisture Protection', 'Roofing'),
  ('CC-000012', '081000', 'Doors', 'Division 08 — Openings', 'Doors & Windows'),
  ('CC-000013', '085000', 'Windows', 'Division 08 — Openings', 'Doors & Windows'),
  ('CC-000014', '099000', 'Painting & Coating', 'Division 09 — Finishes', 'Painting'),
  ('CC-000015', '220000', 'Plumbing', 'Division 22 — Plumbing', 'Plumbing'),
  ('CC-000016', '230000', 'HVAC', 'Division 23 — HVAC', 'HVAC'),
  ('CC-000017', '260000', 'Electrical', 'Division 26 — Electrical', 'Electrical'),
  ('CC-000018', '321000', 'Fencing & Site Improvements', 'Division 32 — Exterior Improvements', 'General')
on conflict (id) do nothing;

-- ============================================================
-- COST DATABASE
-- ============================================================
create table if not exists public.cost_database (
  id text primary key,
  cost_code text not null,
  description text not null,
  category text,
  unit text not null,
  labor_cost numeric default 0,
  material_cost numeric default 0,
  equipment_cost numeric default 0,
  subcontract_cost numeric default 0,
  overhead_percent numeric,
  profit_percent numeric,
  last_updated date,
  supplier text,
  historical_average numeric,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.cost_database enable row level security;

drop policy if exists "Authenticated users can view cost_database" on public.cost_database;
create policy "Authenticated users can view cost_database" on public.cost_database for select to authenticated using (true);
drop policy if exists "Authenticated users can insert cost_database" on public.cost_database;
create policy "Authenticated users can insert cost_database" on public.cost_database for insert to authenticated with check (true);
drop policy if exists "Authenticated users can update cost_database" on public.cost_database;
create policy "Authenticated users can update cost_database" on public.cost_database for update to authenticated using (true);
drop policy if exists "Authenticated users can delete cost_database" on public.cost_database;
create policy "Authenticated users can delete cost_database" on public.cost_database for delete to authenticated using (true);

do $$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'cost_database') then
    alter publication supabase_realtime add table public.cost_database;
  end if;
end $$;

insert into public.cost_database (id, cost_code, description, unit, labor_cost, material_cost, equipment_cost, subcontract_cost, profit_percent, last_updated) values
  ('CDB-000001', '01030', 'Temporary Facilities', 'LS', 0, 5000, 0, 0, 0, '2026-07-01'),
  ('CDB-000002', '01060', 'Permits and Fees', 'LS', 0, 750, 0, 0, 0, '2026-07-01'),
  ('CDB-000003', '01090', 'Construction Labor', 'weeks', 6540, 0, 0, 0, 0, '2026-07-01'),
  ('CDB-000004', '02010', 'Demolition', 'LS', 0, 1500, 0, 0, 0, '2026-07-01'),
  ('CDB-000005', '032000', 'Concrete Reinforcing (Rebar)', 'pieces', 15, 21.50, 5, 0, 15, '2026-07-01'),
  ('CDB-000006', '033000', 'Cast-In-Place Concrete', 'cy', 220, 185, 50, 0, 15, '2026-07-01'),
  ('CDB-000007', '042000', 'Unit Masonry', 'cy', 400, 180, 0, 0, 12, '2026-07-01'),
  ('CDB-000008', '06010', 'Rough Carpentry', 'LS', 0, 1500, 0, 0, 0, '2026-07-01'),
  ('CDB-000009', '061000', 'Rough Carpentry (Framing & Decking)', 'lf', 4, 6.50, 0, 0, 15, '2026-07-01'),
  ('CDB-000010', '062000', 'Finish Carpentry (Trim, Fascia & Soffit)', 'lf', 2, 3.10, 0, 0, 15, '2026-07-01'),
  ('CDB-000011', '07010', 'Damproofing and Waterproofing', 'SF', 0, 0.30, 0, 0, 0, '2026-07-01'),
  ('CDB-000012', '074600', 'Siding', 'sf', 2.50, 4.25, 0.10, 0, 15, '2026-07-01'),
  ('CDB-000013', '075400', 'Roofing Membrane & Shingles', 'sq', 150, 380, 10, 0, 15, '2026-07-01'),
  ('CDB-000014', '085000', 'Windows', 'each', 350, 890, 0, 0, 15, '2026-07-01'),
  ('CDB-000015', '099000', 'Painting & Coating', 'gallons', 40, 55, 0, 0, 12, '2026-07-01'),
  ('CDB-000016', '321000', 'Fencing & Site Improvements', 'lf', 8, 12, 0, 0, 12, '2026-07-01')
on conflict (id) do nothing;

-- Sanity check — should return: us_holidays=7, cost_codes=18, cost_database=16
select 'us_holidays' as table_name, count(*) from public.us_holidays
union all
select 'cost_codes', count(*) from public.cost_codes
union all
select 'cost_database', count(*) from public.cost_database;
