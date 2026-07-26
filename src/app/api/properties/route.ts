import { NextResponse } from "next/server";
import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk, formatApiError } from "@/lib/api";
import { getPropertyLimit } from "@/lib/stripe";
import { getLandlordProperties } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { PropertyType, RentPeriod } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await requireLandlord();
    const properties = await getLandlordProperties(user.id);
    return jsonOk(properties);
  } catch (error) {
    console.error("GET /api/properties failed:", error);
    const { message, status } = formatApiError(error, "Failed to fetch properties");
    return jsonError(message, status);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireLandlord();
    const body = await request.json();

    const count = await prisma.property.count({ where: { ownerId: user.id } });
    const limit = getPropertyLimit(user.membershipTier);
    if (count >= limit) {
      return jsonError(`Property limit reached for ${user.membershipTier} plan`, 403);
    }

    const property = await prisma.property.create({
      data: {
        ownerId: user.id,
        propertyType: body.propertyType as PropertyType,
        address: body.address,
        city: body.city,
        postcode: body.postcode,
        rentAmount: body.rentAmount,
        rentPeriod: (body.rentPeriod as RentPeriod) ?? RentPeriod.MONTHLY,
        region: body.region ?? "england",
        coverPhotoUrl: body.coverPhotoUrl || null,
      },
    });

    return jsonOk(property, 201);
  } catch (error) {
    console.error("POST /api/properties failed:", error);
    const { message, status } = formatApiError(error, "Failed to create property");
    return jsonError(message, status);
  }
}
