import { requireAuth } from "@/lib/auth";
import { jsonError, jsonOk, formatApiError } from "@/lib/api";
import { canAccessProperty, isPropertyOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { DocumentType, UserRole } from "@prisma/client";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ propertyId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    const { propertyId } = await params;

    if (!(await canAccessProperty(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const isOwner = await isPropertyOwner(user.id, propertyId);

    const documents = await prisma.document.findMany({
      where: isOwner
        ? { propertyId }
        : {
            propertyId,
            OR: [
              { tenancyId: null },
              {
                tenancy: {
                  tenantUserId: user.id,
                  status: "ACTIVE",
                },
              },
            ],
          },
      include: { signatures: true },
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(documents);
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed to fetch documents");
    return jsonError(message, status);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireAuth();
    if (user.role !== UserRole.LANDLORD && user.role !== UserRole.ADMIN) {
      return jsonError("Forbidden", 403);
    }

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
    const { message, status } = formatApiError(error, "Failed to create document");
    return jsonError(message, status);
  }
}
