import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { sendCertificateExpiryEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { CERTIFICATE_TYPE_LABELS } from "@/lib/checklists";

export async function GET() {
  try {
    const user = await requireLandlord();

    const [properties, openMaintenance, expiringCerts, recentActivity] =
      await Promise.all([
        prisma.property.count({ where: { ownerId: user.id } }),
        prisma.maintenanceRequest.count({
          where: {
            property: { ownerId: user.id },
            status: { in: ["OPEN", "IN_PROGRESS"] },
          },
        }),
        prisma.certificate.count({
          where: {
            property: { ownerId: user.id },
            expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
          },
        }),
        prisma.activityLog.findMany({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);

    return jsonOk({
      properties,
      openMaintenance,
      expiringCerts,
      membershipTier: user.membershipTier,
      recentActivity,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch dashboard";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function POST() {
  try {
    const user = await requireLandlord();

    const expiring = await prisma.certificate.findMany({
      where: {
        property: { ownerId: user.id },
        expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
        reminderSent: false,
      },
      include: { property: true },
    });

    for (const cert of expiring) {
      await sendCertificateExpiryEmail({
        to: user.email,
        propertyAddress: cert.property.address,
        certType: CERTIFICATE_TYPE_LABELS[cert.type] ?? cert.type,
        expiryDate: cert.expiryDate.toISOString().split("T")[0],
      });
      await prisma.certificate.update({
        where: { id: cert.id },
        data: { reminderSent: true },
      });
    }

    return jsonOk({ remindersSent: expiring.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send reminders";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
