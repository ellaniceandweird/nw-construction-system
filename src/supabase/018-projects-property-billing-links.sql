-- Links every existing project to its real property and billing
-- entity (previously projects had no property link and a placeholder
-- 'BE-000000' billing entity).
-- Run once in the Supabase SQL Editor, AFTER 017-properties-billing-mapping.sql.

update public.projects set property_id = 'PROP-000015', billing_entity_id = 'BE-000008', property_name = '25 River Street' where id = 'PRJ-000001'; -- 25 River Street Renovations
update public.projects set property_id = 'PROP-000002', billing_entity_id = 'BE-000002', property_name = '18 Cross St' where id = 'PRJ-000002'; -- 18 Cross St Garage
update public.projects set property_id = 'PROP-000016', billing_entity_id = 'BE-000010', property_name = 'Robert Taylor House' where id = 'PRJ-000003'; -- Robert Taylor House
update public.projects set property_id = 'PROP-000013', billing_entity_id = 'BE-000007', property_name = 'Kitty''s/Mr Cat' where id = 'PRJ-000004'; -- Kitty's Renovations
update public.projects set property_id = 'PROP-000016', billing_entity_id = 'BE-000010', property_name = 'Robert Taylor House' where id = 'PRJ-000005'; -- Robert Taylor House
update public.projects set property_id = 'PROP-000017', billing_entity_id = 'BE-000007', property_name = '25 Cross Street' where id = 'PRJ-000006'; -- 25 Cross St Exterior Renovation
update public.projects set property_id = 'PROP-000014', billing_entity_id = 'BE-000009', property_name = 'The Wick' where id = 'PRJ-000007'; -- Wick Model Rooms
update public.projects set property_id = 'PROP-000019', billing_entity_id = 'BE-000004', property_name = '74 Hamburg Road' where id = 'PRJ-000008'; -- 74 Hamburg Lane (Ben's House)
update public.projects set property_id = 'PROP-000018', billing_entity_id = 'BE-000002', property_name = '27 Cross Street' where id = 'PRJ-000009'; -- 27 Cross St Exterior Renovation
update public.projects set property_id = 'PROP-000014', billing_entity_id = 'BE-000009', property_name = 'The Wick' where id = 'PRJ-000010'; -- The Wick Bulkhead
update public.projects set property_id = 'PROP-000014', billing_entity_id = 'BE-000009', property_name = 'The Wick' where id = 'PRJ-000011'; -- Wick Hotel Renovations
update public.projects set property_id = 'PROP-000001', billing_entity_id = 'BE-000012', property_name = '104 Water St' where id = 'PRJ-000012'; -- 104 Water Street Renovations
update public.projects set property_id = 'PROP-000012', billing_entity_id = 'BE-000006', property_name = 'General' where id = 'PRJ-000013'; -- Small / General Work
update public.projects set property_id = 'PROP-000011', billing_entity_id = 'BE-000007', property_name = 'Caboose' where id = 'PRJ-000014'; -- The Caboose
update public.projects set property_id = 'PROP-000003', billing_entity_id = 'BE-000013', property_name = '321 Main St' where id = 'PRJ-000015'; -- 321 Main Street Roof Repairs

-- Purchase Orders had the same 'BE-000000' placeholder — fix those too,
-- matching each PO's actual project's real billing entity.
update public.purchase_orders set billing_entity_id = 'BE-000007' where id = 'PO-000001'; -- 25 Cross St
update public.purchase_orders set billing_entity_id = 'BE-000007' where id = 'PO-000002'; -- 25 Cross St
update public.purchase_orders set billing_entity_id = 'BE-000007' where id = 'PO-000003'; -- 25 Cross St
update public.purchase_orders set billing_entity_id = 'BE-000007' where id = 'PO-000004'; -- Kitty's
update public.purchase_orders set billing_entity_id = 'BE-000009' where id = 'PO-000005'; -- Wick Bulkhead
update public.purchase_orders set billing_entity_id = 'BE-000004' where id = 'PO-000006'; -- 74 Hamburg
update public.purchase_orders set billing_entity_id = 'BE-000002' where id = 'PO-000007'; -- 18 Cross St Garage
update public.purchase_orders set billing_entity_id = 'BE-000007' where id = 'PO-000008'; -- Caboose
