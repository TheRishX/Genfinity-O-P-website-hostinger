create policy "no client access to owner password resets"
on public.owner_password_resets
for all
to anon, authenticated
using (false)
with check (false);
