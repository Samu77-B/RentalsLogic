import { requireAuth } from "@/lib/auth";
import { jsonError, jsonOk, formatApiError } from "@/lib/api";
import { canAccessProperty, isPropertyOwner } from "@/lib/permissions";
import { ENGLAND_CHECKLIST } from "@/lib/checklists";
import { prisma } from "@/lib/prisma";
import { InspectionType, ReportStatus, UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ propertyId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { propertyId } = await params;

    if (!(await canAccessProperty(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const isOwner = await isPropertyOwner(user.id, propertyId);

    const reports = await prisma.inspectionReport.findMany({
      where: isOwner
        ? { propertyId }
        : {
            propertyId,
            status: { in: [ReportStatus.SENT, ReportStatus.TENANT_REVIEW] },
          },
      include: {
        sections: { include: { items: true } },
        signatures: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(reports);
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed to fetch reports");
    return jsonError(message, status);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    if (user.role !== UserRole.LANDLORD && user.role !== UserRole.ADMIN) {
      return jsonError("Forbidden", 403);
    }

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
    const { message, status } = formatApiError(error, "Failed to create report");
    return jsonError(message, status);
  }
}

export async function PATCH(_request: Request, { params }: Params) {
  try {
    await requireAuth();
    await params;
    return jsonError("Use PATCH /api/inspections/[reportId]", 400);
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed");
    return jsonError(message, status);
  }
}
