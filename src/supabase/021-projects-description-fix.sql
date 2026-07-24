-- Fixes project creation being silently blocked:
-- 1. Adds the project_description column (replaces project_type in the UI)
-- 2. Makes the old project_type column nullable, since the app no longer
--    sends it — it was NOT NULL, so every insert was failing.
-- Run once in the Supabase SQL Editor.

alter table public.projects add column if not exists project_description text;
alter table public.projects alter column project_type drop not null;
