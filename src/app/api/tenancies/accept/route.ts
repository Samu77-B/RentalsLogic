import { auth } from "@clerk/nextjs/server";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { UserRole, TenancyStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return jsonError("Unauthorized", 401);

    const body = await request.json();
    const { token } = body;

    if (!token) return jsonError("Invite token required");

    const tenancy = await prisma.tenancy.findUnique({
      where: { inviteToken: token },
      include: { property: true },
    });

    if (!tenancy) return jsonError("Invalid invite token", 404);
    if (tenancy.status === TenancyStatus.ACTIVE) {
      return jsonError("Invite already accepted");
    }

    const clerkUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    let user = clerkUser;

    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: tenancy.tenantEmail,
          fullName: tenancy.tenantName,
          role: UserRole.TENANT,
        },
      });
    } else if (user.role === UserRole.LANDLORD) {
      await prisma.user.update({
        where: { id: user.id },
        data: { role: UserRole.TENANT },
      });
    }

    await prisma.tenancy.update({
      where: { id: tenancy.id },
      data: {
        tenantUserId: user.id,
        status: TenancyStatus.ACTIVE,
        inviteToken: null,
      },
    });

    return jsonOk({ success: true, propertyId: tenancy.propertyId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to accept invite";
    return jsonError(message, 500);
  }
}
