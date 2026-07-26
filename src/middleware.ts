import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/terms",
  "/privacy",
  "/tenant/accept(.*)",
  "/api/setup-check",
  "/api/stripe/webhook",
  "/api/tenancies/accept(.*)",
  "/manifest.webmanifest",
  "/sw.js",
]);

function isClerkConfigured() {
  return Boolean(
    process.env.CLERK_SECRET_KEY?.trim() &&
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
  );
}

const clerkHandler = clerkMiddleware(
  async (auth, request) => {
    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  },
  {
    // Default is 5s; local Windows clocks are often ~10–20s behind and break JWT nbf/iat checks
    clockSkewInMs: 60_000,
  }
);

export default function middleware(request: NextRequest, event: unknown) {
  if (request.nextUrl.pathname === "/api/setup-check") {
    const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
    return NextResponse.json({
      ok: isClerkConfigured(),
      clerkSecret: Boolean(process.env.CLERK_SECRET_KEY?.trim()),
      clerkPublic: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()),
      database: Boolean(databaseUrl),
      databaseLooksValid: databaseUrl.startsWith("postgresql://"),
      appUrl: process.env.NEXT_PUBLIC_APP_URL ?? null,
    });
  }

  if (!isClerkConfigured()) {
    return NextResponse.next();
  }

  return clerkHandler(request, event as Parameters<typeof clerkHandler>[1]);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
