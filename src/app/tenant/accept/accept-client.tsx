"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TenantShell } from "@/components/layout/tenant-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (!token) return;
    setStatus("loading");
    fetch("/api/tenancies/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => {
        if (r.ok) {
          setStatus("success");
          router.push("/tenant");
        } else {
          setStatus("error");
        }
      })
      .catch(() => setStatus("error"));
  }, [token, router]);

  return (
    <TenantShell>
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Accept invitation</CardTitle>
        </CardHeader>
        <CardContent>
          {!token && <p>Invalid invitation link.</p>}
          {status === "loading" && <p>Accepting invitation...</p>}
          {status === "success" && <p>Redirecting to your portal...</p>}
          {status === "error" && (
            <>
              <p className="text-destructive">Failed to accept invitation.</p>
              <Button className="mt-4" onClick={() => router.push("/tenant")}>
                Go to portal
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </TenantShell>
  );
}
