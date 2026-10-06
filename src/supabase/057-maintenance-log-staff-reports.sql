-- Lets the Maintenance Log accept a third kind of entry ("staff_report")
-- from imported staff completion reports.
-- Safe to run whether or not the maintenance_log table already exists:
-- it creates the table if missing, and removes any old restriction that
-- only allowed the two original entry types.
-- Run once in the Supabase SQL Editor.

create table if not exists public.maintenance_log (
  id text primary key,
  timestamp timestamptz not null default now(),
  type text not null,
  property_name text,
  description text not null,
  detail text
);

do $$
declare c text;
begin
  for c in
    select conname from pg_constraint
    where conrelid = 'public.maintenance_log'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%type%'
  loop
    execute format('alter table public.maintenance_log drop constraint %I', c);
  end loop;
end $$;

alter table public.maintenance_log enable row level security;

drop policy if exists "Authenticated users can view maintenance_log" on public.maintenance_log;
create policy "Authenticated users can view maintenance_log"
on public.maintenance_log for select to authenticated using (true);

drop policy if exists "Authenticated users can insert maintenance_log" on public.maintenance_log;
create policy "Authenticated users can insert maintenance_log"
on public.maintenance_log for insert to authenticated with check (true);

drop policy if exists "Authenticated users can update maintenance_log" on public.maintenance_log;
create policy "Authenticated users can update maintenance_log"
on public.maintenance_log for update to authenticated using (true);

drop policy if exists "Authenticated users can delete maintenance_log" on public.maintenance_log;
create policy "Authenticated users can delete maintenance_log"
on public.maintenance_log for delete to authenticated using (true);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'maintenance_log'
  ) then
    alter publication supabase_realtime add table public.maintenance_log;
  end if;
end $$;

select count(*) from public.maintenance_log;
