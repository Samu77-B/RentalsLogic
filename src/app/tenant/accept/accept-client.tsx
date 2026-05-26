"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = useAuth();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const returnUrl = token ? `/tenant/accept?token=${encodeURIComponent(token)}` : "/tenant/accept";

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !token || status !== "idle") return;

    setStatus("loading");
    fetch("/api/tenancies/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (r.ok) {
          setStatus("success");
          router.push("/tenant");
        } else {
          setStatus("error");
          setErrorMessage(data.error || "Failed to accept invitation.");
        }
      })
      .catch(() => {
        setStatus("error");
        setErrorMessage("Failed to accept invitation.");
      });
  }, [isLoaded, isSignedIn, token, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!token && <p>Invalid invitation link.</p>}

          {token && !isLoaded && <p>Loading...</p>}

          {token && isLoaded && !isSignedIn && (
            <>
              <p className="text-sm text-muted-foreground">
                Sign in or create an account with the email address your landlord invited.
                Use a different email if you already have a landlord account.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <SignInButton mode="modal" forceRedirectUrl={returnUrl}>
                  <Button className="w-full">Sign in</Button>
                </SignInButton>
                <SignUpButton mode="modal" forceRedirectUrl={returnUrl}>
                  <Button variant="outline" className="w-full">
                    Create account
                  </Button>
                </SignUpButton>
              </div>
            </>
          )}

          {token && isSignedIn && status === "loading" && (
            <p>Accepting invitation...</p>
          )}

          {status === "success" && <p>Redirecting to your portal...</p>}

          {status === "error" && (
            <>
              <p className="text-destructive">{errorMessage}</p>
              <Button className="mt-2" variant="outline" onClick={() => setStatus("idle")}>
                Try again
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
