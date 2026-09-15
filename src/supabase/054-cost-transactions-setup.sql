-- The cost_transactions table (Financial > Cost Ledger, manual entries)
-- was never actually created in your database — same root cause as
-- billing_entities, field_worker_rates, cost_codes, and others before
-- it. This creates the table properly with NO sample/seed data — it
-- will be genuinely empty until you add real entries, which is why the
-- "sample data" you've been seeing was actually just a client-side
-- placeholder shown while the real (failing) fetch never resolved.
-- Run once in the Supabase SQL Editor.

create table if not exists public.cost_transactions (
  id text primary key,
  project_id text,
  project_name text,
  activity_id text,
  cost_code text,
  category text not null default 'miscellaneous',
  description text not null,
  vendor_id text,
  date date not null,
  amount numeric not null default 0,
  billing_entity_id text,
  reference_number text,
  source_module text not null default 'manual',
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.cost_transactions enable row level security;

drop policy if exists "Authenticated users can view cost_transactions" on public.cost_transactions;
create policy "Authenticated users can view cost_transactions"
on public.cost_transactions for select
to authenticated
using (true);

drop policy if exists "Authenticated users can insert cost_transactions" on public.cost_transactions;
create policy "Authenticated users can insert cost_transactions"
on public.cost_transactions for insert
to authenticated
with check (true);

drop policy if exists "Authenticated users can update cost_transactions" on public.cost_transactions;
create policy "Authenticated users can update cost_transactions"
on public.cost_transactions for update
to authenticated
using (true);

drop policy if exists "Authenticated users can delete cost_transactions" on public.cost_transactions;
create policy "Authenticated users can delete cost_transactions"
on public.cost_transactions for delete
to authenticated
using (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'cost_transactions'
  ) then
    alter publication supabase_realtime add table public.cost_transactions;
  end if;
end $$;

-- Sanity check — should return 0, confirming the table is genuinely
-- empty and ready for real entries.
select count(*) from public.cost_transactions;
