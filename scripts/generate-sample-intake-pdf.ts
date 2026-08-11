import { writeFileSync } from "fs";
import { buildIntakePdf } from "../lib/intake/pdf";
import { defaultIntakeData } from "../lib/intake/schema";

async function main() {
  const data = structuredClone(defaultIntakeData);
  data.synthetic = true;
  Object.assign(data.demographics, {
    legalName: "TEST Jordan Rivera",
    preferredName: "Jordan",
    dateOfBirth: "1985-06-14",
    mobilePhone: "(818) 555-0142",
    email: "test@example.com",
    streetAddress: "18401 Burbank Blvd Ste 215",
    city: "Tarzana",
    state: "CA",
    zip: "91356",
    maritalStatus: "married",
  });
  Object.assign(data.contacts, {
    emergencyName: "TEST Morgan Rivera",
    emergencyRelationship: "Spouse",
    emergencyPhone: "(818) 555-0199",
    referringProvider: "TEST Provider",
    providerPhone: "(818) 555-0100",
    diagnosis: "Below-knee prosthetic evaluation",
    bodySides: ["Right"],
    contactPreferences: ["Phone call", "Email"],
  });
  Object.assign(data.insurance, {
    company: "TEST Health Plan",
    memberId: "TEST-12345",
    groupNumber: "G-100",
    policyHolderName: "TEST Jordan Rivera",
    relationship: "Self",
  });
  Object.assign(data.medical, {
    currentProblem:
      "Existing prosthesis feels unstable after recent volume changes. Patient wants to walk farther with less pressure and more confidence.",
    symptomsDate: "2026-07-01",
    painLevel: 4,
    heightFeet: 5,
    heightInches: 10,
    weight: 175,
    history: ["Amputation", "Fall risk"],
    medications: "Test medication list",
    allergies: "No known material allergies",
  });
  Object.assign(data.function, {
    statuses: ["Independent ambulation"],
    goals:
      "Return to longer neighborhood walks and feel secure on uneven ground.",
    skinIssues: ["Redness"],
  });
  Object.assign(data.privacy, {
    communicationMethods: ["Phone / voicemail", "Email"],
    authorizedPeople: [
      {
        name: "TEST Morgan Rivera",
        relationship: "Spouse",
        phone: "(818) 555-0199",
      },
    ],
  });
  data.signature = {
    benefitsAccepted: true,
    careAccepted: true,
    privacyAccepted: true,
    printedName: "TEST Jordan Rivera",
    relationship: "Self",
    signatureDataUrl: "[stored-private-signature]",
    signatureMode: "drawn",
  };
  const bytes = await buildIntakePdf(
    data,
    "GO-2026-TEST1234",
    new Date().toISOString(),
  );
  writeFileSync(process.argv[2] || "/tmp/genfinity-sample-intake.pdf", bytes);
}

void main();
