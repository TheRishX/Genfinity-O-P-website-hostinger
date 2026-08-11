import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import type { IntakeData } from "./schema";
import { CONSENTS } from "./consents";

const navy = rgb(0.09, 0.25, 0.45);
const red = rgb(0.69, 0.13, 0.12);
const ink = rgb(0.08, 0.1, 0.16);
const muted = rgb(0.35, 0.4, 0.49);
const line = rgb(0.86, 0.89, 0.92);

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const lines: string[] = [];
  for (const paragraph of String(text || "Not provided").split("\n")) {
    let current = "";
    for (const word of paragraph.split(/\s+/)) {
      const candidate = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > width && current) {
        lines.push(current);
        current = word;
      } else current = candidate;
    }
    lines.push(current || " ");
  }
  return lines;
}

function header(
  page: PDFPage,
  bold: PDFFont,
  regular: PDFFont,
  title: string,
  reference: string,
  pageNumber: number,
) {
  const { width, height } = page.getSize();
  page.drawRectangle({ x: 0, y: height - 82, width, height: 82, color: navy });
  page.drawText("GENFINITY O&P LLC", {
    x: 42,
    y: height - 38,
    size: 18,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(
    "18401 Burbank Blvd Ste 215, Tarzana, CA 91356  |  (888) 552-6188",
    {
      x: 42,
      y: height - 57,
      size: 8.5,
      font: regular,
      color: rgb(0.9, 0.94, 1),
    },
  );
  page.drawText(title, {
    x: 42,
    y: height - 106,
    size: 15,
    font: bold,
    color: ink,
  });
  page.drawText(`Reference ${reference}`, {
    x: width - 160,
    y: height - 103,
    size: 8.5,
    font: regular,
    color: muted,
  });
  page.drawText(`Page ${pageNumber} of 5`, {
    x: width - 92,
    y: 28,
    size: 8,
    font: regular,
    color: muted,
  });
  return height - 132;
}

function section(page: PDFPage, bold: PDFFont, title: string, y: number) {
  page.drawRectangle({
    x: 42,
    y: y - 24,
    width: 528,
    height: 24,
    color: rgb(0.94, 0.96, 0.98),
    borderColor: line,
    borderWidth: 0.6,
  });
  page.drawText(title, { x: 52, y: y - 17, size: 10, font: bold, color: navy });
  return y - 38;
}

function field(
  page: PDFPage,
  regular: PDFFont,
  bold: PDFFont,
  label: string,
  value: unknown,
  y: number,
  width = 528,
) {
  page.drawText(label.toUpperCase(), {
    x: 48,
    y,
    size: 7.2,
    font: bold,
    color: red,
  });
  const valueLines = wrap(
    Array.isArray(value) ? value.join(", ") : String(value || "Not provided"),
    regular,
    9.2,
    width - 10,
  );
  let next = y - 14;
  valueLines.forEach((text) => {
    page.drawText(text, {
      x: 48,
      y: next,
      size: 9.2,
      font: regular,
      color: ink,
    });
    next -= 12;
  });
  page.drawLine({
    start: { x: 48, y: next + 5 },
    end: { x: 570, y: next + 5 },
    color: line,
    thickness: 0.5,
  });
  return next - 6;
}

function paragraph(
  page: PDFPage,
  regular: PDFFont,
  text: string,
  y: number,
  size = 8.5,
) {
  const lines = wrap(text, regular, size, 520);
  let next = y;
  lines.forEach((value) => {
    page.drawText(value, { x: 48, y: next, size, font: regular, color: ink });
    next -= size + 3.5;
  });
  return next - 8;
}

export async function buildIntakePdf(
  data: IntakeData,
  reference: string,
  submittedAt: string,
  signatureBytes?: Uint8Array,
) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const page = (title: string, number: number) => {
    const p = pdf.addPage([612, 792]);
    return { p, y: header(p, bold, regular, title, reference, number) };
  };

  let { p, y } = page("Patient Registration / Demographics", 1);
  y = section(p, bold, "Patient information", y);
  y = field(p, regular, bold, "Legal name", data.demographics.legalName, y);
  y = field(
    p,
    regular,
    bold,
    "Preferred name",
    data.demographics.preferredName,
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Date of birth / sex at birth",
    `${data.demographics.dateOfBirth} / ${data.demographics.sexAtBirth}`,
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Phone / email",
    `${data.demographics.mobilePhone} / ${data.demographics.email}`,
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Address",
    `${data.demographics.streetAddress}, ${data.demographics.city}, ${data.demographics.state} ${data.demographics.zip}`,
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Language / interpreter / marital status",
    `${data.demographics.primaryLanguage} / ${data.demographics.interpreterNeeded ? "Yes" : "No"} / ${data.demographics.maritalStatus}`,
    y,
  );
  y = section(p, bold, "Emergency contact / responsible party", y);
  y = field(
    p,
    regular,
    bold,
    "Emergency contact",
    `${data.contacts.emergencyName} · ${data.contacts.emergencyRelationship} · ${data.contacts.emergencyPhone}`,
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Responsible party",
    `${data.contacts.responsibleName} · ${data.contacts.responsibleRelationship} · ${data.contacts.responsiblePhone}`,
    y,
  );
  y = section(p, bold, "Referring / treating provider", y);
  y = field(
    p,
    regular,
    bold,
    "Provider",
    `${data.contacts.referringProvider} · ${data.contacts.providerPhone} · NPI ${data.contacts.providerNpi}`,
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Diagnosis / prescription / body side",
    `${data.contacts.diagnosis} · ${data.contacts.prescriptionDate} · ${data.contacts.bodySides.join(", ")}`,
    y,
  );

  ({ p, y } = page("Insurance and Assignment of Benefits", 2));
  y = section(p, bold, "Coverage information", y);
  y = field(p, regular, bold, "Coverage type", data.insurance.coverageType, y);
  y = field(
    p,
    regular,
    bold,
    "Primary insurance",
    `${data.insurance.company} · Member ${data.insurance.memberId} · Group ${data.insurance.groupNumber}`,
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Policy holder",
    `${data.insurance.policyHolderName} · ${data.insurance.policyHolderDob} · ${data.insurance.relationship}`,
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Claims",
    `${data.insurance.claimsAddress} · ${data.insurance.phoneOnCard}`,
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Secondary / WC / PI",
    `${data.insurance.secondaryCarrier} · Claim ${data.insurance.claimNumber} · ${data.insurance.adjuster} · ${data.insurance.adjusterPhone}`,
    y,
  );
  y = section(p, bold, CONSENTS.benefits.title, y);
  paragraph(p, regular, CONSENTS.benefits.text, y, 7.6);

  ({ p, y } = page("Medical History / O&P Intake", 3));
  y = section(p, bold, "Current problem", y);
  y = field(
    p,
    regular,
    bold,
    "Problem, injury, surgery, or condition",
    data.medical.currentProblem,
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Symptoms / pain / height / weight",
    `${data.medical.symptomsDate} · ${data.medical.painLevel}/10 · ${data.medical.heightFeet ?? "-"}' ${data.medical.heightInches ?? "-"}\" · ${data.medical.weight ?? "-"} lb`,
    y,
  );
  y = section(p, bold, "Relevant medical history", y);
  y = field(
    p,
    regular,
    bold,
    "History",
    [...data.medical.history, data.medical.historyOther].filter(Boolean),
    y,
  );
  y = field(p, regular, bold, "Medications", data.medical.medications, y);
  y = field(p, regular, bold, "Allergies", data.medical.allergies, y);
  y = section(p, bold, "Functional and skin status", y);
  y = field(p, regular, bold, "Functional status", data.function.statuses, y);
  y = field(p, regular, bold, "Goals", data.function.goals, y);
  field(
    p,
    regular,
    bold,
    "Skin / safety",
    [...data.function.skinIssues, data.function.skinOther].filter(Boolean),
    y,
  );

  ({ p, y } = page("Consent for Care / Financial Responsibility", 4));
  y = section(p, bold, CONSENTS.care.title, y);
  y = paragraph(p, regular, CONSENTS.care.text, y, 8.1);
  y = section(p, bold, "Consent evidence", y);
  y = field(
    p,
    regular,
    bold,
    "Accepted",
    data.signature.careAccepted ? "Yes" : "No",
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Signer",
    `${data.signature.printedName} · ${data.signature.relationship}`,
    y,
  );
  field(
    p,
    regular,
    bold,
    "Signed",
    new Date(submittedAt).toLocaleString("en-US"),
    y,
  );

  ({ p, y } = page("Privacy Acknowledgment / Communication Release", 5));
  y = section(p, bold, "Notice and communication permissions", y);
  y = field(p, regular, bold, "NPP acknowledgment", data.privacy.nppChoice, y);
  y = field(
    p,
    regular,
    bold,
    "Communication methods",
    data.privacy.communicationMethods,
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Voicemail",
    data.privacy.doNotLeaveVoicemail ? "Do not leave voicemail" : "Permitted",
    y,
  );
  y = field(
    p,
    regular,
    bold,
    "Authorized people",
    data.privacy.authorizedPeople.map(
      (person) => `${person.name} (${person.relationship}) ${person.phone}`,
    ),
    y,
  );
  y = section(p, bold, CONSENTS.privacy.title, y);
  y = paragraph(p, regular, CONSENTS.privacy.text, y, 7.8);
  if (signatureBytes?.length) {
    try {
      const signature = await pdf.embedPng(signatureBytes);
      p.drawText("PATIENT / RESPONSIBLE PARTY SIGNATURE", {
        x: 48,
        y: 104,
        size: 7.2,
        font: bold,
        color: red,
      });
      p.drawImage(signature, { x: 48, y: 49, width: 250, height: 50 });
    } catch {
      /* Preserve the export even if a legacy signature image is invalid. */
    }
  }
  p.drawText(
    `${data.signature.printedName} · ${data.signature.relationship} · ${new Date(submittedAt).toLocaleString("en-US")}`,
    { x: 318, y: 68, size: 8.2, font: regular, color: ink },
  );

  pdf.setTitle(`Genfinity O&P Intake ${reference}`);
  pdf.setSubject("New patient intake packet");
  pdf.setAuthor("Genfinity O&P LLC");
  return pdf.save();
}
