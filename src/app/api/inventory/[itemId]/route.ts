import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ itemId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { itemId } = await params;
    const body = await request.json();

    const item = await prisma.inventoryItem.findFirst({
      where: { id: itemId, room: { property: { ownerId: user.id } } },
    });
    if (!item) return jsonError("Not found", 404);

    if (body.photoUrls?.length) {
      await prisma.inventoryPhoto.deleteMany({ where: { inventoryItemId: itemId } });
      await prisma.inventoryPhoto.createMany({
        data: body.photoUrls.map((url: string) => ({
          inventoryItemId: itemId,
          url,
        })),
      });
    }

    const updated = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: {
        name: body.name,
        description: body.description,
        condition: body.condition,
      },
      include: { photos: true },
    });

    return jsonOk(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update item";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { itemId } = await params;

    const item = await prisma.inventoryItem.findFirst({
      where: { id: itemId, room: { property: { ownerId: user.id } } },
    });
    if (!item) return jsonError("Not found", 404);

    await prisma.inventoryItem.delete({ where: { id: itemId } });
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete item";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
