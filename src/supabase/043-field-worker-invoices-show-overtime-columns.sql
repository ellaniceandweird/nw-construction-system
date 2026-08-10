-- Adds the show_overtime_columns column to field_worker_invoices — lets
-- you control whether OT Hrs / OT Rate columns appear when an invoice is
-- printed. Defaults to null, which means "decide automatically based on
-- whether the invoice actually has overtime hours."
-- Run once in the Supabase SQL Editor.

alter table public.field_worker_invoices add column if not exists show_overtime_columns boolean;
