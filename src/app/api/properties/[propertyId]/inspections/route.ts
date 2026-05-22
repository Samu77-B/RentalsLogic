import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { isPropertyOwner } from "@/lib/permissions";
import { ENGLAND_CHECKLIST } from "@/lib/checklists";
import { sendReportReadyEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { InspectionType, ReportStatus } from "@prisma/client";

type Params = { params: Promise<{ propertyId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const reports = await prisma.inspectionReport.findMany({
      where: { propertyId },
      include: {
        sections: { include: { items: true } },
        signatures: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(reports);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch reports";
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

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        rooms: {
          include: { inventoryItems: { include: { photos: true } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!property) return jsonError("Property not found", 404);

    const reportType = body.type as InspectionType;
    const title =
      body.title ||
      `${reportType.replace("_", " ")} — ${property.address}`;

    const report = await prisma.inspectionReport.create({
      data: {
        propertyId,
        type: reportType,
        title,
        compareReportId: body.compareReportId,
        checklistData: ENGLAND_CHECKLIST,
        sections: {
          create: property.rooms.map((room, index) => ({
            roomId: room.id,
            title: room.name,
            sortOrder: index,
            items: {
              create: room.inventoryItems.map((item, itemIndex) => ({
                name: item.name,
                condition: item.condition ?? "Good",
                cleanliness: "Clean",
                notes: item.description,
                photoUrls: item.photos.map((p) => p.url),
                sortOrder: itemIndex,
              })),
            },
          })),
        },
      },
      include: {
        sections: { include: { items: true, room: true } },
      },
    });

    return jsonOk(report, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create report";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;
    return jsonError("Use PATCH /api/inspections/[reportId]", 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
