import { NewsCategory } from "@prisma/client";
import { requireAdmin, requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk, formatApiError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireLandlord();
    const category = new URL(request.url).searchParams.get("category");

    const articles = await prisma.newsArticle.findMany({
      where: {
        ...(user.role === "ADMIN" ? {} : { published: true }),
        ...(category && Object.values(NewsCategory).includes(category as NewsCategory)
          ? { category: category as NewsCategory }
          : {}),
      },
      orderBy: { publishedAt: "desc" },
    });

    return jsonOk({ articles, isAdmin: user.role === "ADMIN" });
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed to load news");
    return jsonError(message, status);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    if (!body.title?.trim() || !body.summary?.trim()) {
      return jsonError("Title and summary are required", 400);
    }

    const category =
      body.category && Object.values(NewsCategory).includes(body.category)
        ? (body.category as NewsCategory)
        : NewsCategory.UK_NEWS;

    const article = await prisma.newsArticle.create({
      data: {
        title: body.title.trim(),
        summary: body.summary.trim(),
        body: body.body?.trim() || null,
        category,
        sourceName: body.sourceName?.trim() || null,
        sourceUrl: body.sourceUrl?.trim() || null,
        published: body.published ?? true,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
        authorId: admin.id,
      },
    });

    return jsonOk(article, 201);
  } catch (error) {
    const { message, status } = formatApiError(error, "Failed to create article");
    return jsonError(message, status);
  }
}
