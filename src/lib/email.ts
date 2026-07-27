import { Resend } from "resend";

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export type SendEmailResult = {
  sent: boolean;
  stubbed?: boolean;
  error?: string;
};

export function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  if (!resend) {
    console.log("[email stub]", { to, subject });
    return { sent: false, stubbed: true };
  }

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "RentalsLogic <noreply@rentalslogic.com>",
    to,
    subject,
    html,
  });

  if (error) {
    console.error("[email error]", error);
    return {
      sent: false,
      error: typeof error.message === "string" ? error.message : "Email send failed",
    };
  }

  return { sent: true };
}

export async function sendLandlordWelcomeEmail({
  to,
  name,
  dashboardUrl,
}: {
  to: string;
  name: string;
  dashboardUrl: string;
}) {
  return sendEmail({
    to,
    subject: "Welcome to RentalsLogic",
    html: `
      <h2>Welcome to RentalsLogic</h2>
      <p>Hi ${name},</p>
      <p>Thanks for signing up. Your landlord dashboard is ready — add your first property, set up inventories, and invite tenants when you're ready.</p>
      <p><a href="${dashboardUrl}">Go to your dashboard</a></p>
    `,
  });
}

export async function sendTenantInvite({
  to,
  tenantName,
  propertyAddress,
  inviteUrl,
}: {
  to: string;
  tenantName: string;
  propertyAddress: string;
  inviteUrl: string;
}) {
  return sendEmail({
    to,
    subject: `You've been invited to RentalsLogic — ${propertyAddress}`,
    html: `
      <h2>Welcome to RentalsLogic</h2>
      <p>Hi ${tenantName},</p>
      <p>You've been invited as a tenant for <strong>${propertyAddress}</strong>.</p>
      <p><a href="${inviteUrl}">Accept your invitation</a> to view reports, submit maintenance requests, and sign documents.</p>
      <p>If the button does not work, copy and paste this link into your browser:</p>
      <p><a href="${inviteUrl}">${inviteUrl}</a></p>
    `,
  });
}

export async function sendReportReadyEmail({
  to,
  reportTitle,
  reportUrl,
}: {
  to: string;
  reportTitle: string;
  reportUrl: string;
}) {
  return sendEmail({
    to,
    subject: `Report ready for review: ${reportTitle}`,
    html: `
      <h2>Inspection report ready</h2>
      <p>A new report is ready for your review: <strong>${reportTitle}</strong></p>
      <p><a href="${reportUrl}">Review report</a></p>
    `,
  });
}

export async function sendCertificateExpiryEmail({
  to,
  propertyAddress,
  certType,
  expiryDate,
}: {
  to: string;
  propertyAddress: string;
  certType: string;
  expiryDate: string;
}) {
  return sendEmail({
    to,
    subject: `Certificate expiring: ${certType} — ${propertyAddress}`,
    html: `
      <h2>Certificate expiry reminder</h2>
      <p>The <strong>${certType}</strong> certificate for <strong>${propertyAddress}</strong> expires on ${expiryDate}.</p>
      <p>Please renew and upload the updated certificate.</p>
    `,
  });
}
