-- Adds the manual_completion_percent column to projects — lets you
-- override the automatic activity-based % Complete calculation when
-- needed. Null means "use the automatic calculation" (the default,
-- unchanged behavior).
-- Run once in the Supabase SQL Editor.

alter table public.projects add column if not exists manual_completion_percent numeric;
