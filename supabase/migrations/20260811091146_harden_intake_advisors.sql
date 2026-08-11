drop policy if exists "owner can read own staff profile" on public.staff_profiles;
create policy "owner can read own staff profile" on public.staff_profiles
  for select to authenticated
  using (user_id = (select auth.uid()) and (select auth.jwt())->>'aal' = 'aal2');

create or replace function private.is_intake_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff_profiles
    where user_id = (select auth.uid()) and role = 'owner'
  ) and (select auth.jwt())->>'aal' = 'aal2';
$$;
revoke all on function private.is_intake_owner() from public, anon, authenticated, service_role;
grant execute on function private.is_intake_owner() to authenticated;

create index if not exists intake_amendments_created_by_idx
  on public.intake_amendments(created_by);

create policy "no client access to drafts" on public.intake_drafts
  for all to anon, authenticated using (false) with check (false);
create policy "no client access to submission keys" on public.intake_submission_keys
  for all to anon, authenticated using (false) with check (false);
