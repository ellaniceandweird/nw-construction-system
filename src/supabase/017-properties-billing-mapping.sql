-- Adds 5 properties that existing projects already reference but that
-- weren't in the Properties list yet, and sets the correct billing
-- entity on every property (existing + new) per the Company Billing doc.
-- Run once in the Supabase SQL Editor, AFTER 016-real-billing-entities.sql.

insert into public.properties (id, name, address, billing_entity_id) values
  ('PROP-000015', '25 River Street', '25 River Street', 'BE-000008'),
  ('PROP-000016', 'Robert Taylor House', '68 South 2nd Street', 'BE-000010'),
  ('PROP-000017', '25 Cross Street', '25 Cross Street', 'BE-000007'),
  ('PROP-000018', '27 Cross Street', '27 Cross Street', 'BE-000002'),
  ('PROP-000019', '74 Hamburg Road', '74 Hamburg Road', 'BE-000004')
on conflict (id) do nothing;

update public.properties set billing_entity_id = 'BE-000012' where id = 'PROP-000001'; -- 104 Water St
update public.properties set billing_entity_id = 'BE-000002' where id = 'PROP-000002'; -- 18 Cross St
update public.properties set billing_entity_id = 'BE-000013' where id = 'PROP-000003'; -- 321 Main St
update public.properties set billing_entity_id = 'BE-000016' where id = 'PROP-000004'; -- 335 Main St
update public.properties set billing_entity_id = 'BE-000017' where id = 'PROP-000005'; -- 344 Main St
update public.properties set billing_entity_id = 'BE-000018' where id = 'PROP-000006'; -- 373 Main St (Airbnb)
update public.properties set billing_entity_id = 'BE-000018' where id = 'PROP-000007'; -- 373 Main St (Theater)
update public.properties set billing_entity_id = 'BE-000019' where id = 'PROP-000008'; -- 391 Main St
update public.properties set billing_entity_id = 'BE-000007' where id = 'PROP-000009'; -- CSX
update public.properties set billing_entity_id = 'BE-000007' where id = 'PROP-000010'; -- CSX/Caboose/Grapefruit
update public.properties set billing_entity_id = 'BE-000007' where id = 'PROP-000011'; -- Caboose
update public.properties set billing_entity_id = 'BE-000006' where id = 'PROP-000012'; -- General -> Nice and Weird LLC
update public.properties set billing_entity_id = 'BE-000007' where id = 'PROP-000013'; -- Kitty's/Mr Cat
update public.properties set billing_entity_id = 'BE-000009' where id = 'PROP-000014'; -- The Wick -> 41 Cross Street LLC
