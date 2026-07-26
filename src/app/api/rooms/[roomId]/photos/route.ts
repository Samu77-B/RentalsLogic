import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ roomId: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const user = await requireLandlord();
    const { roomId } = await params;
    const body = await request.json();

    const room = await prisma.room.findFirst({
      where: { id: roomId, property: { ownerId: user.id } },
    });
    if (!room) return jsonError("Not found", 404);

    const urls: string[] = Array.isArray(body.photoUrls)
      ? body.photoUrls
      : body.url
        ? [body.url]
        : [];

    if (!urls.length) {
      return jsonError("At least one photo URL is required", 400);
    }

    await prisma.roomPhoto.createMany({
      data: urls.map((url) => ({ roomId, url })),
    });

    const photos = await prisma.roomPhoto.findMany({
      where: { roomId },
      orderBy: { createdAt: "asc" },
    });

    return jsonOk(photos, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to add room photos";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
