-- Rebuilds Paint Log and Key Codes with the real column structure from
-- the Master Paint Spreadsheet and Door Codes document. Run this
-- instead of / after 014 — it drops and recreates both tables since
-- the shape changed (safe since both started empty).

drop table if exists public.paint_log;
drop table if exists public.key_codes;

create table public.paint_log (
  id text primary key,
  property_id text,
  property_name text not null,
  property_address text,
  location text not null,
  location2 text,
  brand text,
  product_type text,
  finish text,
  color text,
  color_code text,
  comments text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

create table public.key_codes (
  id text primary key,
  property_id text,
  property_name text not null,
  space_name text,
  door_identifier text not null,
  access_code text,
  notes text,
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
  foreach t in array array['paint_log', 'key_codes']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Authenticated users can view %1$s" on public.%1$I for select to authenticated using (true)', t);
    execute format('create policy "Authenticated users can insert %1$s" on public.%1$I for insert to authenticated with check (true)', t);
    execute format('create policy "Authenticated users can update %1$s" on public.%1$I for update to authenticated using (true)', t);
    execute format('create policy "Authenticated users can delete %1$s" on public.%1$I for delete to authenticated using (true)', t);
    execute format('alter publication supabase_realtime add table public.%I', t);
  end loop;
end $$;

-- Seed with real data from Master Paint Spreadsheet and Door Codes document.
-- 75 paint log entries
insert into public.paint_log (id, property_id, property_name, property_address, location, location2, brand, product_type, finish, color, color_code, comments) values
  ('PAINT-000001', 'PROP-000011', 'Caboose', '60 South Front Street', 'Kitchen', 'Wall & Ceiling', 'Benjamin Moore', 'Regal Select', 'Semi Gloss', 'Decorators White', null, null),
  ('PAINT-000002', 'PROP-000011', 'Caboose', '60 South Front Street', 'Janitors Closet', 'Wall & Ceiling', 'Benjamin Moore', 'Regal Select', 'Semi Gloss', 'Decorators White', null, null),
  ('PAINT-000003', 'PROP-000011', 'Caboose', '60 South Front Street', 'Coat Room', 'Wall & Ceiling', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'New White', null, null),
  ('PAINT-000004', 'PROP-000011', 'Caboose', '60 South Front Street', 'Storage Rm/Office', 'Wall & Ceiling', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'New White', null, null),
  ('PAINT-000005', 'PROP-000011', 'Caboose', '60 South Front Street', 'Utility Room', 'Wall & Ceiling', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Simply White', null, null),
  ('PAINT-000006', 'PROP-000011', 'Caboose', '60 South Front Street', 'Electric Room', 'Wall & Ceiling', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Decorators White', null, null),
  ('PAINT-000007', 'PROP-000011', 'Caboose', '60 South Front Street', 'Exterior Skirt', 'N/A', 'Benjamin Moore', 'Element Guard', 'Low Lustre', 'Red Rock', null, null),
  ('PAINT-000008', 'PROP-000011', 'Caboose', '60 South Front Street', 'Event Bathroom', 'Doors', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Million Dollar Red', null, null),
  ('PAINT-000009', 'PROP-000011', 'Caboose', '60 South Front Street', 'Gutter Downspout', 'N/A', 'Benjamin Moore', 'High Build', 'Low Lustre', 'Caliente', null, null),
  ('PAINT-000010', 'PROP-000010', 'CSX/Caboose/Grapefruit', '60 South Front Street', 'Bathroom', 'Wall & Ceiling', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Simply White', null, null),
  ('PAINT-000011', 'PROP-000010', 'CSX/Caboose/Grapefruit', '60 South Front Street', 'Utility Room', 'Wall & Ceiling', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Simply White', null, null),
  ('PAINT-000012', 'PROP-000011', 'Caboose', '60 South Front Street', 'Event Bathroom', 'Ceiling', 'Benjamin Moore', 'Regal Select', 'Semi Gloss', 'Caliente', null, 'Maybe change to eggshell to have less sheen'),
  ('PAINT-000013', 'PROP-000011', 'Caboose', '60 South Front Street', 'Exterior Siding', '1st Coat', 'Transtint', '32 Fl-oz', 'VOC 750 G/L', 'Bright Red #6021', null, '3 Coats
4:1 Mix w/ 4 parts distilled water'),
  ('PAINT-000014', 'PROP-000011', 'Caboose', '60 South Front Street', 'Exterior Metal Door', 'N/A', 'Benjamin Moore', 'High Build', 'Soft Gloss', 'Rosey Red', null, null),
  ('PAINT-000015', 'PROP-000011', 'Caboose', '60 South Front Street', 'Exterior Siding', 'Final Coat', 'Osmo Clear Decking Oil', null, null, null, null, '1 Coat
2 Parts Osmo, 1 Part Transtint'),
  ('PAINT-000016', 'PROP-000011', 'Caboose', '60 South Front Street', '2nd Floor Doors', null, 'Benjamin Moore', 'Regal Select', 'Pearl', '(464) Rose Pink', null, 'Also 461 Rose Pink?'),
  ('PAINT-000017', 'PROP-000008', '391 Main St', '391 Main Street', 'Fridge Area', null, 'Benjamin Moore', 'Regal Select', 'Semi Gloss', 'Green 4/21/21', 'Y3
S1
W1
G4', '1x1 5000
0x 12 2500
0x 21 7500
0x 4 3750'),
  ('PAINT-000018', 'PROP-000008', '391 Main St', '391 Main Street', 'Walls and Hallways', null, 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Decorators White', null, null),
  ('PAINT-000019', 'PROP-000008', '391 Main St', '391 Main Street', 'Some Hallways and Walls were originally painted', null, 'Benjamin Moore', 'Regal Select', 'Interior Flat', 'Decorators White', null, null),
  ('PAINT-000020', 'PROP-000008', '391 Main St', '391 Main Street', 'Ceilings', null, 'Benjamin Moore', 'Ultra Spec 500', 'Interior Flat', 'Decorators White', null, null),
  ('PAINT-000021', 'PROP-000008', '391 Main St', '391 Main Street', 'Baseboard', null, 'Benjamin Moore', 'Regal Select', 'Pearl', 'Artic Gray', null, null),
  ('PAINT-000022', 'PROP-000008', '391 Main St', '391 Main Street', 'Ceiling 3rd Floor Stairwell', null, 'Benjamin Moore', 'Regal Select', 'Eggshell', '243 Baffin Island', null, null),
  ('PAINT-000023', 'PROP-000008', '391 Main St', '391 Main Street', '3rd Floor Windows', null, 'Benjamin Moore', 'N/A', 'N/A', '1650 Still Water 04/27/21', 'S1
W1
B1
G1', '0X 17 2500
0x 19.8750
0x 6.5000
0x 0.6250'),
  ('PAINT-000024', 'PROP-000008', '391 Main St', '391 Main Street', 'Above Fridge 3rd Floor Inside Closet', null, 'Benjamin Moore', 'N/A', 'N/A', '521 Nantucket  Breeze 4/19/21', 'Y3
S1
G1', '1x 12.0000
0x 5.5000
0x 4.0000'),
  ('PAINT-000025', 'PROP-000008', '391 Main St', '391 Main Street', 'Cabinets and Fridge', 'Wall', 'Benjamin Moore', 'Advance', 'Satin', 'Green', 'Y3
S1
W1
B1', '4x 6.0000
1x 17,0000
2x 23.0000
0x 17.5000'),
  ('PAINT-000026', 'PROP-000008', '391 Main St', '391 Main Street', 'Exterior Doors', null, 'Rustcat', 'Indoor Outdoor', 'Oilbased Enamel', 'Black Satin', '225B
107', 'Also ____
Windows'),
  ('PAINT-000027', 'PROP-000008', '391 Main St', '391 Main Street', 'Front Stairway', 'Baseboard and Trim', 'Benjamin Moore', 'Regal Select', 'Semi Gloss', '239 Ivory Porcelain', null, null),
  ('PAINT-000028', 'PROP-000008', '391 Main St', '391 Main Street', 'White Trim', null, 'Benjamin Moore', 'Regal Select', 'Soft Gloss', null, null, null),
  ('PAINT-000029', 'PROP-000008', '391 Main St', '391 Main Street', '2nd Floor Office Kitchen Cabinets? Confirm', null, 'Benjamin Moore', null, '550-IX Quart', 'Ivory White', 'Y3
S2', '0x 1.3750
0x 3.6250'),
  ('PAINT-000030', 'PROP-000008', '391 Main St', '391 Main Street', 'Loft Bank', 'Windows', 'Benjamin Moore', 'Cream', 'N403 -IX Gauen', 'Jonesboro Cream', 'Y3
S1
R1', '2X 21.5000
0X 16.5000
0X 15.0000'),
  ('PAINT-000031', 'PROP-000008', '391 Main St', '391 Main Street', 'Bathroom', 'Baseboard Trim', 'Benjamin Moore', 'Regal Select', 'Semi Gloss', 'Decorators White', null, null),
  ('PAINT-000032', 'PROP-000004', '335 Main St', '335 Main Street', 'Top Floor Three Rooms', 'Wall & Ceiling', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'New White (F+B Match)', null, null),
  ('PAINT-000033', 'PROP-000004', '335 Main St', '335 Main Street', 'Top Floor Hallway', 'Ceiling', 'Benjamin Moore', null, 'Ceiling Flat Finish', 'White', null, null),
  ('PAINT-000034', 'PROP-000004', '335 Main St', '335 Main Street', 'Trim + Baseboard (Not Dark Wood Trim)', null, 'Benjamin Moore', 'Regal Select', 'Semigloss', 'Cooking Apple Green (F+B Match)', null, null),
  ('PAINT-000035', 'PROP-000004', '335 Main St', '335 Main Street', 'Tops of Baseboard Dark Trim', null, 'Benjamin Moore', 'Ben', 'Satin / Pearl
Appalachian Brown
N628-4X Quart', '2022-03-07 00:00:00', 'S1
W1
X2
R3', '2x 8.3750
0x 3.3750
0x 15.2500
0x 21.0000'),
  ('PAINT-000036', 'PROP-000004', '335 Main St', '335 Main Street', 'Touch-up Trim + Doors Dark Wood', null, 'Benjamin Moore', 'Ben', 'Premium Flat', 'Brown Tar', null, null),
  ('PAINT-000037', 'PROP-000004', '335 Main St', '335 Main Street', 'First 2 rooms on RHS', null, 'Benjamin Moore', 'Regal Select', 'Eggshell', 'White Dove', null, null),
  ('PAINT-000038', 'PROP-000004', '335 Main St', '335 Main Street', 'Final Coat on Stairs', null, 'Zar', 'High Solids Self-Leveling', 'Satin Interior Oilbase', 'Cigar', null, null),
  ('PAINT-000039', 'PROP-000004', '335 Main St', '335 Main Street', 'Dark Wood Doors / Trim Stairs', null, 'Minwax', 'Gel Stain Multi Surface Stain', 'Semi transparent', 'Cherrywood', null, null),
  ('PAINT-000040', 'PROP-000004', '335 Main St', '335 Main Street', 'Bathrooom Vestibule', null, null, null, null, null, null, null),
  ('PAINT-000041', 'PROP-000007', '373 Main St (Theater)', '373 Main St', 'Apt Back', 'Walls', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Simply White', null, null),
  ('PAINT-000042', 'PROP-000007', '373 Main St (Theater)', '373 Main St', 'Apt Back', 'Windows, Trim Doors', 'Benjamin Moore', 'Regal Select', 'Semi Gloss', 'Simply White', null, null),
  ('PAINT-000043', 'PROP-000007', '373 Main St (Theater)', '373 Main St', 'Apt Back', 'Ceilings', 'Benjamin Moore', 'Ceiling Flat Finish', 'Flat Finish', 'White', null, null),
  ('PAINT-000044', 'PROP-000007', '373 Main St (Theater)', '373 Main St', 'Apt Back', 'Cabinets', 'Benjamin Moore', null, null, '(F+B Match)', null, null),
  ('PAINT-000045', 'PROP-000007', '373 Main St (Theater)', '373 Main St', 'Apt Back', 'Inside Closets', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Decorators White', null, 'Contact Jackie to confirm'),
  ('PAINT-000046', 'PROP-000007', '373 Main St (Theater)', '373 Main St', 'Front Apt', 'Walls', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Decorators White?', null, null),
  ('PAINT-000047', 'PROP-000007', '373 Main St (Theater)', '373 Main St', 'Front Apt', 'Trim', 'Benjamin Moore', 'Regal Select?', 'Semigloss?', 'Decorators White?', null, null),
  ('PAINT-000048', 'PROP-000007', '373 Main St (Theater)', '373 Main St', 'Front Apt', 'Ceilings', 'Benjamin Moore', null, null, 'Decorators White or Ceiling Flat Finish?', null, null),
  ('PAINT-000049', 'PROP-000007', '373 Main St (Theater)', '373 Main St', 'Front Apt', 'Cabinets', 'Benjamin Moore', null, null, null, null, null),
  ('PAINT-000050', 'PROP-000007', '373 Main St (Theater)', '373 Main St', 'Store', 'Walls', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Decorators White', null, null),
  ('PAINT-000051', 'PROP-000007', '373 Main St (Theater)', '373 Main St', 'Store', 'Floor', 'Benjamin Moore', 'CV 392-1X Gauen', null, 'Decorators White CC-20', null, null),
  ('PAINT-000052', 'PROP-000004', '335 Main St', '335 Main Street', 'Bathroom Walls', null, 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Simply White', null, null),
  ('PAINT-000053', 'PROP-000004', '335 Main St', '335 Main Street', 'Bathroom Trim''', null, 'Benjamin Moore', 'Regal Select', 'Semigloss', 'Custom Match', 'N549-1X (Gallon)
S1 OX 2.5000
W1 0X 7.5000
Y2 0X 19.0000
R3 0X 2.7500', 'Note: Code given is in eggshell finish; Needs to be semigloss'),
  ('PAINT-000054', 'PROP-000004', '335 Main St', '335 Main Street', 'Vestibule', null, 'Benjamin Moore', 'Ben', 'Satin / Pearl', '208 Ringweld Ground (F+B Match)', null, null),
  ('PAINT-000055', 'PROP-000005', '344 Main St', '344 Main St', 'Entry Upstairs Hall and Bath', 'Walls and Trim', 'Benjamin Moore', 'Regal Select', 'Satin', 'F&B No.59 New White', null, null),
  ('PAINT-000056', 'PROP-000005', '344 Main St', '344 Main St', 'Entry Upstairs Hall and Bath', 'Black Handrails', 'Benjamin Moore', 'Regal Select', null, 'Rust Oluem; Painter''s Touch Ultra Cover Gloss Black', null, null),
  ('PAINT-000057', 'PROP-000005', '344 Main St', '344 Main St', 'Suites', 'Walls and Trim', 'Benjamin Moore', 'Regal Select', 'Satin', 'BenMoore OC-117 Simply White', null, null),
  ('PAINT-000058', 'PROP-000005', '344 Main St', '344 Main St', 'Suites', 'West Windows (Street)', 'Benjamin Moore', 'Regal Select', 'Satin', 'New White', null, null),
  ('PAINT-000059', 'PROP-000005', '344 Main St', '344 Main St', 'Entry Floor', null, null, null, null, 'Rust-Oleum Epoxy Shield Tan Gloss', null, null),
  ('PAINT-000060', 'PROP-000005', '344 Main St', '344 Main St', 'Suites', 'Ceiling', null, null, null, 'Sherwin Williams Order# 0272573', null, null),
  ('PAINT-000061', 'PROP-000005', '344 Main St', '344 Main St', 'Suites', 'Ceiling', null, 'Pro Industrial', 'Interior Flat', 'WB Acrylic Dryfall', 'W1 24 8 -1
B1 22 4 1 1
L1 - 30 - -
R3 2 21 - -', null),
  ('PAINT-000062', 'PROP-000005', '344 Main St', '344 Main St', 'Bathroom Rits (For 3/4 round on  Floor)', null, 'Benjamin Moore', 'Regal Select', 'Semi Gloss', 'Heritage Red', null, 'Note: Same color but in  BM Advance may have been used in Market/ Store'),
  ('PAINT-000063', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Exterior and Interior', null, null, null, null, 'Posh Red? Coronado 11/08/2020', null, '1 Gallon'),
  ('PAINT-000064', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Exterior', 'West and North Sides', 'Benjamin Moore', 'Regal Select', 'Exterior Highbuild Soft Gloss 09/30/2022', null, 'N403 - 4x (Gallon)
S1 1 x 1.0000
W1 2x 8.7500
M1 5x 29.0000
R3 2x 25.2500', null),
  ('PAINT-000065', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Ceilings', null, 'Benjamin Moore', 'Ultra Spec 500', 'Interior Eggshell', 'White', null, null),
  ('PAINT-000066', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Entrance to Market', 'Walls', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Summer Peach 5G', 'Note: Also 1 Gallon Samen in "Aura Eggshell"

Also 1 Gallon same in "Advance Matte"', null),
  ('PAINT-000067', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Private Party Room', 'Walls', 'Benjamin Moore', 'Regal Select', 'Flat Finish', 'Super White', null, null),
  ('PAINT-000068', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Private Party Room', 'Walls and Trim', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Super White', null, null),
  ('PAINT-000069', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Main Room : Restaurant', '#1 Columns', 'Benjamin Moore', 'Ultra Spec 500', 'DTMAcrylic Gloss Enamel', 'Vanilla Cookie', null, null),
  ('PAINT-000070', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Main Room : Restaurant', '#2 Columns', 'Benjamin Moore', 'Regal Select', 'Semi Gloss', 'Sugar Cookie', 'Columns Only', null),
  ('PAINT-000071', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Restaurant', 'Walls', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Lily of the Valley', 'Possibly in semi gloss previously; Could or should be used for TRIM if walls are eggshell', null),
  ('PAINT-000072', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Restaurant (Previously)', 'Walls', 'Benjamin Moore', 'Ultra Spec 500', 'Semi Gloss', 'Lily of the Valley', null, null),
  ('PAINT-000073', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Restaurant Bathroom LHS', 'Walls and Door', 'Benjamin Moore', 'Regal Select', 'Eggshell (F+B Match)', 'Red Garth', null, null),
  ('PAINT-000074', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Wine Area', null, 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Cortage Red', 'Outline of Brick "Blick studio acrylic Cadmium Red Medium Hue', null),
  ('PAINT-000075', 'PROP-000013', 'Kitty''s/Mr Cat', '60 South Front Street', 'Restaurant Bathroom RHS', 'Custom Walls by Michael Oshea', 'Benjamin Moore', 'Regal Select', 'Eggshell', 'Custom Pink Match apply with White and Red?', null, null)
on conflict (id) do nothing;

-- 33 key code entries
insert into public.key_codes (id, property_id, property_name, space_name, door_identifier, access_code, notes) values
  ('KEY-000001', 'PROP-000008', '391 Main St', 'Made X', 'Spiral Stairwell', '6168, 2038', null),
  ('KEY-000002', 'PROP-000008', '391 Main St', 'Common', 'Rear Exterior', '1723', null),
  ('KEY-000003', 'PROP-000008', '391 Main St', 'Made X', '2nd Fl Apt', '6568', null),
  ('KEY-000004', 'PROP-000008', '391 Main St', 'Ramshackle (Kim)', '3rd Fl Apt', '2728', null),
  ('KEY-000005', 'PROP-000008', '391 Main St', 'Common', 'Front Stairwell', null, null),
  ('KEY-000006', 'PROP-000008', '391 Main St', 'Made X', 'Front Entry', null, null),
  ('KEY-000007', 'PROP-000004', '335 Main St', 'Nice and Weird', 'Front Entry', '8965', null),
  ('KEY-000008', 'PROP-000004', '335 Main St', 'Bank', 'Front Entry', '6789', null),
  ('KEY-000009', 'PROP-000006', '373 Main St (Airbnb)', 'Airbnbs', 'Front Stairwell', '70132', null),
  ('KEY-000010', 'PROP-000006', '373 Main St (Airbnb)', 'Airbnbs', 'Front Unit', '7474', null),
  ('KEY-000011', 'PROP-000006', '373 Main St (Airbnb)', 'Airbnbs', 'Back Unit', '0769', null),
  ('KEY-000012', null, 'In Development', 'In Development', '329 Main St Rear Entry', '2728', null),
  ('KEY-000013', null, 'In Development', 'In Development', '331 Main St Rear Entryway', '2728', null),
  ('KEY-000014', null, 'KAZ', 'KAZ', 'Swinging Gate', '2748', null),
  ('KEY-000015', null, 'KAZ Woodshop', 'KAZ Woodshop', 'Lockbox', '2748', null),
  ('KEY-000016', null, 'KAZ Warehouse', 'KAZ Warehouse', 'Ladders', '2620', null),
  ('KEY-000017', 'PROP-000009', 'CSX', null, 'Main Exterior x2', '1312', null),
  ('KEY-000018', 'PROP-000009', 'CSX', 'Liquor Storage', 'Entry', '3736, 8094', null),
  ('KEY-000019', 'PROP-000002', '18 Cross St', null, 'Main Entry', null, null),
  ('KEY-000020', 'PROP-000002', '18 Cross St', 'Office', 'Entry', null, null),
  ('KEY-000021', 'PROP-000011', 'Caboose', null, 'Train Car Entry', '7777', null),
  ('KEY-000022', 'PROP-000013', 'Kitty''s/Mr Cat', null, 'Garage N Entry', '0912', null),
  ('KEY-000023', 'PROP-000004', '335 Main St', null, 'Camera Basement', '454545', null),
  ('KEY-000024', 'PROP-000013', 'Kitty''s/Mr Cat', 'Rear Doors', 'Exterior', '2772', null),
  ('KEY-000025', null, '210 Tanners', '210 Tanners', 'Barn Entry', '3500', null),
  ('KEY-000026', 'PROP-000006', '373 Main St (Airbnb)', null, 'Closets', '3270', null),
  ('KEY-000027', null, 'KAZ Container', 'KAZ Container', 'Entry', '4141', null),
  ('KEY-000028', 'PROP-000008', '391 Main St', null, 'Padlock', '1812', null),
  ('KEY-000029', 'PROP-000009', 'CSX', 'Liquor Storage', 'Entry', '9109, 5290, prog: 815951', null),
  ('KEY-000030', 'PROP-000013', 'Kitty''s/Mr Cat', null, 'Alarm Verbal Passcode', 'trainsnacks', null),
  ('KEY-000031', 'PROP-000011', 'Caboose', null, 'Alarm Verbal Passcode', 'grapefruit', null),
  ('KEY-000032', 'PROP-000008', '391 Main St', null, 'Alarm Verbal Passcode', 'bottle shop', null),
  ('KEY-000033', 'PROP-000005', '344 Main St', null, 'Alarm Verbal Passcode', '344 Catskill', null)
on conflict (id) do nothing;
