import { requireTenant } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { getTenantProperties } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await requireTenant();
    const properties = await getTenantProperties(user.id);

    const pendingReports = await prisma.inspectionReport.count({
      where: {
        property: {
          tenancies: { some: { tenantUserId: user.id, status: "ACTIVE" } },
        },
        status: { in: ["SENT", "TENANT_REVIEW"] },
      },
    });

    const openMaintenance = await prisma.maintenanceRequest.count({
      where: {
        reporterId: user.id,
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
    });

    const unsignedDocs = await prisma.document.count({
      where: {
        isSigned: false,
        property: {
          tenancies: { some: { tenantUserId: user.id, status: "ACTIVE" } },
        },
      },
    });

    return jsonOk({
      properties,
      pendingReports,
      openMaintenance,
      unsignedDocs,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch tenant dashboard";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
