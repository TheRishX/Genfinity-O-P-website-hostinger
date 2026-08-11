create extension if not exists pgcrypto with schema extensions;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner')),
  created_at timestamptz not null default now()
);

create table if not exists public.intake_drafts (
  id uuid primary key default gen_random_uuid(),
  secret_hash text not null unique,
  ciphertext text not null,
  iv text not null,
  auth_tag text not null,
  current_step smallint not null default 0 check (current_step between 0 and 6),
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  ciphertext text not null,
  iv text not null,
  auth_tag text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.intakes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  reference_number text not null unique,
  status text not null default 'new' check (status in ('new','in-review','complete','archived')),
  ciphertext text not null,
  iv text not null,
  auth_tag text not null,
  packet_version text not null,
  signed_snapshot_hash text not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.intake_search_tokens (
  patient_id uuid not null references public.patients(id) on delete cascade,
  field text not null,
  token_hash text not null,
  primary key (patient_id, field, token_hash)
);
create index if not exists intake_search_token_hash_idx on public.intake_search_tokens(token_hash);
create index if not exists intakes_patient_id_idx on public.intakes(patient_id);
create index if not exists intakes_status_submitted_at_idx on public.intakes(status, submitted_at desc);

create table if not exists public.consent_records (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references public.intakes(id) on delete restrict,
  consent_type text not null check (consent_type in ('benefits','care','privacy')),
  packet_version text not null,
  text_hash text not null,
  accepted_at timestamptz not null,
  signer_relationship text not null,
  signature_mode text not null check (signature_mode in ('drawn','typed-accessible')),
  ip_hash text not null,
  user_agent text not null,
  unique (intake_id, consent_type)
);

create table if not exists public.intake_submission_keys (
  key_hash text primary key,
  reference_number text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create table if not exists public.intake_signatures (
  intake_id uuid primary key references public.intakes(id) on delete restrict,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.office_checklists (
  intake_id uuid primary key references public.intakes(id) on delete cascade,
  checklist jsonb not null default '{}'::jsonb,
  clinician_notes text not null default '',
  ssn_last_four text check (ssn_last_four is null or ssn_last_four ~ '^\d{4}$'),
  updated_at timestamptz not null default now()
);

create table if not exists public.intake_amendments (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references public.intakes(id) on delete restrict,
  ciphertext text not null,
  iv text not null,
  auth_tag text not null,
  reason text not null,
  changed_fields text[] not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.intake_audit_events (
  id bigint generated always as identity primary key,
  intake_id uuid references public.intakes(id) on delete restrict,
  actor_id uuid references auth.users(id),
  action text not null,
  changed_fields text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists intake_drafts_expires_at_idx on public.intake_drafts(expires_at);
create index if not exists intake_submission_keys_expires_at_idx on public.intake_submission_keys(expires_at);
create index if not exists intake_amendments_intake_id_idx on public.intake_amendments(intake_id);
create index if not exists intake_amendments_created_by_idx on public.intake_amendments(created_by);
create index if not exists intake_audit_events_intake_id_idx on public.intake_audit_events(intake_id);
create index if not exists intake_audit_events_actor_id_idx on public.intake_audit_events(actor_id);

alter table public.staff_profiles enable row level security;
alter table public.intake_drafts enable row level security;
alter table public.patients enable row level security;
alter table public.intakes enable row level security;
alter table public.intake_search_tokens enable row level security;
alter table public.consent_records enable row level security;
alter table public.intake_submission_keys enable row level security;
alter table public.intake_signatures enable row level security;
alter table public.office_checklists enable row level security;
alter table public.intake_amendments enable row level security;
alter table public.intake_audit_events enable row level security;

revoke all on public.staff_profiles, public.intake_drafts, public.patients,
  public.intakes, public.intake_search_tokens, public.consent_records,
  public.intake_submission_keys, public.intake_signatures,
  public.office_checklists, public.intake_amendments,
  public.intake_audit_events from anon, authenticated;

grant select on public.staff_profiles to authenticated;
grant select on public.patients, public.intakes, public.office_checklists to authenticated;
grant update (status, updated_at) on public.intakes to authenticated;
grant update (checklist, clinician_notes, ssn_last_four, updated_at) on public.office_checklists to authenticated;
grant select on public.intake_search_tokens, public.consent_records, public.intake_signatures, public.intake_amendments, public.intake_audit_events to authenticated;
grant insert on public.intake_amendments, public.intake_audit_events to authenticated;

grant select, insert, update, delete on public.staff_profiles,
  public.intake_drafts, public.patients, public.intakes,
  public.intake_search_tokens, public.consent_records,
  public.intake_submission_keys, public.intake_signatures,
  public.office_checklists, public.intake_amendments,
  public.intake_audit_events to service_role;
grant usage, select on sequence public.intake_audit_events_id_seq to service_role;

create policy "owner can read own staff profile" on public.staff_profiles
  for select to authenticated using (user_id = (select auth.uid()) and (select auth.jwt())->>'aal' = 'aal2');

create or replace function private.is_intake_owner()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff_profiles
    where user_id = (select auth.uid()) and role = 'owner'
  ) and (select auth.jwt())->>'aal' = 'aal2';
$$;
revoke all on function private.is_intake_owner() from public, anon, authenticated, service_role;
grant execute on function private.is_intake_owner() to authenticated;

create policy "owner reads patients" on public.patients for select to authenticated using ((select private.is_intake_owner()));
create policy "owner reads intakes" on public.intakes for select to authenticated using ((select private.is_intake_owner()));
create policy "owner updates intake status" on public.intakes for update to authenticated using ((select private.is_intake_owner())) with check ((select private.is_intake_owner()));
create policy "owner reads search tokens" on public.intake_search_tokens for select to authenticated using ((select private.is_intake_owner()));
create policy "owner reads consents" on public.consent_records for select to authenticated using ((select private.is_intake_owner()));
create policy "owner reads signature records" on public.intake_signatures for select to authenticated using ((select private.is_intake_owner()));
create policy "owner manages checklist" on public.office_checklists for select to authenticated using ((select private.is_intake_owner()));
create policy "owner updates checklist" on public.office_checklists for update to authenticated using ((select private.is_intake_owner())) with check ((select private.is_intake_owner()));
create policy "owner reads amendments" on public.intake_amendments for select to authenticated using ((select private.is_intake_owner()));
create policy "owner adds amendments" on public.intake_amendments for insert to authenticated with check ((select private.is_intake_owner()) and created_by = (select auth.uid()));
create policy "owner reads audit" on public.intake_audit_events for select to authenticated using ((select private.is_intake_owner()));
create policy "owner adds audit" on public.intake_audit_events for insert to authenticated with check ((select private.is_intake_owner()) and actor_id = (select auth.uid()));

create policy "no client access to drafts" on public.intake_drafts
  for all to anon, authenticated using (false) with check (false);
create policy "no client access to submission keys" on public.intake_submission_keys
  for all to anon, authenticated using (false) with check (false);

insert into storage.buckets (id, name, public)
values ('intake-signatures', 'intake-signatures', false)
on conflict (id) do update set public = false;

create policy "owner reads private intake signatures" on storage.objects
  for select to authenticated using (bucket_id = 'intake-signatures' and (select private.is_intake_owner()));

comment on table public.intake_drafts is 'Encrypted patient intake drafts. Public clients never query this table directly.';
comment on table public.intakes is 'Immutable encrypted intake snapshots; corrections are stored as amendments.';
