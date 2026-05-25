import { NextResponse } from "next/server";

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  return NextResponse.json({
    ok: Boolean(
      process.env.CLERK_SECRET_KEY?.trim() &&
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
    ),
    clerkSecret: Boolean(process.env.CLERK_SECRET_KEY?.trim()),
    clerkPublic: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()),
    database: Boolean(databaseUrl),
    databaseLooksValid: databaseUrl.startsWith("postgresql://"),
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
  });
}
