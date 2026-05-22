import { requireAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";
import { ReportStatus } from "@prisma/client";

type Params = { params: Promise<{ reportId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { reportId } = await params;
    const body = await request.json();

    const report = await prisma.inspectionReport.findFirst({
      where: {
        id: reportId,
        property: {
          tenancies: {
            some: { tenantUserId: user.id, status: "ACTIVE" },
          },
        },
      },
    });

    if (!report) return jsonError("Not found", 404);

    const comment = await prisma.tenantComment.create({
      data: {
        reportItemId: body.reportItemId,
        userId: user.id,
        comment: body.comment,
        photoUrls: body.photoUrls ?? [],
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      },
      include: { user: true },
    });

    await prisma.inspectionReport.update({
      where: { id: reportId },
      data: { status: ReportStatus.TENANT_REVIEW },
    });

    await logActivity({
      userId: user.id,
      propertyId: report.propertyId,
      action: "tenant_comment_added",
      entityType: "ReportItem",
      entityId: body.reportItemId,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return jsonOk(comment, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add comment";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
