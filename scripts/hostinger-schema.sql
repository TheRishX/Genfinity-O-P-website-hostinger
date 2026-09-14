CREATE TABLE IF NOT EXISTS staff_users (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  password_reset_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);
CREATE TABLE IF NOT EXISTS staff_sessions (
  id CHAR(64) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  expires_at DATETIME(6) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX staff_sessions_user_idx (user_id), INDEX staff_sessions_expiry_idx (expires_at)
);
CREATE TABLE IF NOT EXISTS staff_profiles (user_id CHAR(36) PRIMARY KEY, role VARCHAR(20) NOT NULL DEFAULT 'owner', created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6));
CREATE TABLE IF NOT EXISTS intake_drafts (id CHAR(36) PRIMARY KEY, secret_hash CHAR(64) NOT NULL UNIQUE, ciphertext TEXT NOT NULL, iv VARCHAR(255) NOT NULL, auth_tag VARCHAR(255) NOT NULL, current_step SMALLINT NOT NULL DEFAULT 0, expires_at DATETIME(6) NOT NULL, created_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL, INDEX intake_drafts_expiry_idx (expires_at));
CREATE TABLE IF NOT EXISTS patients (id CHAR(36) PRIMARY KEY, ciphertext TEXT NOT NULL, iv VARCHAR(255) NOT NULL, auth_tag VARCHAR(255) NOT NULL, created_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL);
CREATE TABLE IF NOT EXISTS intakes (id CHAR(36) PRIMARY KEY, patient_id CHAR(36) NOT NULL, reference_number VARCHAR(80) NOT NULL UNIQUE, status VARCHAR(20) NOT NULL DEFAULT 'new', ciphertext TEXT NOT NULL, iv VARCHAR(255) NOT NULL, auth_tag VARCHAR(255) NOT NULL, packet_version VARCHAR(80) NOT NULL, signed_snapshot_hash CHAR(64) NOT NULL, submitted_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL, record_origin VARCHAR(20) NOT NULL DEFAULT 'patient', created_by CHAR(36) NULL, INDEX intakes_patient_idx (patient_id), INDEX intakes_status_idx (status, submitted_at));
CREATE TABLE IF NOT EXISTS intake_search_tokens (patient_id CHAR(36) NOT NULL, field VARCHAR(30) NOT NULL, token_hash CHAR(64) NOT NULL, PRIMARY KEY (patient_id, field, token_hash), INDEX token_hash_idx (token_hash));
CREATE TABLE IF NOT EXISTS consent_records (id CHAR(36) PRIMARY KEY, intake_id CHAR(36) NOT NULL, consent_type VARCHAR(20) NOT NULL, packet_version VARCHAR(80) NOT NULL, text_hash CHAR(64) NOT NULL, accepted_at DATETIME(6) NOT NULL, signer_relationship VARCHAR(80) NOT NULL, signature_mode VARCHAR(30) NOT NULL, ip_hash CHAR(64) NOT NULL, user_agent VARCHAR(300) NOT NULL, UNIQUE KEY consent_unique (intake_id, consent_type));
CREATE TABLE IF NOT EXISTS intake_submission_keys (key_hash CHAR(64) PRIMARY KEY, reference_number VARCHAR(80) NULL, created_at DATETIME(6) NOT NULL, expires_at DATETIME(6) NOT NULL);
CREATE TABLE IF NOT EXISTS intake_signatures (intake_id CHAR(36) PRIMARY KEY, storage_path VARCHAR(500) NOT NULL, created_at DATETIME(6) NOT NULL);
CREATE TABLE IF NOT EXISTS office_checklists (intake_id CHAR(36) PRIMARY KEY, checklist JSON NOT NULL, clinician_notes TEXT NOT NULL, ssn_last_four CHAR(4) NULL, updated_at DATETIME(6) NOT NULL);
CREATE TABLE IF NOT EXISTS intake_amendments (id CHAR(36) PRIMARY KEY, intake_id CHAR(36) NOT NULL, ciphertext TEXT NOT NULL, iv VARCHAR(255) NOT NULL, auth_tag VARCHAR(255) NOT NULL, reason VARCHAR(500) NOT NULL, changed_fields JSON NOT NULL, created_by CHAR(36) NOT NULL, created_at DATETIME(6) NOT NULL, INDEX amendments_intake_idx (intake_id));
CREATE TABLE IF NOT EXISTS intake_audit_events (id BIGINT AUTO_INCREMENT PRIMARY KEY, intake_id CHAR(36) NULL, actor_id CHAR(36) NULL, action VARCHAR(100) NOT NULL, changed_fields JSON NOT NULL, created_at DATETIME(6) NOT NULL, INDEX audit_intake_idx (intake_id));
CREATE TABLE IF NOT EXISTS owner_password_resets (token_hash CHAR(64) PRIMARY KEY, user_id CHAR(36) NOT NULL, expires_at DATETIME(6) NOT NULL, used_at DATETIME(6) NULL, created_at DATETIME(6) NOT NULL, INDEX reset_expiry_idx (expires_at), INDEX reset_user_idx (user_id));
CREATE TABLE IF NOT EXISTS patient_care_profiles (patient_id CHAR(36) PRIMARY KEY, stage VARCHAR(30) NOT NULL DEFAULT 'new', priority VARCHAR(20) NOT NULL DEFAULT 'routine', next_action VARCHAR(500) NOT NULL DEFAULT '', next_action_at DATETIME(6) NULL, email_updates_enabled BOOLEAN NOT NULL DEFAULT TRUE, last_visit_at DATETIME(6) NULL, next_visit_at DATETIME(6) NULL, created_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL);
CREATE TABLE IF NOT EXISTS patient_visits (id CHAR(36) PRIMARY KEY, patient_id CHAR(36) NOT NULL, intake_id CHAR(36) NULL, visit_type VARCHAR(30) NOT NULL, status VARCHAR(20) NOT NULL DEFAULT 'scheduled', scheduled_at DATETIME(6) NOT NULL, completed_at DATETIME(6) NULL, notes TEXT NOT NULL, created_by CHAR(36) NULL, created_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL, INDEX visits_patient_idx (patient_id, scheduled_at));
CREATE TABLE IF NOT EXISTS device_orders (id CHAR(36) PRIMARY KEY, patient_id CHAR(36) NOT NULL, intake_id CHAR(36) NULL, device_type VARCHAR(40) NOT NULL, description TEXT NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'ordered', priority VARCHAR(20) NOT NULL DEFAULT 'routine', ordered_at DATE NOT NULL, promised_date DATE NULL, delivered_at DATETIME(6) NULL, created_by CHAR(36) NULL, created_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL, INDEX orders_patient_idx (patient_id, created_at));
CREATE TABLE IF NOT EXISTS email_templates (id VARCHAR(80) PRIMARY KEY, name VARCHAR(160) NOT NULL, stage VARCHAR(40) NOT NULL, subject VARCHAR(200) NOT NULL, body TEXT NOT NULL, is_urgent BOOLEAN NOT NULL DEFAULT FALSE, sort_order SMALLINT NOT NULL DEFAULT 0, active BOOLEAN NOT NULL DEFAULT TRUE, created_at DATETIME(6) NOT NULL, updated_at DATETIME(6) NOT NULL);
CREATE TABLE IF NOT EXISTS patient_messages (id CHAR(36) PRIMARY KEY, patient_id CHAR(36) NOT NULL, template_id VARCHAR(80) NULL, subject VARCHAR(200) NOT NULL, ciphertext TEXT NOT NULL, iv VARCHAR(255) NOT NULL, auth_tag VARCHAR(255) NOT NULL, delivery_status VARCHAR(20) NOT NULL DEFAULT 'queued', error_message VARCHAR(500) NULL, sent_at DATETIME(6) NULL, created_by CHAR(36) NULL, created_at DATETIME(6) NOT NULL, INDEX messages_patient_idx (patient_id, created_at));
CREATE TABLE IF NOT EXISTS staff_notification_settings (user_id CHAR(36) PRIMARY KEY, automatic_urgent_updates BOOLEAN NOT NULL DEFAULT TRUE, automatic_delivery_updates BOOLEAN NOT NULL DEFAULT TRUE, appointment_reminders BOOLEAN NOT NULL DEFAULT FALSE, updated_at DATETIME(6) NOT NULL);
