import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { TenancyStatus } from "@prisma/client";

type Params = { params: Promise<{ tenancyId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { tenancyId } = await params;
    const body = await request.json();

    const tenancy = await prisma.tenancy.findFirst({
      where: { id: tenancyId, property: { ownerId: user.id } },
    });
    if (!tenancy) return jsonError("Not found", 404);

    const updated = await prisma.tenancy.update({
      where: { id: tenancyId },
      data: {
        tenantName: body.tenantName,
        tenantEmail: body.tenantEmail,
        tenantPhone: body.tenantPhone,
        leaseStartDate: body.leaseStartDate ? new Date(body.leaseStartDate) : undefined,
        leaseEndDate: body.leaseEndDate ? new Date(body.leaseEndDate) : undefined,
        status: body.status as TenancyStatus | undefined,
      },
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
