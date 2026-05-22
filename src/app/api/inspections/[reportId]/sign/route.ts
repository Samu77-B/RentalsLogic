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
        OR: [
          { property: { ownerId: user.id } },
          {
            property: {
              tenancies: {
                some: { tenantUserId: user.id, status: "ACTIVE" },
              },
            },
          },
        ],
      },
    });

    if (!report) return jsonError("Not found", 404);

    const signature = await prisma.signature.create({
      data: {
        reportId,
        signerId: user.id,
        signatureData: body.signatureData,
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      },
    });

    const newStatus =
      body.approved === false ? ReportStatus.DISPUTED : ReportStatus.SIGNED;

    await prisma.inspectionReport.update({
      where: { id: reportId },
      data: { status: newStatus, signedAt: new Date() },
    });

    await logActivity({
      userId: user.id,
      propertyId: report.propertyId,
      action: body.approved === false ? "report_disputed" : "report_signed",
      entityType: "InspectionReport",
      entityId: reportId,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return jsonOk(signature, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sign report";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
