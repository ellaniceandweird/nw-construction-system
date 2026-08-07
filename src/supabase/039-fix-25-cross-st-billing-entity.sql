-- Directly fixes "25 Cross St Exterior Renovation"'s missing property/
-- billing entity link. Looks things up by name/address rather than
-- hardcoded IDs, so this works even if your real IDs differ slightly
-- from the illustrative seed data. Run once in the Supabase SQL Editor.

update public.projects
set
  property_id = (select id from public.properties where address ilike '%25 Cross Street%' limit 1),
  billing_entity_id = (
    select p.billing_entity_id from public.properties p
    where p.address ilike '%25 Cross Street%' limit 1
  )
where project_name ilike '%25 Cross St%Exterior%';

-- Sanity check — confirms the project now has both fields set, and shows
-- the billing entity name it resolved to.
select
  pr.id, pr.project_name, pr.property_id, pr.billing_entity_id,
  be.company_name as billing_entity_name
from public.projects pr
left join public.billing_entities be on be.id = pr.billing_entity_id
where pr.project_name ilike '%25 Cross St%Exterior%';
