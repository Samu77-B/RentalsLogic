import { requireAuth } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ documentId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { documentId } = await params;
    const body = await request.json();

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
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

    if (!document) return jsonError("Not found", 404);

    const signature = await prisma.signature.create({
      data: {
        documentId,
        signerId: user.id,
        signatureData: body.signatureData,
        ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
      },
    });

    await prisma.document.update({
      where: { id: documentId },
      data: { isSigned: true },
    });

    await logActivity({
      userId: user.id,
      propertyId: document.propertyId,
      action: "document_signed",
      entityType: "Document",
      entityId: documentId,
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });

    return jsonOk(signature, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to sign document";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
