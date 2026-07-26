import { prisma } from "./prisma";

export async function canAccessProperty(userId: string, propertyId: string) {
  const property = await prisma.property.findFirst({
    where: {
      id: propertyId,
      OR: [
        { ownerId: userId },
        {
          tenancies: {
            some: {
              tenantUserId: userId,
              status: { in: ["ACTIVE", "PENDING"] },
            },
          },
        },
      ],
    },
  });
  return !!property;
}

export async function isPropertyOwner(userId: string, propertyId: string) {
  const property = await prisma.property.findFirst({
    where: { id: propertyId, ownerId: userId },
  });
  return !!property;
}

export async function getTenantProperties(userId: string) {
  return prisma.property.findMany({
    where: {
      tenancies: {
        some: {
          tenantUserId: userId,
          status: { in: ["ACTIVE", "PENDING"] },
        },
      },
    },
    include: {
      tenancies: {
        where: { tenantUserId: userId },
      },
    },
  });
}

export async function getLandlordProperties(userId: string) {
  return prisma.property.findMany({
    where: { ownerId: userId },
    include: {
      _count: {
        select: {
          rooms: true,
          tenancies: true,
          maintenanceRequests: {
            where: { status: { in: ["OPEN", "IN_PROGRESS"] } },
          },
          certificates: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
