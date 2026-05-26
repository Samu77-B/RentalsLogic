import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { RoomType } from "@prisma/client";

type Params = { params: Promise<{ roomId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { roomId } = await params;
    const body = await request.json();

    const room = await prisma.room.findFirst({
      where: { id: roomId, property: { ownerId: user.id } },
    });
    if (!room) return jsonError("Not found", 404);

    const updated = await prisma.room.update({
      where: { id: roomId },
      data: {
        name: body.name,
        roomType: body.roomType as RoomType | undefined,
        sortOrder: body.sortOrder,
      },
    });

    return jsonOk(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update room";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { roomId } = await params;

    const room = await prisma.room.findFirst({
      where: { id: roomId, property: { ownerId: user.id } },
    });
    if (!room) return jsonError("Not found", 404);

    await prisma.room.delete({ where: { id: roomId } });
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete room";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
