-- Migrates 3 more localStorage-only stores to the real shared
-- database: Cost Ledger notes, Cost Tracking notes, and Automation
-- Rules settings. Run once in the Supabase SQL Editor.

create table if not exists public.cost_ledger_notes (
  id text primary key, -- the transaction id this note belongs to
  note text not null default ''
);

create table if not exists public.cost_tracking_notes (
  id text primary key, -- the estimate id this note belongs to
  note text not null default ''
);

create table if not exists public.automation_rules (
  id text primary key, -- always 'default' — one shared settings row
  change_order_approval_threshold numeric not null default 5000,
  quote_approval_tier1_threshold numeric not null default 1000,
  quote_approval_tier2_threshold numeric not null default 3000,
  tier1_approvers text not null default 'Sjaak',
  tier2_approvers text not null default 'Sjaak, Carlo',
  tier3_approvers text not null default 'Sjaak, Carlo, Ben'
);

do $$
declare
  t text;
begin
  foreach t in array array['cost_ledger_notes', 'cost_tracking_notes', 'automation_rules']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Authenticated users can view %1$s" on public.%1$I for select to authenticated using (true)', t);
    execute format('create policy "Authenticated users can insert %1$s" on public.%1$I for insert to authenticated with check (true)', t);
    execute format('create policy "Authenticated users can update %1$s" on public.%1$I for update to authenticated using (true)', t);
    execute format('create policy "Authenticated users can delete %1$s" on public.%1$I for delete to authenticated using (true)', t);
    execute format('alter publication supabase_realtime add table public.%I', t);
  end loop;
end $$;

insert into public.automation_rules (id) values ('default')
on conflict (id) do nothing;
