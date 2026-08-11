create table if not exists public.owner_password_resets (
  token_hash text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists owner_password_resets_expires_at_idx
  on public.owner_password_resets (expires_at);
create index if not exists owner_password_resets_user_id_idx
  on public.owner_password_resets (user_id);

alter table public.owner_password_resets enable row level security;
revoke all on public.owner_password_resets from anon, authenticated;
grant select, insert, update, delete on public.owner_password_resets to service_role;

comment on table public.owner_password_resets is
  'Hashed, short-lived, single-use owner password recovery tokens. Server access only.';
