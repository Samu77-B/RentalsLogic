import { NewsCategory } from "@prisma/client";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, formatApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ articleId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { articleId } = await params;
    const body = await request.json();

    const article = await prisma.newsArticle.update({
      where: { id: articleId },
      data: {
        title: body.title?.trim(),
        summary: body.summary?.trim(),
        body: body.body === undefined ? undefined : body.body?.trim() || null,
        category:
          body.category && Object.values(NewsCategory).includes(body.category)
            ? (body.category as NewsCategory)
            : undefined,
        sourceName:
          body.sourceName === undefined ? undefined : body.sourceName?.trim() || null,
        sourceUrl:
          body.sourceUrl === undefined ? undefined : body.sourceUrl?.trim() || null,
        published: body.published,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : undefined,
      },
    });

    return jsonOk(article);
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed to update article");
    return jsonError(message, status);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdmin();
    const { articleId } = await params;
    await prisma.newsArticle.delete({ where: { id: articleId } });
    return jsonOk({ success: true });
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed to delete article");
    return jsonError(message, status);
  }
}
