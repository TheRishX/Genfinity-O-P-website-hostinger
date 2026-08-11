create or replace function private.provision_genfinity_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if lower(coalesce(new.email, '')) = 'genfinityoandp@gmail.com' then
    insert into public.staff_profiles (user_id, role)
    values (new.id, 'owner')
    on conflict (user_id) do update set role = excluded.role;
  end if;
  return new;
end;
$$;

revoke all on function private.provision_genfinity_owner() from public, anon, authenticated;

drop trigger if exists provision_genfinity_owner_after_auth_user on auth.users;
create trigger provision_genfinity_owner_after_auth_user
after insert or update of email on auth.users
for each row execute function private.provision_genfinity_owner();

insert into public.staff_profiles (user_id, role)
select id, 'owner'
from auth.users
where lower(email) = 'genfinityoandp@gmail.com'
on conflict (user_id) do update set role = excluded.role;
