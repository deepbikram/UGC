-- Rejected videos with an admin-written reason the creator can see.
-- Apply in the Supabase dashboard SQL editor (project yglevoopplpwklmurmgv):
-- the app role (portico_app) is not the table owner, so it cannot run DDL.
alter table deliverables drop constraint if exists deliverables_status_check;
alter table deliverables add constraint deliverables_status_check
  check (status in ('queued', 'in_progress', 'review', 'approved', 'rejected'));
alter table deliverables add column if not exists review_note text not null default '';
