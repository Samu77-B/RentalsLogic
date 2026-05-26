import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { TenancyStatus } from "@prisma/client";
import {
  tenancyInclude,
  tenancyProfileData,
  type GuarantorInput,
  type TenancyProfileInput,
} from "@/lib/tenancy";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ tenancyId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { tenancyId } = await params;

    const tenancy = await prisma.tenancy.findFirst({
      where: { id: tenancyId, property: { ownerId: user.id } },
      include: tenancyInclude,
    });
    if (!tenancy) return jsonError("Not found", 404);

    return jsonOk(tenancy);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch tenant";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { tenancyId } = await params;
    const body = (await request.json()) as TenancyProfileInput & {
      status?: TenancyStatus;
      leaseContractUrl?: string;
      leaseContractTitle?: string;
    };

    const tenancy = await prisma.tenancy.findFirst({
      where: { id: tenancyId, property: { ownerId: user.id } },
    });
    if (!tenancy) return jsonError("Not found", 404);

    const profile = tenancyProfileData(body);
    const cleanProfile = Object.fromEntries(
      Object.entries(profile).filter(([, value]) => value !== undefined)
    );

    const updated = await prisma.$transaction(async (tx) => {
      if (body.guarantors) {
        await tx.guarantor.deleteMany({ where: { tenancyId } });
        if (body.guarantors.length) {
          await tx.guarantor.createMany({
            data: body.guarantors.map((g: GuarantorInput) => ({
              tenancyId,
              fullName: g.fullName,
              address: g.address || null,
              occupation: g.occupation || null,
              employer: g.employer || null,
              email: g.email || null,
              phone: g.phone || null,
              relationship: g.relationship || null,
            })),
          });
        }
      }

      if (body.leaseContractUrl) {
        await tx.document.create({
          data: {
            propertyId: tenancy.propertyId,
            tenancyId,
            documentType: "LEASE",
            title: body.leaseContractTitle || "Tenancy agreement",
            storagePath: body.leaseContractUrl,
          },
        });
      }

      return tx.tenancy.update({
        where: { id: tenancyId },
        data: {
          ...cleanProfile,
          status: body.status,
        },
        include: tenancyInclude,
      });
    });

    return jsonOk(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update tenant";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { tenancyId } = await params;

    const tenancy = await prisma.tenancy.findFirst({
      where: { id: tenancyId, property: { ownerId: user.id } },
    });
    if (!tenancy) return jsonError("Not found", 404);

    await prisma.tenancy.delete({ where: { id: tenancyId } });
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete tenant";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
