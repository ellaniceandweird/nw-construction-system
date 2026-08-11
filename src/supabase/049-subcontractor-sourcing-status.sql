-- Adds the sourcing_status column to subcontractor_sourcing_requests.
-- Run once in the Supabase SQL Editor.

alter table public.subcontractor_sourcing_requests add column if not exists sourcing_status text default 'identifying';
