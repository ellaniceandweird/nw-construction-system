-- New maintenance sub-modules: Paint Log, Key Codes.
-- One-time setup — run once in the Supabase SQL Editor.
-- Both start empty since there's no existing real data for these yet —
-- add entries as you go and they'll sync live for everyone.

create table if not exists public.paint_log (
  id text primary key,
  property_id text,
  property_name text not null,
  location text not null,
  brand text,
  color_name text,
  color_code text,
  sheen text,
  date_applied date,
  notes text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

create table if not exists public.key_codes (
  id text primary key,
  property_id text,
  property_name text not null,
  location text not null,
  key_type text,
  key_code text,
  held_by text,
  notes text,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

do $$
declare
  t text;
begin
  foreach t in array array['paint_log', 'key_codes']
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('create policy "Authenticated users can view %1$s" on public.%1$I for select to authenticated using (true)', t);
    execute format('create policy "Authenticated users can insert %1$s" on public.%1$I for insert to authenticated with check (true)', t);
    execute format('create policy "Authenticated users can update %1$s" on public.%1$I for update to authenticated using (true)', t);
    execute format('create policy "Authenticated users can delete %1$s" on public.%1$I for delete to authenticated using (true)', t);
    execute format('alter publication supabase_realtime add table public.%I', t);
  end loop;
end $$;
