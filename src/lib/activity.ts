import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export async function logActivity({
  userId,
  propertyId,
  action,
  entityType,
  entityId,
  metadata,
  ipAddress,
}: {
  userId: string;
  propertyId?: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  await prisma.activityLog.create({
    data: {
      userId,
      propertyId,
      action,
      entityType,
      entityId,
      metadata: metadata as Prisma.InputJsonValue | undefined,
      ipAddress,
    },
  });
}
