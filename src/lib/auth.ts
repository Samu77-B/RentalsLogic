import { auth, currentUser } from "@clerk/nextjs/server";
import { UserRole } from "@prisma/client";
import { prisma } from "./prisma";

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
