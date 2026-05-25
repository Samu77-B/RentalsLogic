import { randomBytes } from "crypto";
import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { isPropertyOwner } from "@/lib/permissions";
import { sendTenantInvite } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { TenancyStatus } from "@prisma/client";

type Params = { params: Promise<{ propertyId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const tenancies = await prisma.tenancy.findMany({
      where: { propertyId },
      include: { tenant: true },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(tenancies);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch tenants";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;
    const body = await request.json();

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return jsonError("Property not found", 404);

    const inviteToken = randomBytes(32).toString("hex");

    const tenancy = await prisma.tenancy.create({
      data: {
        propertyId,
        tenantName: body.tenantName,
        tenantEmail: body.tenantEmail,
        tenantPhone: body.tenantPhone,
        leaseStartDate: new Date(body.leaseStartDate),
        leaseEndDate: new Date(body.leaseEndDate),
        status: TenancyStatus.PENDING,
        inviteToken,
      },
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tenant/accept?token=${inviteToken}`;
    await sendTenantInvite({
      to: body.tenantEmail,
      tenantName: body.tenantName,
      propertyAddress: property.address,
      inviteUrl,
    });

    return jsonOk({ ...tenancy, inviteUrl }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create tenant";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
