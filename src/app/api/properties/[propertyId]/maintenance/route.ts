import { requireAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { canAccessProperty, isPropertyOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { MaintenancePriority, MaintenanceStatus } from "@prisma/client";

type Params = { params: Promise<{ propertyId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { propertyId } = await params;

    if (!(await canAccessProperty(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where: { propertyId },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(requests);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch maintenance";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { propertyId } = await params;
    const body = await request.json();

    if (!(await canAccessProperty(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const request_ = await prisma.maintenanceRequest.create({
      data: {
        propertyId,
        reporterId: user.id,
        title: body.title,
        description: body.description,
        priority: (body.priority as MaintenancePriority) ?? MaintenancePriority.MEDIUM,
        photoUrls: body.photoUrls ?? [],
      },
    });

    return jsonOk(request_, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create request";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    return jsonError("Use PATCH /api/maintenance/[id]", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
