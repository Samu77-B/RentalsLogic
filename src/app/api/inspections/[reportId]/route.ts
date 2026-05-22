import { requireAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { canAccessProperty, isPropertyOwner } from "@/lib/permissions";
import { logActivity } from "@/lib/activity";
import { sendReportReadyEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { ReportStatus } from "@prisma/client";

type Params = { params: Promise<{ reportId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { reportId } = await params;

    const report = await prisma.inspectionReport.findFirst({
      where: {
        id: reportId,
        property: {
          OR: [
            { ownerId: user.id },
            {
              tenancies: {
                some: { tenantUserId: user.id, status: "ACTIVE" },
              },
            },
          ],
        },
      },
      include: {
        property: true,
        sections: {
          include: {
            items: { include: { tenantComments: { include: { user: true } } } },
            room: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        compareReport: {
          include: {
            sections: { include: { items: true }, orderBy: { sortOrder: "asc" } },
          },
        },
        signatures: { include: { signer: true } },
      },
    });

    if (!report) return jsonError("Not found", 404);
    return jsonOk(report);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch report";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { reportId } = await params;
    const body = await request.json();

    const report = await prisma.inspectionReport.findFirst({
      where: { id: reportId, property: { ownerId: user.id } },
      include: { property: { include: { tenancies: { where: { status: "ACTIVE" } } } } },
    });

    if (!report) return jsonError("Not found", 404);

    const updated = await prisma.inspectionReport.update({
      where: { id: reportId },
      data: {
        title: body.title,
        status: body.status as ReportStatus | undefined,
        compareReportId: body.compareReportId,
        sentAt: body.status === ReportStatus.SENT ? new Date() : undefined,
      },
    });

    if (body.status === ReportStatus.SENT) {
      for (const tenancy of report.property.tenancies) {
        await sendReportReadyEmail({
          to: tenancy.tenantEmail,
          reportTitle: report.title,
          reportUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tenant/reports/${reportId}`,
        });
      }
    }

    return jsonOk(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update report";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { reportId } = await params;

    const report = await prisma.inspectionReport.findFirst({
      where: { id: reportId, property: { ownerId: user.id } },
    });
    if (!report) return jsonError("Not found", 404);

    await prisma.inspectionReport.delete({ where: { id: reportId } });
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete report";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
