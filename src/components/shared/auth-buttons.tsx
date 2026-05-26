"use client";

import Link from "next/link";
import useSWR from "swr";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { swrFetcher } from "@/lib/swr";

type MeResponse = {
  homeRoute: string;
  role: string;
};

export function AuthButtons() {
  const { isSignedIn } = useAuth();
  const { data: me } = useSWR<MeResponse>(
    isSignedIn ? "/api/me" : null,
    swrFetcher
  );

  if (isSignedIn) {
    const href = me?.homeRoute ?? routes.dashboard.root;
    const label = me?.role === "TENANT" ? "My portal" : "Dashboard";

    return (
      <Link href={href}>
        <Button>{label}</Button>
      </Link>
    );
  }

  return (
    <>
      <SignInButton mode="modal" forceRedirectUrl="/auth/redirect">
        <Button variant="ghost">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal" forceRedirectUrl="/auth/redirect">
        <Button>Get started</Button>
      </SignUpButton>
    </>
  );
}

export function HeroCta() {
  const { isSignedIn } = useAuth();
  const { data: me } = useSWR<MeResponse>(
    isSignedIn ? "/api/me" : null,
    swrFetcher
  );

  if (isSignedIn) {
    const href = me?.homeRoute ?? routes.dashboard.root;
    const label = me?.role === "TENANT" ? "Go to my portal" : "Go to dashboard";

    return (
      <Link href={href}>
        <Button size="lg">{label}</Button>
      </Link>
    );
  }

  return (
    <SignUpButton mode="modal" forceRedirectUrl="/auth/redirect">
      <Button size="lg">Start free trial</Button>
    </SignUpButton>
  );
}
