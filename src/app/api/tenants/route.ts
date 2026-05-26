import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { tenancyInclude } from "@/lib/tenancy";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireLandlord();

    const tenancies = await prisma.tenancy.findMany({
      where: { property: { ownerId: user.id } },
      include: tenancyInclude,
      orderBy: { createdAt: "desc" },
    });

    return jsonOk(tenancies);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch tenants";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
