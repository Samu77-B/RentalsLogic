"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";

export default function AuthRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12_000);

    fetch("/api/me", { signal: controller.signal, cache: "no-store" })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Could not load your account.");
        }
        router.replace(data.homeRoute || routes.dashboard.root);
      })
      .catch((err) => {
        const message =
          err instanceof Error && err.name === "AbortError"
            ? "Connection timed out. Check your database URL or network, then try again."
            : err instanceof Error
              ? err.message
              : "Sign-in could not be completed.";
        setError(message);
        window.setTimeout(() => router.replace(routes.dashboard.root), 3000);
      })
      .finally(() => window.clearTimeout(timeout));
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      {!error ? (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Signing you in...</p>
        </>
      ) : (
        <>
          <p className="text-destructive">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </>
      )}
    </div>
  );
}
