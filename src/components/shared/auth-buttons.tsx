"use client";

import Link from "next/link";
import { useAuth, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Link href="/dashboard">
        <Button>Dashboard</Button>
      </Link>
    );
  }

  return (
    <>
      <SignInButton mode="modal">
        <Button variant="ghost">Sign in</Button>
      </SignInButton>
      <SignUpButton mode="modal">
        <Button>Get started</Button>
      </SignUpButton>
    </>
  );
}

export function HeroCta() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <Link href="/dashboard">
        <Button size="lg">Go to dashboard</Button>
      </Link>
    );
  }

  return (
    <SignUpButton mode="modal">
      <Button size="lg">Start free trial</Button>
    </SignUpButton>
  );
}
