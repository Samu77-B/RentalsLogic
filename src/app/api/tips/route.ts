import { requireAdmin, requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk, formatApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireLandlord();
    const tips = await prisma.landlordTip.findMany({
      where: user.role === "ADMIN" ? undefined : { published: true },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    });
    return jsonOk({ tips, isAdmin: user.role === "ADMIN" });
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed to load tips");
    return jsonError(message, status);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    if (!body.title?.trim() || !body.body?.trim()) {
      return jsonError("Title and body are required", 400);
    }

    const tip = await prisma.landlordTip.create({
      data: {
        title: body.title.trim(),
        body: body.body.trim(),
        category: body.category?.trim() || null,
        published: body.published ?? true,
        sortOrder: Number.isFinite(body.sortOrder) ? body.sortOrder : 0,
        authorId: admin.id,
      },
    });

    return jsonOk(tip, 201);
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed to create tip");
    return jsonError(message, status);
  }
}
