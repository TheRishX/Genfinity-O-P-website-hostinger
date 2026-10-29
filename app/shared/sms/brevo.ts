// Transactional SMS through Brevo (https://developers.brevo.com/docs/transactional-sms-endpoints).
// Off unless SMS_ENABLED="true" and the Brevo API key and SMS sender are set on the server.
import "server-only";

const BREVO_SMS_URL = "https://api.brevo.com/v3/transactionalSMS/send";

type BrevoSms = {
  to: string;
  content: string;
  tag?: string;
};

export function isSmsConfigured() {
  return Boolean(
    process.env.SMS_ENABLED === "true" &&
      process.env.BREVO_API_KEY &&
      process.env.BREVO_SMS_SENDER,
  );
}

// Brevo wants the number with its country code and digits only. Ten-digit numbers are
// treated as US numbers; anything that is not a plausible number returns null.
export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}

export async function sendBrevoSms(message: BrevoSms) {
  if (!isSmsConfigured()) throw new Error("SMS is not configured");
  const recipient = normalizePhone(message.to);
  if (!recipient) throw new Error("Invalid mobile number");

  const response = await fetch(BREVO_SMS_URL, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY!,
    },
    body: JSON.stringify({
      sender: process.env.BREVO_SMS_SENDER,
      recipient,
      // Keep opt-out words out of the text: Brevo would re-classify the message as marketing.
      content: message.content.slice(0, 640),
      type: "transactional",
      ...(message.tag ? { tag: message.tag } : {}),
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 300);
    throw new Error(`Brevo SMS failed (${response.status}) ${detail}`.trim());
  }
}
