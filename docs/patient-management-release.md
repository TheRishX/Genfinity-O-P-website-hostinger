# Patient management release checklist

The staff workspace is available at `/staff/intakes`. Existing encrypted patient
and intake rows are retained; the care-management migration adds operational
status, visits, device orders, message history, templates, and notification
preferences around those records.

## 1. Apply the database migration

The Hostinger MySQL schema must be installed by an authorized operator before
the application is enabled. Run `mysql` with the contents of
`scripts/hostinger-schema.sql` against the Hostinger database.

```bash
mysql -h "$MYSQL_HOST" -u "$MYSQL_USER" -p "$MYSQL_DATABASE" < scripts/hostinger-schema.sql
```

The Hostinger schema preserves the application encryption boundary and gives the
owner session layer access only through server-side routes.

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
- Confirm Hostinger backups, audit retention, and staff offboarding procedures
  with the site owner.
- Run `npm run lint`, `npx tsc --noEmit`, and `npm run build` before deployment.

## 4. Safe release order

1. Back up the production database.
2. Apply the migration.
3. Deploy the application.
4. Complete the test-patient smoke test.
5. Enable `CARE_EMAILS_ENABLED` only after email delivery is approved.
