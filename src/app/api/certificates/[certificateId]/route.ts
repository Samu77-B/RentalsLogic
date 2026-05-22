import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { CertificateType } from "@prisma/client";

type Params = { params: Promise<{ certificateId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { certificateId } = await params;
    const body = await request.json();

    const cert = await prisma.certificate.findFirst({
      where: { id: certificateId, property: { ownerId: user.id } },
    });
    if (!cert) return jsonError("Not found", 404);

    const updated = await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        type: body.type as CertificateType | undefined,
        issueDate: body.issueDate ? new Date(body.issueDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        fileUrl: body.fileUrl,
        notes: body.notes,
      },
    });

    return jsonOk(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update certificate";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { certificateId } = await params;

    const cert = await prisma.certificate.findFirst({
      where: { id: certificateId, property: { ownerId: user.id } },
    });
    if (!cert) return jsonError("Not found", 404);

    await prisma.certificate.delete({ where: { id: certificateId } });
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete certificate";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
