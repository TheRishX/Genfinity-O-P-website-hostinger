# Genfinity Patient Intake Setup

The intake is intentionally locked to synthetic test data until the live compliance prerequisites are complete.

## 1. Supabase staging

1. Create a Supabase project and copy `.env.example` to the host's secret configuration.
2. Run `supabase/migrations/202608110001_patient_intake.sql` in the SQL editor or with the Supabase CLI.
3. Create the owner in Supabase Authentication.
4. Add that Auth user's UUID to `public.staff_profiles` with role `owner`.
5. Add two independently generated 32-byte base64 keys for encryption and blind search.
6. Keep `PATIENT_INTAKE_MODE=staging`, `SUPABASE_HIPAA_READY=false`, and `INTAKE_SEND_EMAILS=false`.
7. Test only with synthetic records whose legal names begin with `TEST`.

## 2. Owner access

Set `OWNER_EMAIL` and `NEXT_PUBLIC_OWNER_EMAIL` to the single owner account. The first sign-in enrolls a TOTP authenticator. Database policies require the resulting `aal2` session.

## 3. Live prerequisites

Before using any real patient data:

- Upgrade Supabase to an eligible plan, execute the BAA, enable the HIPAA add-on, and enable High Compliance.
- Enable PITR/backups, SSL enforcement, network restrictions, and the controls required by Supabase's current HIPAA guidance.
- Obtain counsel-approved consent language and the official Notice of Privacy Practices; publish it and set `NPP_VERSION` and `NEXT_PUBLIC_NPP_URL`.
- Review the email provider and notification configuration. Intake emails must contain reference numbers only.
- Complete security, RLS, MFA, PDF, recovery, and incident-response testing.
- Set `SUPABASE_HIPAA_READY=true`, then set both intake mode variables to `live`.

The application refuses live submissions if the server-side compliance flag, encryption/search keys, NPP version, or owner email is missing.
