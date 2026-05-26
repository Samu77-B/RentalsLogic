import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  const usesPooler =
    databaseUrl.includes(":6543/") || databaseUrl.includes("pooler.supabase.com");
  const hasPgbouncer = databaseUrl.includes("pgbouncer=true");

  let databaseConnected = false;
  let databaseError: string | null = null;

  if (databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://")) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      databaseConnected = true;
    } catch (error) {
      databaseError = error instanceof Error ? error.message.split("\n")[0] : "Connection failed";
    }
  }

  return NextResponse.json({
    ok: Boolean(
      process.env.CLERK_SECRET_KEY?.trim() &&
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
        databaseConnected
    ),
    clerkSecret: Boolean(process.env.CLERK_SECRET_KEY?.trim()),
    clerkPublic: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()),
    database: Boolean(databaseUrl),
    databaseLooksValid: databaseUrl.startsWith("postgresql://") || databaseUrl.startsWith("postgres://"),
    usesPooler,
    hasPgbouncer,
    databaseConnected,
    databaseError,
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  });
}
