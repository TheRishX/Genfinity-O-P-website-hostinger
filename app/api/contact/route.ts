import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.error("Contact form is missing RESEND_API_KEY.");
      return NextResponse.json(
        {
          error: "The contact form is temporarily unavailable. Please call us.",
        },
        { status: 503 },
      );
    }

    const payload = await request.json();
    const first = clean(payload.first, 80);
    const last = clean(payload.last, 80);
    const phone = clean(payload.phone, 40);
    const email = clean(payload.email, 254).toLowerCase();
    const message = clean(payload.message, 3000);
    const website = clean(payload.website, 200);

    // Bots commonly fill this field; people never see it.
    if (website) {
      return NextResponse.json({ ok: true });
    }

    if (!first || !last || !phone || !emailPattern.test(email) || !message) {
      return NextResponse.json(
        {
          error: "Please complete every field with valid contact information.",
        },
        { status: 400 },
      );
    }

    const resend = new Resend(apiKey);
    const recipient =
      process.env.CONTACT_TO_EMAIL || "support@genfinityoandp.com";
    const sender =
      process.env.CONTACT_FROM_EMAIL ||
      "Genfinity Website <website@genfinityoandp.com>";
    const fullName = `${first} ${last}`;

    const { error } = await resend.emails.send({
      from: sender,
      to: recipient,
      replyTo: email,
      subject: `New consultation request from ${fullName}`,
      text: [
        "New website consultation request",
        "",
        `Name: ${fullName}`,
        `Phone: ${phone}`,
        `Email: ${email}`,
        "",
        "What they would like help with:",
        message,
        "",
        "Submitted from genfinityoandp.com",
      ].join("\n"),
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#172033;max-width:640px">
          <p style="color:#AF201F;font-weight:700;text-transform:uppercase;letter-spacing:.08em">New website consultation request</p>
          <h1 style="font-size:24px;margin:8px 0 24px">${escapeHtml(fullName)}</h1>
          <table style="border-collapse:collapse;width:100%;margin-bottom:24px">
            <tr><td style="padding:8px 12px;background:#f6f7f8;font-weight:700">Phone</td><td style="padding:8px 12px">${escapeHtml(phone)}</td></tr>
            <tr><td style="padding:8px 12px;background:#f6f7f8;font-weight:700">Email</td><td style="padding:8px 12px">${escapeHtml(email)}</td></tr>
          </table>
          <h2 style="font-size:17px">What they would like help with</h2>
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:28px 0 16px">
          <p style="font-size:12px;color:#667085">Submitted from genfinityoandp.com. Replying to this email will reply directly to ${escapeHtml(fullName)}.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend contact-form error:", error);
      return NextResponse.json(
        { error: "We could not send your request. Please call us instead." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact-form error:", error);
    return NextResponse.json(
      { error: "We could not send your request. Please call us instead." },
      { status: 500 },
    );
  }
}
