-- Fixes "Couldn't save: invalid input syntax for type date" when
-- clearing a project's Start Date or Target Completion Date.
-- Two things needed:
-- 1. The app now sends NULL instead of an empty string when a date is
--    cleared (Postgres date columns reject "" — code fix, already done).
-- 2. In case these columns were originally created as NOT NULL, this
--    drops that constraint so a cleared date can actually be saved as
--    NULL. Safe to run even if they're already nullable.
-- Run once in the Supabase SQL Editor.

alter table public.projects alter column start_date drop not null;
alter table public.projects alter column planned_completion_date drop not null;
