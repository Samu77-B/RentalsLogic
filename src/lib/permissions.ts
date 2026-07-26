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
  try {
    return await prisma.property.findMany({
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
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("coverPhotoUrl")) throw error;

    const properties = await prisma.property.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        ownerId: true,
        propertyType: true,
        address: true,
        city: true,
        postcode: true,
        rentAmount: true,
        rentPeriod: true,
        region: true,
        createdAt: true,
        updatedAt: true,
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

    return properties.map((property) => ({
      ...property,
      coverPhotoUrl: null as string | null,
    }));
  }
}
