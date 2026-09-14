# Genfinity Patient Intake Setup

The intake accepts real patients only. Submission and draft storage stay locked until all secure live-environment prerequisites are configured.

## 1. Hostinger database and storage

1. Install `scripts/hostinger-schema.sql` in the Hostinger MySQL database.
2. Set `HOSTINGER_STORAGE_PATH` to a private directory outside the public web root.
3. Provision the owner account with the migration utility or secure reset flow.
4. Add two independently generated 32-byte base64 keys for encryption and blind search.
5. Keep `HOSTINGER_PHI_APPROVED=false` and `INTAKE_SEND_EMAILS=false` until compliance and security acceptance are complete.

## 2. Owner access

Set `OWNER_EMAIL` and `NEXT_PUBLIC_OWNER_EMAIL` to the single owner account. The portal accepts only that authenticated email address.

## 3. Live prerequisites

Before using any real patient data:

- Obtain written approval that the selected Hostinger environment is appropriate for the data handled by this application.
- Enable Hostinger backups, SSL enforcement, private storage, access controls, and incident-response procedures.
- Obtain counsel-approved consent language and the official Notice of Privacy Practices; publish it and set `NPP_VERSION` and `NEXT_PUBLIC_NPP_URL`.
- Review the email provider and notification configuration. Intake emails must contain reference numbers only.
- Complete security, database access-control, PDF, account-recovery, and incident-response testing.
- Set `PATIENT_INTAKE_MODE=live` and `HOSTINGER_PHI_APPROVED=true` only after the requirements above are complete.

The application refuses live submissions if the server-side compliance flag, encryption/search keys, NPP version, or owner email is missing.
