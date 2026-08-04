-- Adds the property_id column to estimates — needed for the new
-- Property dropdown in the Estimate edit dialog (auto-fills Address
-- when a property is selected). Run once in the Supabase SQL Editor.

alter table public.estimates add column if not exists property_id text;
