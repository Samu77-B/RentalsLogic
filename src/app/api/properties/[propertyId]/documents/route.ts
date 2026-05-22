import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { isPropertyOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { DocumentType } from "@prisma/client";

type Params = { params: Promise<{ propertyId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const documents = await prisma.document.findMany({
      where: { propertyId },
      include: { signatures: true },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(documents);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch documents";
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

    const document = await prisma.document.create({
      data: {
        propertyId,
        title: body.title,
        documentType: (body.documentType as DocumentType) ?? DocumentType.OTHER,
        storagePath: body.storagePath,
        tenancyId: body.tenancyId,
      },
    });

    return jsonOk(document, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create document";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
