import { getCurrentDbUser } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { getHomeRouteForRole } from "@/lib/home-route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentDbUser();
    if (!user) {
      return jsonError("Unauthorized", 401);
    }

    return jsonOk({
      role: user.role,
      email: user.email,
      fullName: user.fullName,
      homeRoute: getHomeRouteForRole(user.role),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return jsonError(message, 500);
  }
}
