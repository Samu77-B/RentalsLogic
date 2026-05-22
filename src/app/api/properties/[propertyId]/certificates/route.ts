import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { isPropertyOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { CertificateType } from "@prisma/client";

type Params = { params: Promise<{ propertyId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const certificates = await prisma.certificate.findMany({
      where: { propertyId },
      orderBy: { expiryDate: "asc" },
    });

    return jsonOk(certificates);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch certificates";
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

    const certificate = await prisma.certificate.create({
      data: {
        propertyId,
        type: body.type as CertificateType,
        issueDate: new Date(body.issueDate),
        expiryDate: new Date(body.expiryDate),
        fileUrl: body.fileUrl,
        notes: body.notes,
      },
    });

    return jsonOk(certificate, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create certificate";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
