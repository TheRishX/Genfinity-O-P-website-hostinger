-- Patient care workflow layered onto the encrypted intake archive.
-- Existing patient and intake rows remain the source of truth for legacy records.

create table if not exists public.patient_care_profiles (
  patient_id uuid primary key references public.patients(id) on delete cascade,
  stage text not null default 'new' check (stage in (
    'new','evaluation','paperwork','authorization','fabrication','fitting',
    'delivered','follow-up','on-hold','closed'
  )),
  priority text not null default 'routine' check (priority in ('routine','urgent')),
  next_action text not null default '',
  next_action_at timestamptz,
  email_updates_enabled boolean not null default true,
  last_visit_at timestamptz,
  next_visit_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patient_visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  intake_id uuid references public.intakes(id) on delete set null,
  visit_type text not null check (visit_type in (
    'consultation','evaluation','measurement','casting','fitting','delivery',
    'adjustment','follow-up','repair','other'
  )),
  status text not null default 'scheduled' check (status in (
    'scheduled','completed','cancelled','no-show'
  )),
  scheduled_at timestamptz not null,
  completed_at timestamptz,
  notes text not null default '',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.device_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  intake_id uuid references public.intakes(id) on delete set null,
  device_type text not null check (device_type in (
    'custom-insole','afo','kafo','knee-brace','spinal-orthosis','upper-limb-orthosis',
    'prosthetic-leg','prosthetic-arm','prosthetic-component','repair','other'
  )),
  description text not null default '',
  status text not null default 'ordered' check (status in (
    'quoted','ordered','authorization','fabrication','quality-check','ready','delivered','cancelled'
  )),
  priority text not null default 'routine' check (priority in ('routine','urgent')),
  ordered_at date not null default current_date,
  promised_date date,
  delivered_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.email_templates (
  id text primary key,
  name text not null,
  stage text not null,
  subject text not null,
  body text not null,
  is_urgent boolean not null default false,
  sort_order smallint not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patient_messages (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  template_id text references public.email_templates(id) on delete set null,
  subject text not null,
  ciphertext text not null,
  iv text not null,
  auth_tag text not null,
  delivery_status text not null default 'queued' check (delivery_status in ('queued','sent','failed')),
  error_message text,
  sent_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.staff_notification_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  automatic_urgent_updates boolean not null default true,
  automatic_delivery_updates boolean not null default true,
  appointment_reminders boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists patient_care_stage_action_idx
  on public.patient_care_profiles(stage, next_action_at) where stage <> 'closed';
create index if not exists patient_visits_patient_date_idx
  on public.patient_visits(patient_id, scheduled_at desc);
create index if not exists patient_visits_upcoming_idx
  on public.patient_visits(scheduled_at) where status = 'scheduled';
create index if not exists device_orders_patient_created_idx
  on public.device_orders(patient_id, created_at desc);
create index if not exists device_orders_due_idx
  on public.device_orders(promised_date, status) where status not in ('delivered','cancelled');
create index if not exists patient_messages_patient_created_idx
  on public.patient_messages(patient_id, created_at desc);

alter table public.patient_care_profiles enable row level security;
alter table public.patient_visits enable row level security;
alter table public.device_orders enable row level security;
alter table public.email_templates enable row level security;
alter table public.patient_messages enable row level security;
alter table public.staff_notification_settings enable row level security;

revoke all on public.patient_care_profiles, public.patient_visits,
  public.device_orders, public.email_templates, public.patient_messages,
  public.staff_notification_settings from anon, authenticated;

grant select, insert, update, delete on public.patient_care_profiles,
  public.patient_visits, public.device_orders, public.patient_messages,
  public.staff_notification_settings to authenticated;
grant select on public.email_templates to authenticated;

grant select, insert, update, delete on public.patient_care_profiles,
  public.patient_visits, public.device_orders, public.email_templates,
  public.patient_messages, public.staff_notification_settings to service_role;

create policy "owner manages patient care profiles" on public.patient_care_profiles
  for all to authenticated using ((select private.is_intake_owner()))
  with check ((select private.is_intake_owner()));
create policy "owner manages patient visits" on public.patient_visits
  for all to authenticated using ((select private.is_intake_owner()))
  with check ((select private.is_intake_owner()));
create policy "owner manages device orders" on public.device_orders
  for all to authenticated using ((select private.is_intake_owner()))
  with check ((select private.is_intake_owner()));
create policy "owner reads email templates" on public.email_templates
  for select to authenticated using ((select private.is_intake_owner()));
create policy "owner manages patient messages" on public.patient_messages
  for all to authenticated using ((select private.is_intake_owner()))
  with check ((select private.is_intake_owner()));
create policy "owner manages own notification settings" on public.staff_notification_settings
  for all to authenticated
  using ((select private.is_intake_owner()) and user_id = (select auth.uid()))
  with check ((select private.is_intake_owner()) and user_id = (select auth.uid()));

insert into public.patient_care_profiles (patient_id, stage, next_action, next_action_at)
select p.id,
  case latest.status
    when 'complete' then 'delivered'
    when 'in-review' then 'evaluation'
    when 'archived' then 'closed'
    else 'new'
  end,
  case latest.status
    when 'complete' then 'Schedule a follow-up'
    when 'in-review' then 'Continue clinical review'
    when 'archived' then ''
    else 'Review new patient record'
  end,
  case when latest.status = 'archived' then null else now() end
from public.patients p
left join lateral (
  select i.status from public.intakes i
  where i.patient_id = p.id order by i.submitted_at desc limit 1
) latest on true
on conflict (patient_id) do nothing;

insert into public.email_templates (id, name, stage, subject, body, is_urgent, sort_order) values
  ('welcome', 'Welcome to Genfinity', 'new', 'Welcome to Genfinity O&P', 'Hi {{first_name}},\n\nWe received your information. Our care team will review it and contact you with the next step.\n\nGenfinity O&P', false, 10),
  ('appointment', 'Appointment confirmation', 'evaluation', 'Your Genfinity O&P appointment', 'Hi {{first_name}},\n\nYour appointment is scheduled for {{appointment_date}}. Please contact us if you need to make a change.\n\nGenfinity O&P', false, 20),
  ('documents', 'Documents needed', 'paperwork', 'A few documents are needed', 'Hi {{first_name}},\n\nTo keep your care moving, please send or bring: {{next_action}}.\n\nGenfinity O&P', false, 30),
  ('authorization', 'Insurance authorization update', 'authorization', 'Update about your device authorization', 'Hi {{first_name}},\n\nWe are working with your insurance provider on authorization. We will let you know as soon as the status changes.\n\nGenfinity O&P', false, 40),
  ('fabrication', 'Device is being made', 'fabrication', 'Your custom device is in fabrication', 'Hi {{first_name}},\n\nYour {{device_type}} is now being made. The current expected date is {{delivery_date}}.\n\nGenfinity O&P', false, 50),
  ('ready', 'Device ready', 'fitting', 'Your device is ready for the next step', 'Hi {{first_name}},\n\nYour {{device_type}} is ready. Please contact us to arrange your fitting or delivery visit.\n\nGenfinity O&P', false, 60),
  ('delivered', 'Delivery and care instructions', 'delivered', 'Your device delivery update', 'Hi {{first_name}},\n\nYour device has been marked delivered. Please follow the care instructions from your clinician and contact us if anything feels uncomfortable.\n\nGenfinity O&P', false, 70),
  ('urgent', 'Urgent care update', 'any', 'Important update from Genfinity O&P', 'Hi {{first_name}},\n\nWe have an important update about your care: {{next_action}}. Please contact our office as soon as you can.\n\nGenfinity O&P', true, 80),
  ('follow-up', 'Follow-up reminder', 'follow-up', 'Time for your Genfinity O&P follow-up', 'Hi {{first_name}},\n\nIt is time to check the fit and comfort of your device. Please contact us to schedule a follow-up.\n\nGenfinity O&P', false, 90)
on conflict (id) do update set
  name = excluded.name,
  stage = excluded.stage,
  subject = excluded.subject,
  body = excluded.body,
  is_urgent = excluded.is_urgent,
  sort_order = excluded.sort_order,
  active = true,
  updated_at = now();

comment on table public.patient_care_profiles is 'Operational care status for every legacy and new patient.';
comment on table public.patient_messages is 'Encrypted copies of patient email messages and delivery outcome.';
