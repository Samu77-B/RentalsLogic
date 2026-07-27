import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { sendLandlordWelcomeEmail } from "./email";
import { prisma } from "./prisma";

function dashboardUrl() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/dashboard`;
}

export async function getCurrentDbUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  try {
    let user = await prisma.user.findUnique({ where: { clerkId: userId } });

    if (!user) {
      const role =
        (clerkUser.publicMetadata?.role as UserRole) ||
        UserRole.LANDLORD;

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
          fullName: clerkUser.fullName ?? clerkUser.firstName ?? null,
          role,
        },
      });

      if (role === UserRole.LANDLORD && user.email) {
        const name = user.fullName || user.email.split("@")[0] || "there";
        void sendLandlordWelcomeEmail({
          to: user.email,
          name,
          dashboardUrl: dashboardUrl(),
        }).catch((err) => console.error("Landlord welcome email failed:", err));
      }
    } else {
      // Keep ADMIN in sync if Clerk publicMetadata is updated later.
      const metaRole = clerkUser.publicMetadata?.role as UserRole | undefined;
      if (metaRole === UserRole.ADMIN && user.role !== UserRole.ADMIN) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: UserRole.ADMIN },
        });
      }
    }

    return user;
  } catch (error) {
    console.error("getCurrentDbUser failed:", error);
    throw error;
  }
}

export async function requireAuth() {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireLandlord() {
  const user = await requireAuth();
  if (user.role !== UserRole.LANDLORD && user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireTenant() {
  const user = await requireAuth();
  if (user.role !== UserRole.TENANT && user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== UserRole.ADMIN) {
    throw new Error("Forbidden");
  }
  return user;
}
