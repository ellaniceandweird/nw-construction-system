-- Adds approval tracking to Estimates (change_orders and budgets
-- already had this) — needed for the new Approvals module.
-- Run once in the Supabase SQL Editor.

alter table public.estimates add column if not exists approved_by text;
alter table public.estimates add column if not exists approval_date date;
