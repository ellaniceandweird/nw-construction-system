-- Restores the correct employee_id on each field_worker_rates row,
-- re-linking them to the employeeId values already stored inside your
-- real Daily Log time entries (confirmed correct via diagnostic query).
-- This undoes the accidental ID clearing and fixes the "missing worker
-- name" issue in Daily Logs.
-- Matches by employee_name, so it's safe to run regardless of whatever
-- employee_id values are currently there.
-- Run once in the Supabase SQL Editor.

update public.field_worker_rates set employee_id = 'EMP-000001' where employee_name = 'Pedro (Lead)';
update public.field_worker_rates set employee_id = 'EMP-000002' where employee_name = 'Federico Taquez Jolon';
update public.field_worker_rates set employee_id = 'EMP-000003' where employee_name = 'Brandon Alexander Xoc Bucu';
update public.field_worker_rates set employee_id = 'EMP-000004' where employee_name = 'Jose Alfredo Yucute Bucu';
update public.field_worker_rates set employee_id = 'EMP-000005' where employee_name = 'Margarito Vicente Sontay';
update public.field_worker_rates set employee_id = 'EMP-000006' where employee_name = 'Angel Francisco Garcia Bacquiax';
update public.field_worker_rates set employee_id = 'EMP-000007' where employee_name = 'Fredy Josue Cuc Choxin';
update public.field_worker_rates set employee_id = 'EMP-000008' where employee_name = 'Alfredo Morales';

-- Sanity check — every row should now show a proper EMP-0000XX value,
-- with none blank and none looking like a long timestamp number.
select employee_id, employee_name from public.field_worker_rates order by employee_id;
