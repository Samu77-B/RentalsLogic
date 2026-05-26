import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getCurrentDbUser } from "@/lib/auth";
import { routes } from "@/config/routes";

export default async function TenantPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentDbUser();
  if (!user) {
    redirect(routes.auth.signIn);
  }

  if (user.role === UserRole.LANDLORD) {
    redirect(routes.dashboard.root);
  }

  if (user.role !== UserRole.TENANT && user.role !== UserRole.ADMIN) {
    redirect(routes.dashboard.root);
  }

  return children;
}
