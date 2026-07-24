-- Adds every property from the Catskill and Hudson property maps that
-- wasn't in the system yet, fills in real addresses on existing
-- properties, and fixes one mapping error: "72 South Front Street"
-- (your CSX property) bills through its own "72 South Front Street LLC",
-- not South Front Street Holdings LLC as I'd guessed earlier.
-- Run once in the Supabase SQL Editor.

-- Correction: CSX = 72 South Front Street, its own billing entity.
update public.properties set address = '72 South Front Street', billing_entity_id = 'BE-000011' where id = 'PROP-000009';

-- Fill in real addresses on properties that already existed.
update public.properties set address = '104 Water Street' where id = 'PROP-000001';
update public.properties set address = '18 Cross Street' where id = 'PROP-000002';
update public.properties set address = '321 Main Street' where id = 'PROP-000003';
update public.properties set address = '335 Main Street' where id = 'PROP-000004';
update public.properties set address = '344 Main Street' where id = 'PROP-000005';
update public.properties set address = '373 Main Street' where id = 'PROP-000006';
update public.properties set address = '373 Main Street' where id = 'PROP-000007';
update public.properties set address = '391 Main Street' where id = 'PROP-000008';
update public.properties set address = '60 South Front Street' where id = 'PROP-000010';
update public.properties set address = '60 South Front Street' where id = 'PROP-000011';
update public.properties set address = '60 South Front Street' where id = 'PROP-000013';
update public.properties set address = '41 Cross Street' where id = 'PROP-000014';
update public.properties set address = '68 South 2nd Street' where id = 'PROP-000016';

-- New properties from the maps that weren't tracked yet.
insert into public.properties (id, name, address, billing_entity_id) values
  ('PROP-000020', '57 Bridge Street (Parking Lot)', '57 Bridge Street', 'BE-000016'),
  ('PROP-000021', '331 Main Street', '331 Main Street', 'BE-000015'),
  ('PROP-000022', '329 Main Street', '329 Main Street', 'BE-000015'),
  ('PROP-000023', '323 Main Street (Firehouse)', '323 Main Street', 'BE-000014'),
  ('PROP-000024', '14-17 Montgomery Street', '14-17 Montgomery Street', 'BE-000005'),
  ('PROP-000025', '8-12 Cross Street (Garage)', '8-12 Cross Street', 'BE-000007'),
  ('PROP-000026', '23 Cross Street', '23 Cross Street', 'BE-000007'),
  ('PROP-000027', '35 Cross Street', '35 Cross Street', 'BE-000005'),
  ('PROP-000028', '37 Cross Street', '37 Cross Street', 'BE-000005'),
  ('PROP-000029', '207 Tanners Lane', '207 Tanners Lane', 'BE-000005'),
  ('PROP-000030', '210 Tanners Lane', '210 Tanners Lane', 'BE-000005'),
  ('PROP-000031', '221 Tanners Lane', '221 Tanners Lane', 'BE-000005'),
  ('PROP-000032', '218 Tanners Lane', '218 Tanners Lane', 'BE-000005')
on conflict (id) do nothing;
