# Patient management release checklist

The staff workspace is available at `/staff/intakes`. Existing encrypted patient
and intake rows are retained; the care-management migration adds operational
status, visits, device orders, message history, templates, and notification
preferences around those records.

## 1. Apply the database migration

The repository must be linked to the intended Supabase project by an authorized
operator. This machine does not currently have a linked project or database
password, so the migration was intentionally not pushed from the development
session.

```bash
npx supabase@latest link --project-ref YOUR_PROJECT_REF
npx supabase@latest db push --dry-run --linked
npx supabase@latest db push --linked
npx supabase@latest migration list
```

Review and apply
`supabase/migrations/20260821054531_patient_care_management.sql`. It enables RLS,
grants only authenticated owner access, adds indexes for the dashboard queries,
backfills every old patient, and installs the default stage-based email templates.

## 2. Configure patient email safely

Set the existing `BREVO_SMTP_*` variables, then enable `CARE_EMAILS_ENABLED=true`
only after the SMTP provider and account are approved for patient communications.
The switch is separate from contact-form email so a normal website deployment
cannot accidentally start sending patient messages.

The built-in templates deliberately avoid diagnosis and insurance details. Keep
custom email content similarly minimal unless the organization has completed its
privacy, consent, BAA, retention, and breach-response review. Patients can opt out
of automatic care emails per record.

## 3. Production checks

- Confirm the owner can sign in and all legacy patients appear in search.
- Create a test patient, visit, and device order.
- Move a test device to `ready` and verify the automatic email outcome.
- Confirm a failed delivery is visible in message history and does not roll back
  the care-status change.
- Test the staff workspace at 320px, tablet, and desktop widths.
- Confirm production backups, point-in-time recovery, audit retention, and staff
  offboarding procedures with the Supabase project owner.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before deployment.

## 4. Safe release order

1. Back up the production database.
2. Apply the migration.
3. Deploy the application.
4. Complete the test-patient smoke test.
5. Enable `CARE_EMAILS_ENABLED` only after email delivery is approved.

