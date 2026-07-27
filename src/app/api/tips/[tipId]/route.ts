import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, formatApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ tipId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { tipId } = await params;
    const body = await request.json();

    const tip = await prisma.landlordTip.update({
      where: { id: tipId },
      data: {
        title: body.title?.trim(),
        body: body.body?.trim(),
        category: body.category === undefined ? undefined : body.category?.trim() || null,
        published: body.published,
        sortOrder: body.sortOrder,
      },
    });

    return jsonOk(tip);
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed to update tip");
    return jsonError(message, status);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { tipId } = await params;
    await prisma.landlordTip.delete({ where: { id: tipId } });
    return jsonOk({ success: true });
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed to delete tip");
    return jsonError(message, status);
  }
}
