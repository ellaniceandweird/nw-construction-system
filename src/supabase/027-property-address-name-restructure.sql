-- Restructures Properties: address is now the primary, required field;
-- name becomes the optional business/purpose name (e.g. "Cidery",
-- "The Wick") instead of sometimes holding the address itself.
-- Run once in the Supabase SQL Editor.

alter table public.properties alter column name drop not null;
alter table public.properties add column if not exists address text;

update public.properties set address = '104 Water Street', name = 'White Building' where id = 'PROP-000001';
update public.properties set address = '18 Cross Street', name = null where id = 'PROP-000002';
update public.properties set address = '321 Main Street', name = 'Church' where id = 'PROP-000003';
update public.properties set address = '335 Main Street', name = 'Bank' where id = 'PROP-000004';
update public.properties set address = '344 Main Street', name = 'Community Center' where id = 'PROP-000005';
update public.properties set address = '373 Main Street', name = 'Airbnb' where id = 'PROP-000006';
update public.properties set address = '373 Main Street', name = 'Theater' where id = 'PROP-000007';
update public.properties set address = '391 Main Street', name = 'Cidery' where id = 'PROP-000008';
update public.properties set address = '72 South Front Street', name = 'CSX' where id = 'PROP-000009';
update public.properties set address = '60 South Front Street', name = 'Grapefruit' where id = 'PROP-000010';
update public.properties set address = '60 South Front Street', name = 'Caboose' where id = 'PROP-000011';
update public.properties set address = '', name = 'General' where id = 'PROP-000012';
update public.properties set address = '60 South Front Street', name = 'Kitty''s/Mr Cat' where id = 'PROP-000013';
update public.properties set address = '41 Cross Street', name = 'The Wick' where id = 'PROP-000014';
update public.properties set address = '25 River Street', name = 'To Be Sold' where id = 'PROP-000015';
update public.properties set address = '68 South 2nd Street', name = 'Robert Taylor House' where id = 'PROP-000016';
update public.properties set address = '25 Cross Street', name = null where id = 'PROP-000017';
update public.properties set address = '27 Cross Street', name = null where id = 'PROP-000018';
update public.properties set address = '74 Hamburg Road', name = null where id = 'PROP-000019';
update public.properties set address = '57 Bridge Street', name = 'Parking Lot' where id = 'PROP-000020';
update public.properties set address = '331 Main Street', name = null where id = 'PROP-000021';
update public.properties set address = '329 Main Street', name = null where id = 'PROP-000022';
update public.properties set address = '323 Main Street', name = 'Firehouse' where id = 'PROP-000023';
update public.properties set address = '14-17 Montgomery Street', name = null where id = 'PROP-000024';
update public.properties set address = '8-12 Cross Street', name = 'Garage' where id = 'PROP-000025';
update public.properties set address = '23 Cross Street', name = null where id = 'PROP-000026';
update public.properties set address = '35 Cross Street', name = null where id = 'PROP-000027';
update public.properties set address = '37 Cross Street', name = null where id = 'PROP-000028';
update public.properties set address = '207 Tanners Lane', name = null where id = 'PROP-000029';
update public.properties set address = '210 Tanners Lane', name = null where id = 'PROP-000030';
update public.properties set address = '221 Tanners Lane', name = null where id = 'PROP-000031';
update public.properties set address = '218 Tanners Lane', name = null where id = 'PROP-000032';
