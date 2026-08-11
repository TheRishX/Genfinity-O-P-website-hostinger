# Genfinity Patient Intake Setup

The intake accepts real patients only. Submission and draft storage stay locked until all secure live-environment prerequisites are configured.

## 1. Supabase project

1. Use project `xpeyatekdkwlfaoflczl` and copy `.env.example` to the host's secret configuration.
2. The intake schema and hardening migrations have been applied. Keep both files in `supabase/migrations` as the source-controlled schema history.
3. Create the owner in Supabase Authentication.
4. Add that Auth user's UUID to `public.staff_profiles` with role `owner`.
5. Add two independently generated 32-byte base64 keys for encryption and blind search.
6. Add a server-only Supabase secret key as `SUPABASE_SECRET_KEY`.
7. Keep `SUPABASE_HIPAA_READY=false` and `INTAKE_SEND_EMAILS=false` until compliance and security acceptance are complete.

## 2. Owner access

Set `OWNER_EMAIL` and `NEXT_PUBLIC_OWNER_EMAIL` to the single owner account. The portal accepts only that authenticated email address.

## 3. Live prerequisites

Before using any real patient data:

- Upgrade Supabase to an eligible plan, execute the BAA, enable the HIPAA add-on, and enable High Compliance.
- Enable PITR/backups, SSL enforcement, network restrictions, and the controls required by Supabase's current HIPAA guidance.
- Obtain counsel-approved consent language and the official Notice of Privacy Practices; publish it and set `NPP_VERSION` and `NEXT_PUBLIC_NPP_URL`.
- Review the email provider and notification configuration. Intake emails must contain reference numbers only.
- Complete security, RLS, PDF, account-recovery, and incident-response testing.
- Set `PATIENT_INTAKE_MODE=live` and `SUPABASE_HIPAA_READY=true` only after the requirements above are complete.

The application refuses live submissions if the server-side compliance flag, encryption/search keys, NPP version, or owner email is missing.
