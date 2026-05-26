import { UserRole } from "@prisma/client";
import { routes } from "@/config/routes";

export function getHomeRouteForRole(role: UserRole) {
  if (role === UserRole.TENANT) {
    return routes.tenant.root;
  }
  return routes.dashboard.root;
}
