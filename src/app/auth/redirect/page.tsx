import { redirect } from "next/navigation";
import { getCurrentDbUser } from "@/lib/auth";
import { getHomeRouteForRole } from "@/lib/home-route";

export default async function AuthRedirectPage() {
  const user = await getCurrentDbUser();
  if (!user) {
    redirect("/sign-in");
  }

  redirect(getHomeRouteForRole(user.role));
}
