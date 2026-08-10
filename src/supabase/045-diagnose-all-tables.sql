-- Checks every table this app expects to exist, all at once, so we can
-- find any other missing ones in one step instead of hitting them one
-- error at a time. Run this in the Supabase SQL Editor — anything
-- listed under "expected" that's NOT in "actual" is missing and needs
-- its own setup SQL, same as billing_entities and field_worker_rates.

with expected(table_name) as (
  values
    ('projects'), ('activities'), ('properties'), ('billing_entities'),
    ('field_worker_rates'), ('us_holidays'), ('cost_codes'), ('cost_database'),
    ('estimates'), ('change_orders'), ('budgets'), ('invoices'),
    ('cost_transactions'), ('material_requests'), ('purchase_orders'),
    ('rfqs'), ('vendors'), ('subcontractor_sourcing_requests'),
    ('maintenance_tasks'), ('equipment_maintenance'), ('key_codes'),
    ('alarm_verbal_passcodes'), ('paint_log'), ('daily_logs'),
    ('field_worker_invoices'), ('documents'), ('drawings'), ('photos'),
    ('material_references'), ('management_notes'), ('approval_requests'),
    ('contacts'), ('takeoff_items')
)
select
  e.table_name,
  case when t.table_name is not null then 'exists' else 'MISSING' end as status
from expected e
left join information_schema.tables t
  on t.table_name = e.table_name and t.table_schema = 'public'
order by status desc, e.table_name;
