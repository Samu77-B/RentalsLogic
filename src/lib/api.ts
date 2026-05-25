import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function formatApiError(
  error: unknown,
  fallback = "Something went wrong"
): { message: string; status: number } {
  if (error instanceof Error) {
    if (error.message === "Unauthorized") {
      return { message: error.message, status: 401 };
    }
    if (error.message === "Forbidden") {
      return {
        message:
          "This account is registered as a tenant. Sign up with a different email for the landlord dashboard.",
        status: 403,
      };
    }
    if (
      error.message.includes("Can't reach database") ||
      error.message.includes("P1001")
    ) {
      return {
        message: "Database connection failed. Check DATABASE_URL on Vercel.",
        status: 500,
      };
    }
    if (
      error.message.includes("must start with the protocol `postgresql://`") ||
      error.message.includes("must start with the protocol postgresql://")
    ) {
      return {
        message:
          "DATABASE_URL is invalid. Use the Supabase Postgres URI (postgresql://...), not the https:// project URL.",
        status: 500,
      };
    }
    return { message: error.message, status: 500 };
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2021") {
      return {
        message:
          "Database tables not set up. Run npm run db:push against your Supabase database.",
        status: 500,
      };
    }
  }

  return { message: fallback, status: 500 };
}

export async function parseBody<T>(request: Request): Promise<T> {
  return request.json() as Promise<T>;
}
