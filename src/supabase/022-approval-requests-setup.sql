-- New table backing the redesigned Approvals module: real multi-
-- approver tracking (Sjaak/Carlo/Ben individually, not "any one"),
-- auto-linked to Budgets/Estimates/Change Orders/Purchase Orders, plus
-- standalone manual entries.
-- Run once in the Supabase SQL Editor.

create table if not exists public.approval_requests (
  id text primary key,
  kind text not null,
  source_id text,
  title text not null,
  project_name text not null,
  amount numeric not null default 0,
  requested_by text not null,
  requested_date date not null,
  required_approvers text[] not null default '{}',
  sjaak_approved_date date,
  carlo_approved_date date,
  ben_approved_date date,
  approval_status text not null default 'pending',
  notes text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.approval_requests enable row level security;

create policy "Authenticated users can view approval_requests"
on public.approval_requests for select
to authenticated
using (true);

create policy "Authenticated users can insert approval_requests"
on public.approval_requests for insert
to authenticated
with check (true);

create policy "Authenticated users can update approval_requests"
on public.approval_requests for update
to authenticated
using (true);

create policy "Authenticated users can delete approval_requests"
on public.approval_requests for delete
to authenticated
using (true);

alter publication supabase_realtime add table public.approval_requests;
