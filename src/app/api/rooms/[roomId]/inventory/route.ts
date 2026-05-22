import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ roomId: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { roomId } = await params;

    const room = await prisma.room.findFirst({
      where: { id: roomId, property: { ownerId: user.id } },
    });
    if (!room) return jsonError("Not found", 404);

    const items = await prisma.inventoryItem.findMany({
      where: { roomId },
      include: { photos: true },
      orderBy: { createdAt: "asc" },
    });

    return jsonOk(items);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch inventory";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { roomId } = await params;
    const body = await request.json();

    const room = await prisma.room.findFirst({
      where: { id: roomId, property: { ownerId: user.id } },
    });
    if (!room) return jsonError("Not found", 404);

    const item = await prisma.inventoryItem.create({
      data: {
        roomId,
        name: body.name,
        description: body.description,
        condition: body.condition,
        photos: body.photoUrls?.length
          ? { create: body.photoUrls.map((url: string) => ({ url })) }
          : undefined,
      },
      include: { photos: true },
    });

    return jsonOk(item, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create inventory item";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
