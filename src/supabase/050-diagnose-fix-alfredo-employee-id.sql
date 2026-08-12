-- Step 1 — DIAGNOSTIC: shows Alfredo's current employee_id in
-- field_worker_rates, next to whatever employeeId his real historical
-- Daily Log entries actually reference. If these two don't match, that
-- confirms the same ID-corruption issue as before (his name being
-- edited regenerated his internal ID before the fix that prevents this
-- was installed).

select employee_id, employee_name from public.field_worker_rates
where employee_name ilike '%alfredo morales%';

select distinct
  entry->>'employeeId' as stored_employee_id,
  entry->>'employeeName' as stored_employee_name
from public.daily_logs,
  jsonb_array_elements(time_entries) as entry
where entry->>'employeeName' ilike '%alfredo morales%';

-- Step 2 — THE FIX: uncomment and run this once you've confirmed the
-- mismatch above. This sets his rate record's employee_id to match
-- whatever his real Daily Log history already uses, reconnecting the
-- two. Replace 'EMP-000008' below with whatever stored_employee_id
-- showed up in the second query above, if it's different.

-- update public.field_worker_rates
-- set employee_id = 'EMP-000008'
-- where employee_name ilike '%alfredo morales%';
