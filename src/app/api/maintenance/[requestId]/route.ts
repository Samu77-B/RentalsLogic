import { requireAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { isPropertyOwner } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { MaintenancePriority, MaintenanceStatus } from "@prisma/client";

type Params = { params: Promise<{ requestId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { requestId } = await params;
    const body = await request.json();

    const existing = await prisma.maintenanceRequest.findFirst({
      where: {
        id: requestId,
        OR: [
          { reporterId: user.id },
          { property: { ownerId: user.id } },
        ],
      },
    });

    if (!existing) return jsonError("Not found", 404);

    const isOwner = await isPropertyOwner(user.id, existing.propertyId);
    const updated = await prisma.maintenanceRequest.update({
      where: { id: requestId },
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority as MaintenancePriority | undefined,
        status: isOwner ? (body.status as MaintenanceStatus | undefined) : undefined,
        contractorNotes: isOwner ? body.contractorNotes : undefined,
        photoUrls: body.photoUrls,
      },
    });

    await logActivity({
      userId: user.id,
      propertyId: existing.propertyId,
      action: "maintenance_updated",
      entityType: "MaintenanceRequest",
      entityId: requestId,
    });

    return jsonOk(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update request";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { requestId } = await params;

    const existing = await prisma.maintenanceRequest.findFirst({
      where: { id: requestId, property: { ownerId: user.id } },
    });
    if (!existing) return jsonError("Not found", 404);

    await prisma.maintenanceRequest.delete({ where: { id: requestId } });
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete request";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
