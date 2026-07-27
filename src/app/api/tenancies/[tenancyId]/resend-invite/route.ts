import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { appBaseUrl, sendTenantInvite } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { TenancyStatus } from "@prisma/client";
import { randomBytes } from "crypto";

type Params = { params: Promise<{ tenancyId: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { tenancyId } = await params;

    const tenancy = await prisma.tenancy.findFirst({
      where: { id: tenancyId, property: { ownerId: user.id } },
      include: { property: true },
    });

    if (!tenancy) return jsonError("Not found", 404);
    if (tenancy.status === TenancyStatus.ACTIVE) {
      return jsonError("This tenant has already accepted their invite", 400);
    }

    const inviteToken = tenancy.inviteToken || randomBytes(32).toString("hex");
    if (!tenancy.inviteToken) {
      await prisma.tenancy.update({
        where: { id: tenancy.id },
        data: { inviteToken, status: TenancyStatus.PENDING },
      });
    }

    const inviteUrl = `${appBaseUrl()}/tenant/accept?token=${inviteToken}`;
    const emailResult = await sendTenantInvite({
      to: tenancy.tenantEmail,
      tenantName: tenancy.tenantName,
      propertyAddress: tenancy.property.address,
      inviteUrl,
    });

    return jsonOk({
      inviteUrl,
      emailSent: emailResult.sent,
      emailStubbed: Boolean(emailResult.stubbed),
      emailError: emailResult.error ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to resend invite";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
