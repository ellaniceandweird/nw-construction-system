-- Creates the takeoff_items table — previously localStorage-only (no
-- real sync between users/devices) and had no UI at all to view or
-- edit takeoffs. Run once in the Supabase SQL Editor.

create table if not exists public.takeoff_items (
  id text primary key,
  project_id text not null,
  drawing_reference text,
  revision text,
  location text,
  csi_division text,
  cost_code text,
  description text not null,
  measurement_type text not null,
  unit text not null,
  quantity numeric not null default 0,
  waste_factor_percent numeric,
  adjusted_quantity numeric not null default 0,
  measured_by text,
  checked_by text,
  material_key text
);

alter table public.takeoff_items enable row level security;

create policy "Authenticated users can view takeoff_items"
on public.takeoff_items for select
to authenticated
using (true);

create policy "Authenticated users can insert takeoff_items"
on public.takeoff_items for insert
to authenticated
with check (true);

create policy "Authenticated users can update takeoff_items"
on public.takeoff_items for update
to authenticated
using (true);

create policy "Authenticated users can delete takeoff_items"
on public.takeoff_items for delete
to authenticated
using (true);

alter publication supabase_realtime add table public.takeoff_items;

insert into public.takeoff_items (id, project_id, description, location, cost_code, csi_division, measurement_type, unit, quantity, waste_factor_percent, adjusted_quantity, measured_by, material_key) values
  ('TO-000001', 'PRJ-000006', 'Cedar lap siding, 25 Cross St exterior renovation', 'North & west elevations', '074600', 'Division 07', 'sf', 'sf', 1800, 10, 1980, 'Ella Esquivel', 'cedar-siding'),
  ('TO-000002', 'PRJ-000006', 'Replacement window units, matching existing openings', 'North elevation', '085000', 'Division 08', 'each', 'each', 6, null, 6, 'Ella Esquivel', 'windows'),
  ('TO-000003', 'PRJ-000006', 'Trim, fascia & soffit boards to match existing profile', null, '062000', 'Division 06', 'lf', 'lf', 220, 8, 238, 'Ella Esquivel', 'trim-fascia'),
  ('TO-000004', 'PRJ-000006', 'Exterior paint & stain, siding and trim', null, '099000', 'Division 09', 'gallons', 'gallons', 18, null, 18, 'Ella Esquivel', 'paint-stain'),
  ('TO-000005', 'PRJ-000006', 'Brick infill, basement level void', 'Basement', '042000', 'Division 04', 'cy', 'cy', 2, null, 2, 'Ella Esquivel', 'masonry'),
  ('TO-000006', 'PRJ-000006', 'Decking boards & stair treads, rear deck repair', null, '061000', 'Division 06', 'lf', 'lf', 100, 5, 105, 'Ella Esquivel', 'decking-lumber'),
  ('TO-000007', 'PRJ-000010', 'Rebar, #4 grade 60, bulkhead reinforcement', 'Bulkhead', '032000', 'Division 03', 'pieces', 'pieces', 40, null, 40, 'Ella Esquivel', 'rebar-concrete'),
  ('TO-000008', 'PRJ-000002', 'Roofing shingles & underlayment, full re-roof', null, '075400', 'Division 07', 'sq', 'sq', 10, 10, 11, 'Ella Esquivel', 'roofing'),
  ('TO-000009', 'PRJ-000014', 'Fence panels & garden gate hardware, by kitchen', null, '321000', 'Division 32', 'lf', 'lf', 40, null, 40, 'Ella Esquivel', 'fencing'),
  ('TO-000010', 'PRJ-000015', 'Roof repair patch — shingles & flashing', null, '075400', 'Division 07', 'sq', 'sq', 14, 10, 15, 'Ella Esquivel', 'roofing')
on conflict (id) do nothing;
