-- Adds the payment_due_date column to field_worker_invoices — needed for
-- the new Payment Due Date field in Generate Invoices, shown on the
-- printed invoice. Run once in the Supabase SQL Editor.

alter table public.field_worker_invoices add column if not exists payment_due_date date;
