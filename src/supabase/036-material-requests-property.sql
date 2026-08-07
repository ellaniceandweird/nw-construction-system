-- Material Request: Project is now optional, Property is the primary
-- field instead. Adds property_id/property_name and makes project_id
-- nullable. Run once in the Supabase SQL Editor.

alter table public.material_requests add column if not exists property_id text;
alter table public.material_requests add column if not exists property_name text;
alter table public.material_requests alter column project_id drop not null;
