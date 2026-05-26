import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { getCurrentDbUser } from "@/lib/auth";
import { routes } from "@/config/routes";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentDbUser();
  if (!user) {
    redirect(routes.auth.signIn);
  }

  if (user.role === UserRole.TENANT) {
    redirect(routes.tenant.root);
  }

  return children;
}
