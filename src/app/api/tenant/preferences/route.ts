import { requireAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

function isTenantRole(role: UserRole) {
  return role === UserRole.TENANT || role === UserRole.ADMIN;
}

export async function GET() {
  try {
    const user = await requireAuth();
    if (!isTenantRole(user.role)) return jsonError("Forbidden", 403);

    const profile = await prisma.tenantProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });

    return jsonOk(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load preferences";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireAuth();
    if (!isTenantRole(user.role)) return jsonError("Forbidden", 403);

    const body = await request.json();

    if (body.notifyWhatsApp && !String(body.whatsappNumber || "").trim()) {
      return jsonError("Add a WhatsApp number to enable WhatsApp alerts", 400);
    }
    if (body.notifyTelegram && !String(body.telegramHandle || "").trim()) {
      return jsonError("Add a Telegram username to enable Telegram alerts", 400);
    }

    const profile = await prisma.tenantProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        phone: typeof body.phone === "string" ? body.phone.trim() || null : null,
        notifyEmail: body.notifyEmail !== false,
        notifyWhatsApp: Boolean(body.notifyWhatsApp),
        notifyTelegram: Boolean(body.notifyTelegram),
        whatsappNumber:
          typeof body.whatsappNumber === "string"
            ? body.whatsappNumber.trim() || null
            : null,
        telegramHandle:
          typeof body.telegramHandle === "string"
            ? body.telegramHandle.replace(/^@/, "").trim() || null
            : null,
        notifyMaintenance: body.notifyMaintenance !== false,
        notifyInspections: body.notifyInspections !== false,
        notifyDocuments: body.notifyDocuments !== false,
      },
      update: {
        phone: typeof body.phone === "string" ? body.phone.trim() || null : undefined,
        notifyEmail:
          typeof body.notifyEmail === "boolean" ? body.notifyEmail : undefined,
        notifyWhatsApp:
          typeof body.notifyWhatsApp === "boolean" ? body.notifyWhatsApp : undefined,
        notifyTelegram:
          typeof body.notifyTelegram === "boolean" ? body.notifyTelegram : undefined,
        whatsappNumber:
          typeof body.whatsappNumber === "string"
            ? body.whatsappNumber.trim() || null
            : undefined,
        telegramHandle:
          typeof body.telegramHandle === "string"
            ? body.telegramHandle.replace(/^@/, "").trim() || null
            : undefined,
        notifyMaintenance:
          typeof body.notifyMaintenance === "boolean"
            ? body.notifyMaintenance
            : undefined,
        notifyInspections:
          typeof body.notifyInspections === "boolean"
            ? body.notifyInspections
            : undefined,
        notifyDocuments:
          typeof body.notifyDocuments === "boolean"
            ? body.notifyDocuments
            : undefined,
      },
    });

    return jsonOk(profile);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save preferences";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
