-- Phase 2, batch 3: Estimates, Change Orders, Cost Database.
-- One-time setup — run once in the Supabase SQL Editor.

create table if not exists public.estimates (
  id text primary key,
  project_id text not null,
  estimate_number text not null,
  client text,
  address text,
  estimator text not null,
  estimate_date date not null,
  revision int not null default 1,
  estimate_status text not null default 'draft',
  proposal_number text,
  currency text not null default 'USD',
  tax_method text,
  profit_margin_percent numeric,
  markup_percent numeric,
  notes text,
  line_items jsonb not null default '[]'::jsonb,
  takeoff_items jsonb,
  subcontract_options jsonb,
  indirect_costs jsonb,
  contingency jsonb,
  total_estimated_cost numeric not null default 0,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

create table if not exists public.change_orders (
  id text primary key,
  project_id text not null,
  estimate_id text not null,
  change_order_number text not null,
  description text not null,
  reason text,
  cost_impact numeric not null default 0,
  schedule_impact_days int,
  related_item text,
  change_order_status text not null default 'pending',
  requested_by text,
  requested_date date not null,
  approved_by text,
  approved_date date,
  notes text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

create table if not exists public.cost_database (
  id text primary key,
  cost_code text not null,
  description text not null,
  category text,
  unit text not null,
  labor_cost numeric not null default 0,
  material_cost numeric not null default 0,
  equipment_cost numeric not null default 0,
  subcontract_cost numeric not null default 0,
  overhead_percent numeric,
  profit_percent numeric,
  last_updated date not null default current_date,
  supplier text,
  historical_average numeric,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

do $$
declare
  t text;
begin
  foreach t in array array['estimates', 'change_orders', 'cost_database']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Authenticated users can view %1$s" on public.%1$I for select to authenticated using (true)', t);
    execute format('create policy "Authenticated users can insert %1$s" on public.%1$I for insert to authenticated with check (true)', t);
    execute format('create policy "Authenticated users can update %1$s" on public.%1$I for update to authenticated using (true)', t);
    execute format('create policy "Authenticated users can delete %1$s" on public.%1$I for delete to authenticated using (true)', t);
    execute format('alter publication supabase_realtime add table public.%I', t);
  end loop;
end $$;

-- Seed with your real data.
-- Estimates
insert into public.estimates (id, project_id, estimate_number, client, address, estimator, estimate_date, revision, estimate_status, proposal_number, currency, tax_method, profit_margin_percent, markup_percent, notes, line_items, takeoff_items, subcontract_options, indirect_costs, contingency, total_estimated_cost) values
  ('EST-000001', 'PRJ-000006', 'EST-2026-0001', 'Kitty', '25 Cross Street, Hudson NY 12534', 'Ella Esquivel', '2026-06-18', 2, 'approved', null, 'USD', 'Sales tax on materials', null, null, 'Transcribed from the 27 Cross Exterior Renovations Revised Quantities budget workbook.', '[{"costCode":"01000","description":"Architect (Walter Chatham) — hourly","quantity":10,"unit":"HRS","laborCost":0,"materialCost":2500,"equipmentCost":0,"subcontractCost":0,"notes":"Charged hourly","totalCost":2500},{"costCode":"01030","description":"Temporary Facilities — fencing, dumpster fees, etc.","quantity":1,"unit":"LS","laborCost":0,"materialCost":5000,"equipmentCost":0,"subcontractCost":0,"totalCost":5000},{"costCode":"01060","description":"Permits and Fees — HPC, Building Permit, CoO","quantity":1,"unit":"LS","laborCost":0,"materialCost":750,"equipmentCost":0,"subcontractCost":0,"totalCost":750},{"costCode":"01070","description":"General Office Overhead — printing, misc office costs","quantity":1,"unit":"LS","laborCost":0,"materialCost":500,"equipmentCost":0,"subcontractCost":0,"totalCost":500},{"costCode":"01090","description":"Construction Labor — 6 wks full crew @ $6,540/wk","quantity":6,"unit":"weeks","laborCost":39240,"materialCost":0,"equipmentCost":0,"subcontractCost":0,"notes":"7 carpenters and laborers","totalCost":39240},{"costCode":"02010","description":"Demolition — removal of all existing siding & windows","quantity":1,"unit":"LS","laborCost":0,"materialCost":1500,"equipmentCost":0,"subcontractCost":0,"notes":"Labor included under Construction Labor","totalCost":1500},{"costCode":"06010","description":"Rough Carpentry — window rough-opening adjustments","quantity":1,"unit":"LS","laborCost":0,"materialCost":1500,"equipmentCost":0,"subcontractCost":0,"totalCost":1500},{"costCode":"06010","description":"Rough Carpentry — exterior deck repairs and replacement","quantity":1,"unit":"LS","laborCost":0,"materialCost":2500,"equipmentCost":0,"subcontractCost":0,"totalCost":2500},{"costCode":"07010","description":"Damproofing and Waterproofing — house wrap","quantity":1700,"unit":"SF","laborCost":0,"materialCost":510,"equipmentCost":0,"subcontractCost":0,"totalCost":510},{"costCode":"07010","description":"Misc waterproofing materials","quantity":1,"unit":"LS","laborCost":0,"materialCost":1000,"equipmentCost":0,"subcontractCost":0,"totalCost":1000},{"costCode":"07020","description":"Insulation — window insulation & misc as needed","quantity":1,"unit":"LS","laborCost":0,"materialCost":1000,"equipmentCost":0,"subcontractCost":0,"totalCost":1000},{"costCode":"07030","description":"Roofing — standing seam metal roof","quantity":1,"unit":"LS","laborCost":0,"materialCost":0,"equipmentCost":0,"subcontractCost":30000,"notes":"Subcontractor","totalCost":30000},{"costCode":"07040","description":"Siding — board & batten","quantity":3300,"unit":"LF","laborCost":0,"materialCost":13200,"equipmentCost":0,"subcontractCost":0,"totalCost":13200},{"costCode":"07040","description":"Window Trim","quantity":1,"unit":"LS","laborCost":0,"materialCost":3500,"equipmentCost":0,"subcontractCost":0,"totalCost":3500},{"costCode":"07050","description":"Flashing and Sheet Metal — misc flashing","quantity":1,"unit":"LS","laborCost":0,"materialCost":2500,"equipmentCost":0,"subcontractCost":0,"totalCost":2500},{"costCode":"08020","description":"Exterior Doors — new basement door","quantity":1,"unit":"EA","laborCost":0,"materialCost":2500,"equipmentCost":0,"subcontractCost":0,"totalCost":2500},{"costCode":"08020","description":"Exterior Doors — new 1st floor back door","quantity":1,"unit":"LS","laborCost":0,"materialCost":3000,"equipmentCost":0,"subcontractCost":0,"totalCost":3000},{"costCode":"085000","description":"Windows — Marvin Windows","quantity":35,"unit":"EA","laborCost":0,"materialCost":74375,"equipmentCost":0,"subcontractCost":0,"totalCost":74375},{"costCode":"09050","description":"Painting and Coating — exterior fascia, trim and doors","quantity":1,"unit":"LS","laborCost":0,"materialCost":2500,"equipmentCost":0,"subcontractCost":0,"totalCost":2500},{"costCode":"09050","description":"Painting and Coating — exterior deck stain/paint","quantity":1,"unit":"LS","laborCost":0,"materialCost":2000,"equipmentCost":0,"subcontractCost":0,"totalCost":2000}]'::jsonb, null, null, null, '{"constructionContingencyPercent":5,"insurancePercent":2}'::jsonb, 203034.825),
  ('EST-000002', 'PRJ-000010', 'EST-2026-0002', null, null, 'Ella Esquivel', '2026-07-01', 1, 'owner_review', null, 'USD', 'Sales tax on materials', null, null, 'Structural bulkhead reinforcement — higher construction contingency given below-grade unknowns.', '[{"costCode":"032000","description":"Rebar, #4 grade 60 — bulkhead reinforcement","quantity":40,"unit":"pieces","laborCost":600,"materialCost":860,"equipmentCost":200,"subcontractCost":0,"markupPercent":15,"totalCost":1908.9999999999998},{"costCode":"033000","description":"Cast-in-place concrete — bulkhead pour","quantity":8,"unit":"cy","laborCost":1760,"materialCost":1480,"equipmentCost":400,"subcontractCost":0,"markupPercent":15,"totalCost":4186}]'::jsonb, null, null, '{"generalConditions":600,"permits":250}'::jsonb, '{"constructionContingencyPercent":8,"corporateOverheadPercent":5,"profitPercent":10,"salesTaxPercent":8,"insurancePercent":2}'::jsonb, 9543.373408799998),
  ('EST-000003', 'PRJ-000002', 'EST-2026-0003', null, null, 'Ella Esquivel', '2026-07-12', 1, 'draft', null, 'USD', null, null, null, 'Draft — pending final shingle color selection before client review.', '[{"costCode":"075400","description":"Roofing shingles & underlayment — full re-roof","quantity":11,"unit":"sq","laborCost":1650,"materialCost":4180,"equipmentCost":100,"subcontractCost":0,"markupPercent":15,"totalCost":6819.499999999999}]'::jsonb, null, null, '{"permits":150}'::jsonb, '{"constructionContingencyPercent":5,"corporateOverheadPercent":5,"profitPercent":10,"salesTaxPercent":8}'::jsonb, 9128.442014999999)
on conflict (id) do nothing;

-- Change Orders
insert into public.change_orders (id, project_id, estimate_id, change_order_number, description, reason, cost_impact, schedule_impact_days, related_item, change_order_status, requested_by, requested_date, approved_by, approved_date, notes) values
  ('CO-000001', 'PRJ-000006', 'EST-000001', 'CO-2026-0001', 'Additional sill plate rot found under removed siding — sistered framing repair required', 'Concealed condition discovered during demolition', 1450, null, null, 'approved', 'Ella Esquivel', '2026-07-05', 'Ella Esquivel', '2026-07-08', 'Approved same week — crew was already on site for siding demo.'),
  ('CO-000002', 'PRJ-000010', 'EST-000002', 'CO-2026-0002', 'Deduct: owner elected to reuse existing bulkhead hardware instead of full replacement', 'Owner cost-saving request', -600, null, null, 'pending', 'Ella Esquivel', '2026-07-11', null, null, 'Awaiting confirmation the existing hardware passes inspection.')
on conflict (id) do nothing;

-- Cost Database
insert into public.cost_database (id, cost_code, description, category, unit, labor_cost, material_cost, equipment_cost, subcontract_cost, overhead_percent, profit_percent, last_updated, supplier, historical_average) values
  ('CDB-000001', '01030', 'Temporary Facilities', null, 'LS', 0, 5000, 0, 0, null, 0, '2026-07-01', null, null),
  ('CDB-000002', '01060', 'Permits and Fees', null, 'LS', 0, 750, 0, 0, null, 0, '2026-07-01', null, null),
  ('CDB-000003', '01090', 'Construction Labor', null, 'weeks', 6540, 0, 0, 0, null, 0, '2026-07-01', null, null),
  ('CDB-000004', '02010', 'Demolition', null, 'LS', 0, 1500, 0, 0, null, 0, '2026-07-01', null, null),
  ('CDB-000005', '032000', 'Concrete Reinforcing (Rebar)', null, 'pieces', 15, 21.5, 5, 0, null, 15, '2026-07-01', null, null),
  ('CDB-000006', '033000', 'Cast-In-Place Concrete', null, 'cy', 220, 185, 50, 0, null, 15, '2026-07-01', null, null),
  ('CDB-000007', '042000', 'Unit Masonry', null, 'cy', 400, 180, 0, 0, null, 12, '2026-07-01', null, null),
  ('CDB-000008', '06010', 'Rough Carpentry', null, 'LS', 0, 1500, 0, 0, null, 0, '2026-07-01', null, null),
  ('CDB-000009', '061000', 'Rough Carpentry (Framing & Decking)', null, 'lf', 4, 6.5, 0, 0, null, 15, '2026-07-01', null, null),
  ('CDB-000010', '062000', 'Finish Carpentry (Trim, Fascia & Soffit)', null, 'lf', 2, 3.1, 0, 0, null, 15, '2026-07-01', null, null),
  ('CDB-000011', '07010', 'Damproofing and Waterproofing', null, 'SF', 0, 0.3, 0, 0, null, 0, '2026-07-01', null, null),
  ('CDB-000012', '074600', 'Siding', null, 'sf', 2.5, 4.25, 0.1, 0, null, 15, '2026-07-01', null, null),
  ('CDB-000013', '075400', 'Roofing Membrane & Shingles', null, 'sq', 150, 380, 10, 0, null, 15, '2026-07-01', null, null),
  ('CDB-000014', '085000', 'Windows', null, 'each', 350, 890, 0, 0, null, 15, '2026-07-01', null, null),
  ('CDB-000015', '099000', 'Painting & Coating', null, 'gallons', 40, 55, 0, 0, null, 12, '2026-07-01', null, null),
  ('CDB-000016', '321000', 'Fencing & Site Improvements', null, 'lf', 8, 12, 0, 0, null, 12, '2026-07-01', null, null)
on conflict (id) do nothing;
