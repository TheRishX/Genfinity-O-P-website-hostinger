drop policy if exists "owner can read own staff profile" on public.staff_profiles;
create policy "owner can read own staff profile" on public.staff_profiles
  for select to authenticated
  using (user_id = (select auth.uid()));

create or replace function private.is_intake_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.staff_profiles
    where user_id = (select auth.uid()) and role = 'owner'
  );
$$;

revoke all on function private.is_intake_owner() from public, anon, authenticated, service_role;
grant execute on function private.is_intake_owner() to authenticated;
