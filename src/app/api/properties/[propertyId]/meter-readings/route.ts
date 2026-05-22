import { requireAuth, requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { canAccessProperty, isPropertyOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { MeterType } from "@prisma/client";

type Params = { params: Promise<{ propertyId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { propertyId } = await params;

    if (!(await canAccessProperty(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const readings = await prisma.meterReading.findMany({
      where: { propertyId },
      orderBy: { readingDate: "desc" },
    });

    return jsonOk(readings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch readings";
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

    const reading = await prisma.meterReading.create({
      data: {
        propertyId,
        readingType: body.readingType as MeterType,
        readingValue: body.readingValue,
        readingDate: new Date(body.readingDate),
        photoUrl: body.photoUrl,
        submittedBy: user.id,
      },
    });

    return jsonOk(reading, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create reading";
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

    return jsonError("Use DELETE /api/meter-readings/[id]", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
