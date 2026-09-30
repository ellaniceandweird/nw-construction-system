-- Adds Last Raise Date, Previous Rate, and PTO Used (hrs) to
-- field_worker_rates (References > Field Workers).
-- Run once in the Supabase SQL Editor.

alter table public.field_worker_rates add column if not exists last_raise_date date;
alter table public.field_worker_rates add column if not exists previous_rate numeric;
alter table public.field_worker_rates add column if not exists pto_used_hours numeric;
