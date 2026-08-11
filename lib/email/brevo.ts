import "server-only";
import nodemailer from "nodemailer";

type BrevoMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
};

export function isBrevoConfigured() {
  return Boolean(
    process.env.BREVO_SMTP_HOST &&
      process.env.BREVO_SMTP_LOGIN &&
      process.env.BREVO_SMTP_KEY &&
      process.env.BREVO_SENDER_EMAIL &&
      process.env.BREVO_SENDER_NAME,
  );
}

function createTransport() {
  const port = Number(process.env.BREVO_SMTP_PORT || "587");
  return nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: {
      user: process.env.BREVO_SMTP_LOGIN,
      pass: process.env.BREVO_SMTP_KEY,
    },
    tls: { minVersion: "TLSv1.2" },
  });
}

export async function sendBrevoEmail(message: BrevoMessage) {
  if (!isBrevoConfigured()) throw new Error("Brevo is not configured");

  await createTransport().sendMail({
    from: {
      name: process.env.BREVO_SENDER_NAME!,
      address: process.env.BREVO_SENDER_EMAIL!,
    },
    to: message.to,
    ...(message.replyTo ? { replyTo: message.replyTo } : {}),
    subject: message.subject,
    text: message.text,
    ...(message.html ? { html: message.html } : {}),
  });
}
