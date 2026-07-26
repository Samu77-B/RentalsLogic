"use client";

import Image from "next/image";
import Link from "next/link";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import { brand, marketing } from "@/lib/brand-assets";
import { routes } from "@/config/routes";
import { swrFetcher } from "@/lib/swr";

type MeResponse = { homeRoute: string; role: string };

export function MarketingHeader({
  variant = "light",
}: {
  variant?: "light" | "overlay";
}) {
  const light = variant === "light";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        light
          ? "border-b border-black/5 bg-[#f5f5f7]/95 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-5 md:px-6">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src={light ? brand.logoGreyLandscape : brand.logoWhiteLandscape}
            alt="RentalsLogic"
            width={222}
            height={54}
            className="h-12 w-auto"
            priority
          />
        </Link>
        <div className="shrink-0">
          <MarketingNav light={light} />
        </div>
      </div>
    </header>
  );
}

function MarketingNav({ light }: { light: boolean }) {
  const { isSignedIn } = useAuth();
  const { data: me } = useSWR<MeResponse>(isSignedIn ? "/api/me" : null, swrFetcher);

  if (isSignedIn) {
    const href = me?.homeRoute ?? routes.dashboard.root;
    const label = me?.role === "TENANT" ? "My portal" : "Dashboard";
    return (
      <Link
        href={href}
        className={
          light
            ? "inline-flex h-9 items-center rounded-full border border-neutral-900 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
            : "inline-flex h-9 items-center rounded-full border border-white bg-transparent px-4 text-sm font-medium text-white transition hover:bg-white/10"
        }
      >
        {label}
      </Link>
    );
  }

  if (light) {
    return (
      <div className="flex items-center gap-3">
        <SignInButton mode="redirect" forceRedirectUrl="/auth/redirect">
          <button
            type="button"
            className="px-1 text-sm font-medium text-neutral-600 transition hover:text-neutral-950"
          >
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="redirect" forceRedirectUrl="/auth/redirect">
          <button
            type="button"
            className="inline-flex h-9 items-center rounded-full border border-neutral-900 bg-neutral-900 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
          >
            Get started
          </button>
        </SignUpButton>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <SignInButton mode="redirect" forceRedirectUrl="/auth/redirect">
        <button type="button" className="px-1 text-sm font-medium text-white/90 hover:text-white">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="redirect" forceRedirectUrl="/auth/redirect">
        <button
          type="button"
          className="inline-flex h-9 items-center rounded-full border border-white bg-transparent px-4 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Get started
        </button>
      </SignUpButton>
    </div>
  );
}

export function MarketingFooter({
  variant = "solid",
}: {
  variant?: "solid" | "glass";
}) {
  const glass = variant === "glass";

  return (
    <footer
      className={`relative z-20 mt-auto shrink-0 border-t border-white/10 py-10 text-center text-sm text-white/65 ${
        glass
          ? "bg-[#2c2c2e]/90 backdrop-blur-xl"
          : "bg-[#2c2c2e]"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6">
        <Image
          src={brand.logoWhiteLandscape}
          alt="RentalsLogic"
          width={140}
          height={34}
          className="mx-auto h-7 w-auto opacity-90"
        />
        <p className="mt-6">
          Tenants: use the invitation link in your email to access your portal.
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} RentalsLogic. All rights reserved.
        </p>
        <p className="mt-2">
          Website designed, built and maintained by{" "}
          <a
            href="https://paradigmstudio.net/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-2 hover:text-white/90"
          >
            Paradigm Studio
          </a>
        </p>
      </div>
    </footer>
  );
}

/** Shared chrome for marketing pages (header + footer). */
export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-[#f5f5f7] text-neutral-950">
      <MarketingHeader variant="light" />
      <main className="flex flex-1 flex-col pt-16">{children}</main>
      <MarketingFooter />
    </div>
  );
}

/** Sign-in / sign-up shell with full-bleed photo background. */
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col text-neutral-950">
      <section className="relative flex min-h-[100vh] flex-col">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <Image
            src={marketing.authBackground}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-neutral-950/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/50 via-transparent to-neutral-950/70" />
        </div>

        <MarketingHeader variant="overlay" />
        <main className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-12 pt-24">
          {children}
        </main>
      </section>
      <MarketingFooter variant="glass" />
    </div>
  );
}
