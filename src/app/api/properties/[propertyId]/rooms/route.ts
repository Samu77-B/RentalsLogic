import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { isPropertyOwner } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { RoomType } from "@prisma/client";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ propertyId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const rooms = await prisma.room.findMany({
      where: { propertyId },
      include: {
        inventoryItems: { include: { photos: true } },
        roomPhotos: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    return jsonOk(rooms);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch rooms";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { propertyId } = await params;

    if (!(await isPropertyOwner(user.id, propertyId))) {
      return jsonError("Forbidden", 403);
    }

    const body = await request.json();
    const room = await prisma.room.create({
      data: {
        propertyId,
        roomType: body.roomType as RoomType,
        name: body.name,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    return jsonOk(room, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create room";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
