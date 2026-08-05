-- Deletes the leftover "Overall Project Schedule" placeholder activities
-- that were auto-generated before that feature was removed from the app.
-- These are why you still see them cluttering the Master Schedule and
-- Lookahead prints — the code no longer creates new ones, but the old
-- ones were never cleaned up. Run once in the Supabase SQL Editor.

delete from public.activities where name = 'Overall Project Schedule';

-- Sanity check: should return 0 rows.
select id, project_id, name from public.activities where name = 'Overall Project Schedule';
