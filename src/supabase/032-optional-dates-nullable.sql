-- Fixes "Couldn't save: invalid input syntax for type date" for several
-- optional/completion-style date fields across the app — the code fix
-- (sending NULL instead of an empty string) is already done; this
-- covers the possibility that some of these columns were originally
-- created as NOT NULL, which would still block saving a cleared date.
-- Safe to run even if a column is already nullable.
-- Run once in the Supabase SQL Editor.

alter table public.activities alter column actual_start drop not null;
alter table public.activities alter column actual_finish drop not null;

alter table public.projects alter column actual_completion_date drop not null;

alter table public.maintenance_tasks alter column date_completed drop not null;
alter table public.maintenance_tasks alter column planned_completion_date drop not null;

alter table public.milestones alter column actual_date drop not null;
alter table public.milestones alter column forecast_date drop not null;

alter table public.change_orders alter column approved_date drop not null;
alter table public.estimates alter column approval_date drop not null;
alter table public.budgets alter column approval_date drop not null;

alter table public.approval_requests alter column sjaak_approved_date drop not null;
alter table public.approval_requests alter column carlo_approved_date drop not null;
alter table public.approval_requests alter column ben_approved_date drop not null;
