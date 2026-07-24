-- Replaces the 2 placeholder billing entities with your real 19 LLCs
-- from the Company Billing & Entity List (pages 1-2).
-- Run once in the Supabase SQL Editor.

delete from public.billing_entities;

insert into public.billing_entities (id, company_name, legal_name, address, invoice_prefix, default_payment_terms) values
  ('BE-000001', 'Appleton Lane Holdings LLC', 'Appleton Lane Holdings LLC', null, null, 'Net 30'),
  ('BE-000002', 'Cross Street Holdings LLC', 'Cross Street Holdings LLC', null, null, 'Net 30'),
  ('BE-000003', 'Hana Road Holdings LLC', 'Hana Road Holdings LLC', null, null, 'Net 30'),
  ('BE-000004', '74 Hamburg Road LLC', '74 Hamburg Road LLC', null, null, 'Net 30'),
  ('BE-000005', 'Montgomery Street Projects LLC', 'Montgomery Street Projects LLC', null, null, 'Net 30'),
  ('BE-000006', 'Nice and Weird LLC', 'Nice and Weird LLC', null, null, 'Net 30'),
  ('BE-000007', 'South Front Street Holdings LLC', 'South Front Street Holdings LLC', null, null, 'Net 30'),
  ('BE-000008', '25 River Street Catskill LLC', '25 River Street Catskill LLC', null, null, 'Net 30'),
  ('BE-000009', '41 Cross Street LLC', '41 Cross Street LLC', null, null, 'Net 30'),
  ('BE-000010', 'Robert Taylor House LLC', 'Robert Taylor House LLC', null, null, 'Net 30'),
  ('BE-000011', '72 South Front Street LLC', '72 South Front Street LLC', null, null, 'Net 30'),
  ('BE-000012', '104 Water Street Catskill LLC', '104 Water Street Catskill LLC', null, null, 'Net 30'),
  ('BE-000013', '321 Main Street Catskill LLC', '321 Main Street Catskill LLC', null, null, 'Net 30'),
  ('BE-000014', '323 Main Street Catskill LLC', '323 Main Street Catskill LLC', null, null, 'Net 30'),
  ('BE-000015', '331 Main Street Catskill LLC', '331 Main Street Catskill LLC', null, null, 'Net 30'),
  ('BE-000016', '335 Main Street LLC', '335 Main Street LLC', null, null, 'Net 30'),
  ('BE-000017', '344 Main Street LLC', '344 Main Street LLC', null, null, 'Net 30'),
  ('BE-000018', '373 Main Street LLC', '373 Main Street LLC', null, null, 'Net 30'),
  ('BE-000019', '391 Main Street LLC', '391 Main Street LLC', null, null, 'Net 30');
