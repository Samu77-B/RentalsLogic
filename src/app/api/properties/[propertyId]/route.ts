import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { isPropertyOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PropertyType, RentPeriod } from "@prisma/client";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ propertyId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        rooms: {
          include: {
            inventoryItems: { include: { photos: true } },
            roomPhotos: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        tenancies: true,
        meterReadings: { orderBy: { readingDate: "desc" } },
        certificates: { orderBy: { expiryDate: "asc" } },
        documents: { orderBy: { createdAt: "desc" } },
        maintenanceRequests: { orderBy: { createdAt: "desc" } },
        inspectionReports: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!property) return jsonError("Not found", 404);
    return jsonOk(property);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch property";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const body = await request.json();
    const property = await prisma.property.update({
      where: { id: propertyId },
      data: {
        propertyType: body.propertyType as PropertyType | undefined,
        address: body.address,
        city: body.city,
        postcode: body.postcode,
        rentAmount: body.rentAmount,
        rentPeriod: body.rentPeriod as RentPeriod | undefined,
        region: body.region,
      },
    });

    return jsonOk(property);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update property";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    await prisma.property.delete({ where: { id: propertyId } });
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete property";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
