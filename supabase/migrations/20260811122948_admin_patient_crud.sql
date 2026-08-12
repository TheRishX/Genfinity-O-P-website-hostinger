alter table public.intakes
  add column if not exists record_origin text not null default 'patient'
    check (record_origin in ('patient', 'staff')),
  add column if not exists created_by uuid references auth.users(id) on delete set null;

create index if not exists intakes_created_by_idx on public.intakes(created_by);

grant insert, delete on public.patients, public.intakes,
  public.intake_search_tokens, public.office_checklists,
  public.intake_audit_events to authenticated;
grant update (ciphertext, iv, auth_tag, updated_at) on public.patients to authenticated;
grant delete on public.consent_records, public.intake_signatures,
  public.intake_amendments to authenticated;
grant usage, select on sequence public.intake_audit_events_id_seq to authenticated;

drop policy if exists "owner creates patients" on public.patients;
drop policy if exists "owner updates patients" on public.patients;
drop policy if exists "owner deletes patients" on public.patients;
drop policy if exists "owner creates intakes" on public.intakes;
drop policy if exists "owner deletes intakes" on public.intakes;
drop policy if exists "owner creates search tokens" on public.intake_search_tokens;
drop policy if exists "owner deletes search tokens" on public.intake_search_tokens;
drop policy if exists "owner creates checklist" on public.office_checklists;
drop policy if exists "owner deletes checklist" on public.office_checklists;
drop policy if exists "owner deletes consents" on public.consent_records;
drop policy if exists "owner deletes signature records" on public.intake_signatures;
drop policy if exists "owner deletes amendments" on public.intake_amendments;
drop policy if exists "owner deletes audit events" on public.intake_audit_events;
drop policy if exists "owner deletes private intake signatures" on storage.objects;

create policy "owner creates patients" on public.patients
  for insert to authenticated with check ((select private.is_intake_owner()));
create policy "owner updates patients" on public.patients
  for update to authenticated using ((select private.is_intake_owner()))
  with check ((select private.is_intake_owner()));
create policy "owner deletes patients" on public.patients
  for delete to authenticated using ((select private.is_intake_owner()));

create policy "owner creates intakes" on public.intakes
  for insert to authenticated with check (
    (select private.is_intake_owner()) and created_by = (select auth.uid())
  );
create policy "owner deletes intakes" on public.intakes
  for delete to authenticated using ((select private.is_intake_owner()));

create policy "owner creates search tokens" on public.intake_search_tokens
  for insert to authenticated with check ((select private.is_intake_owner()));
create policy "owner deletes search tokens" on public.intake_search_tokens
  for delete to authenticated using ((select private.is_intake_owner()));

create policy "owner creates checklist" on public.office_checklists
  for insert to authenticated with check ((select private.is_intake_owner()));
create policy "owner deletes checklist" on public.office_checklists
  for delete to authenticated using ((select private.is_intake_owner()));
create policy "owner deletes consents" on public.consent_records
  for delete to authenticated using ((select private.is_intake_owner()));
create policy "owner deletes signature records" on public.intake_signatures
  for delete to authenticated using ((select private.is_intake_owner()));
create policy "owner deletes amendments" on public.intake_amendments
  for delete to authenticated using ((select private.is_intake_owner()));
create policy "owner deletes audit events" on public.intake_audit_events
  for delete to authenticated using ((select private.is_intake_owner()));

create policy "owner deletes private intake signatures" on storage.objects
  for delete to authenticated using (
    bucket_id = 'intake-signatures' and (select private.is_intake_owner())
  );
