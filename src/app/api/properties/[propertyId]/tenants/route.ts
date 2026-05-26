import { randomBytes } from "crypto";
import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { isPropertyOwner } from "@/lib/permissions";
import { sendTenantInvite } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { TenancyStatus } from "@prisma/client";
import {
  tenancyInclude,
  tenancyProfileData,
  type GuarantorInput,
  type TenancyProfileInput,
} from "@/lib/tenancy";

export const dynamic = "force-dynamic";

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
      include: tenancyInclude,
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
    const body = (await request.json()) as TenancyProfileInput & {
      leaseContractUrl?: string;
      leaseContractTitle?: string;
    };

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    if (!body.tenantName || !body.tenantEmail || !body.leaseStartDate || !body.leaseEndDate) {
      return jsonError("Name, email, and lease dates are required", 400);
    }

    const tenantName = body.tenantName;
    const tenantEmail = body.tenantEmail;
    const leaseStartDate = body.leaseStartDate;
    const leaseEndDate = body.leaseEndDate;

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return jsonError("Property not found", 404);

    const inviteToken = randomBytes(32).toString("hex");
    const profile = tenancyProfileData(body);

    const tenancy = await prisma.$transaction(async (tx) => {
      const created = await tx.tenancy.create({
        data: {
          propertyId,
          ...profile,
          tenantName,
          tenantEmail,
          leaseStartDate: new Date(leaseStartDate),
          leaseEndDate: new Date(leaseEndDate),
          status: TenancyStatus.PENDING,
          inviteToken,
          guarantors: body.guarantors?.length
            ? {
                create: body.guarantors.map((g: GuarantorInput) => ({
                  fullName: g.fullName,
                  address: g.address || null,
                  occupation: g.occupation || null,
                  employer: g.employer || null,
                  email: g.email || null,
                  phone: g.phone || null,
                  relationship: g.relationship || null,
                })),
              }
            : undefined,
        },
      });

      if (body.leaseContractUrl) {
        await tx.document.create({
          data: {
            propertyId,
            tenancyId: created.id,
            documentType: "LEASE",
            title: body.leaseContractTitle || "Tenancy agreement",
            storagePath: body.leaseContractUrl,
          },
        });
      }

      return tx.tenancy.findUniqueOrThrow({
        where: { id: created.id },
        include: tenancyInclude,
      });
    });

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/tenant/accept?token=${inviteToken}`;
    await sendTenantInvite({
      to: tenantEmail,
      tenantName,
      propertyAddress: property.address,
      inviteUrl,
    });

    return jsonOk({ ...tenancy, inviteUrl }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create tenant";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
