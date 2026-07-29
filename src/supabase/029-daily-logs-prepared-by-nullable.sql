-- The Daily Log form no longer asks for "Prepared By" — if that column
-- was originally created as NOT NULL, every new daily log would start
-- failing to save (the same kind of issue as the project dates bug).
-- This makes it nullable so that can't happen. Safe to run even if it's
-- already nullable.
-- Run once in the Supabase SQL Editor.

alter table public.daily_logs alter column prepared_by drop not null;
