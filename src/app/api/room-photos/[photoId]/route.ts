import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ photoId: string }> };

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { photoId } = await params;

    const photo = await prisma.roomPhoto.findFirst({
      where: {
        id: photoId,
        room: { property: { ownerId: user.id } },
      },
    });
    if (!photo) return jsonError("Not found", 404);

    await prisma.roomPhoto.delete({ where: { id: photoId } });
    return jsonOk({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete photo";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
