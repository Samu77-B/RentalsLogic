import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk, formatApiError } from "@/lib/api";
import { isPropertyOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PropertyType, RentPeriod, Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ propertyId: string }> };

function isMissingCoverPhotoColumn(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("coverPhotoUrl") ||
    (error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2022")
  );
}

async function getPropertySummary(propertyId: string) {
  try {
    return await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        address: true,
        city: true,
        postcode: true,
        rentAmount: true,
        rentPeriod: true,
        propertyType: true,
        coverPhotoUrl: true,
      },
    });
  } catch (error) {
    if (!isMissingCoverPhotoColumn(error)) throw error;
    // Column not migrated yet — still return the property without cover photo.
    const rows = await prisma.$queryRaw<
      Array<{
        id: string;
        address: string;
        city: string | null;
        postcode: string | null;
        rentAmount: Prisma.Decimal;
        rentPeriod: RentPeriod;
        propertyType: PropertyType;
      }>
    >`
      SELECT id, address, city, postcode, "rentAmount", "rentPeriod", "propertyType"
      FROM "Property"
      WHERE id = ${propertyId}
      LIMIT 1
    `;
    const row = rows[0];
    if (!row) return null;
    return { ...row, coverPhotoUrl: null as string | null };
  }
}

async function getPropertyInventory(propertyId: string) {
  try {
    return await prisma.property.findUnique({
      where: { id: propertyId },
      include: {
        rooms: {
          include: {
            inventoryItems: { include: { photos: true } },
            roomPhotos: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  } catch (error) {
    if (!isMissingCoverPhotoColumn(error)) throw error;
    return prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        id: true,
        ownerId: true,
        propertyType: true,
        address: true,
        city: true,
        postcode: true,
        rentAmount: true,
        rentPeriod: true,
        region: true,
        createdAt: true,
        updatedAt: true,
        rooms: {
          include: {
            inventoryItems: { include: { photos: true } },
            roomPhotos: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }
}

export async function GET(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const view = new URL(request.url).searchParams.get("view");
    const property =
      view === "summary"
        ? await getPropertySummary(propertyId)
        : await getPropertyInventory(propertyId);

    if (!property) return jsonError("Not found", 404);
    return jsonOk(property);
  } catch (error) {
    console.error("GET /api/properties/[propertyId] failed:", error);
    const { message, status } = formatApiError(error, "Failed to fetch property");
    return jsonError(message, status);
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const body = await request.json();
    const data: Prisma.PropertyUpdateInput = {
      propertyType: body.propertyType as PropertyType | undefined,
      address: body.address,
      city: body.city,
      postcode: body.postcode,
      rentAmount: body.rentAmount,
      rentPeriod: body.rentPeriod as RentPeriod | undefined,
      region: body.region,
    };

    if (body.coverPhotoUrl !== undefined) {
      data.coverPhotoUrl = body.coverPhotoUrl || null;
    }

    try {
      const property = await prisma.property.update({
        where: { id: propertyId },
        data,
      });
      return jsonOk(property);
    } catch (error) {
      if (body.coverPhotoUrl !== undefined && isMissingCoverPhotoColumn(error)) {
        return jsonError(
          'Property photo column is missing. Run: ALTER TABLE "Property" ADD COLUMN IF NOT EXISTS "coverPhotoUrl" TEXT;',
          503
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("PATCH /api/properties/[propertyId] failed:", error);
    const { message, status } = formatApiError(error, "Failed to update property");
    return jsonError(message, status);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    await prisma.property.delete({ where: { id: propertyId } });
    return jsonOk({ success: true });
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed to delete property");
    return jsonError(message, status);
  }
}
