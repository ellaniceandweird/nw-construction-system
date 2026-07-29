-- Creates the invoices table (previously this data only lived in each
-- browser's localStorage — it never actually synced between users or
-- devices). Run once in the Supabase SQL Editor.

create table if not exists public.invoices (
  id text primary key,
  project_id text not null,
  invoice_number text not null,
  billing_entity_id text not null,
  client text not null,
  invoice_date date not null,
  due_date date not null,
  payment_terms text,
  prepared_by text not null,
  invoice_status text not null default 'draft',
  line_items jsonb not null default '[]',
  total_amount numeric not null default 0,
  created_by text default 'system',
  created_date timestamptz default now(),
  last_modified_by text default 'system',
  last_modified_date timestamptz default now(),
  revision_number int default 1,
  status text default 'active'
);

alter table public.invoices enable row level security;

create policy "Authenticated users can view invoices"
on public.invoices for select
to authenticated
using (true);

create policy "Authenticated users can insert invoices"
on public.invoices for insert
to authenticated
with check (true);

create policy "Authenticated users can update invoices"
on public.invoices for update
to authenticated
using (true);

create policy "Authenticated users can delete invoices"
on public.invoices for delete
to authenticated
using (true);

alter publication supabase_realtime add table public.invoices;

insert into public.invoices (id, project_id, invoice_number, billing_entity_id, client, invoice_date, due_date, payment_terms, prepared_by, invoice_status, line_items, total_amount) values
  ('INV-000001', 'PRJ-000006', 'HVL-8842', 'BE-000007', 'Hudson Valley Lumber Co.', '2026-06-26', '2026-07-26', 'Net 30', 'Ella Esquivel', 'paid',
    '[{"description":"Cedar siding boards","quantity":1200,"unit":"sf","unitPrice":4.25,"amount":5100,"total":5100}]', 5100),
  ('INV-000002', 'PRJ-000006', 'RVR-1187', 'BE-000007', 'Ridgeline Roofing Crew', '2026-07-14', '2026-07-28', 'Net 14', 'Ella Esquivel', 'pending_approval',
    '[{"description":"Standing seam metal roof — labor & materials","quantity":1,"unit":"LS","unitPrice":30000,"amount":30000,"total":30000}]', 30000),
  ('INV-000003', 'PRJ-000010', 'NFS-2290', 'BE-000009', 'North Front Street Hardware', '2026-07-10', '2026-07-17', 'Net 7', 'Ella Esquivel', 'overdue',
    '[{"description":"Rebar, #4 grade 60","quantity":40,"unit":"pieces","unitPrice":21.5,"amount":860,"total":860}]', 860)
on conflict (id) do nothing;
