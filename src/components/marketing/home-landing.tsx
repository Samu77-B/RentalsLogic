"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import { AuthButtons } from "@/components/shared/auth-buttons";
import { brand, icons, marketing } from "@/lib/brand-assets";
import { routes } from "@/config/routes";
import { swrFetcher } from "@/lib/swr";

const features = [
  {
    title: "Property & inventory",
    desc: "Rooms, items, and photos — condition tracked with clarity.",
    icon: icons.property,
  },
  {
    title: "Inspection reports",
    desc: "Check-in to check-out, with side-by-side comparison.",
    icon: icons.documents,
  },
  {
    title: "Tenant portal",
    desc: "Review, comment, approve, and e-sign in one place.",
    icon: icons.tenant,
  },
  {
    title: "Meters & compliance",
    desc: "Readings, certificates, and maintenance without the paperwork.",
    icon: icons.meters,
  },
];

type MeResponse = { homeRoute: string; role: string };

const outlineBtn =
  "inline-flex items-center justify-center rounded-full border border-white bg-transparent font-medium text-white transition hover:bg-white/10";

function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;

    const tryPlay = () => {
      void video.play().catch(() => {
        // Autoplay can fail until interaction; muted + playsInline usually succeeds.
      });
    };

    tryPlay();
    video.addEventListener("loadeddata", tryPlay);
    video.addEventListener("canplay", tryPlay);
    return () => {
      video.removeEventListener("loadeddata", tryPlay);
      video.removeEventListener("canplay", tryPlay);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className="absolute inset-0 h-full w-full object-cover"
      src="/images/hero/hero.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden
    />
  );
}

function HeroActions() {
  const { isSignedIn } = useAuth();
  const { data: me } = useSWR<MeResponse>(isSignedIn ? "/api/me" : null, swrFetcher);

  if (isSignedIn) {
    const href = me?.homeRoute ?? routes.dashboard.root;
    const label = me?.role === "TENANT" ? "Go to my portal" : "Go to dashboard";
    return (
      <Link href={href} className={`${outlineBtn} h-12 px-8 text-[15px]`}>
        {label}
      </Link>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <SignUpButton mode="redirect" forceRedirectUrl="/auth/redirect">
        <button type="button" className={`${outlineBtn} h-12 px-8 text-[15px]`}>
          Start free trial
        </button>
      </SignUpButton>
      <SignInButton mode="redirect" forceRedirectUrl="/auth/redirect">
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 text-[15px] font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
        >
          Sign in
        </button>
      </SignInButton>
    </div>
  );
}

export function HomeLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-neutral-950">
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-black/5 bg-[#f5f5f7]/80 backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <div className="flex h-16 w-full items-center justify-between px-4 sm:px-5 md:px-6">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={scrolled ? brand.logoGreyLandscape : brand.logoWhiteLandscape}
              alt="RentalsLogic"
              width={222}
              height={54}
              className="h-12 w-auto"
              priority
            />
          </Link>
          <div className="shrink-0">
            {scrolled ? <AuthButtons /> : <HeaderAuthLight />}
          </div>
        </div>
      </header>

      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-neutral-950 text-white">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />

        <div
          className={`relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-32 transition duration-700 md:pb-28 ${
            ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Image
            src={brand.logoWhiteLandscape}
            alt="RentalsLogic"
            width={330}
            height={78}
            className="mb-8 h-[3.75rem] w-auto md:h-[4.5rem]"
            priority
          />
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl md:text-6xl md:leading-[1.05]">
            Property management, refined.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/75 md:text-xl">
            Inventories, inspections, tenants, and compliance — in one calm workspace.
          </p>
          <div className="mt-9">
            <HeroActions />
          </div>
        </div>
      </section>

      <section className="border-b border-black/5 bg-white py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
            Everything in one place
          </p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Built for landlords who want clarity — and tenants who need simplicity.
          </h2>

          <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`transition duration-700 ${
                  ready ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                }`}
                style={{ transitionDelay: `${150 + index * 80}ms` }}
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f5f7]">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={36}
                    height={36}
                    className="h-9 w-9 object-contain"
                  />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-neutral-500">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f7] py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
                Inventory
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Capture every room with precision.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-neutral-500">
                Photo-backed inventories that stay organised — so move-in and move-out
                feel effortless.
              </p>
            </div>
            <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
              <Image
                src={marketing.productInspections}
                alt="Property inventory preview"
                width={960}
                height={720}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>

          <div className="mt-24 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/5 lg:order-1">
              <Image
                src={marketing.productInventory}
                alt="Inspection workflow preview"
                width={960}
                height={720}
                className="h-auto w-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-sm font-medium tracking-wide text-neutral-500 uppercase">
                Inspections
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Reports tenants can review and sign.
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-neutral-500">
                Share check-in and check-out reports, collect comments, and capture
                e-signatures without chasing paperwork.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-neutral-950 py-28 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Image
            src={brand.logoWhite}
            alt=""
            width={72}
            height={72}
            className="mx-auto h-14 w-14 object-contain"
          />
          <h2 className="mt-8 text-3xl font-semibold tracking-tight text-balance md:text-5xl">
            Ready when you are.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-white/65">
            Set up your first property in minutes. Invite tenants when you&apos;re ready.
          </p>
          <div className="mt-10 flex justify-center">
            <HeroCtaDark />
          </div>
        </div>
      </section>

      <footer className="border-t border-black/5 bg-white py-12 text-center text-sm text-neutral-500">
        <div className="mx-auto max-w-6xl px-6">
          <Image
            src={brand.logoGreyLandscape}
            alt="RentalsLogic"
            width={140}
            height={34}
            className="mx-auto h-7 w-auto opacity-80"
          />
          <p className="mt-6">Tenants: use the invitation link in your email to access your portal.</p>
          <p className="mt-2">© {new Date().getFullYear()} RentalsLogic. All rights reserved.</p>
          <p className="mt-2">
            Website designed, built and maintained by{" "}
            <a
              href="https://paradigmstudio.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-800 underline underline-offset-2 hover:text-neutral-950"
            >
              Paradigm Studio
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function HeaderAuthLight() {
  const { isSignedIn } = useAuth();
  const { data: me } = useSWR<MeResponse>(isSignedIn ? "/api/me" : null, swrFetcher);

  if (isSignedIn) {
    const href = me?.homeRoute ?? routes.dashboard.root;
    const label = me?.role === "TENANT" ? "My portal" : "Dashboard";
    return (
      <Link href={href} className={`${outlineBtn} h-9 px-4 text-sm`}>
        {label}
      </Link>
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
        <button type="button" className={`${outlineBtn} h-9 px-4 text-sm`}>
          Get started
        </button>
      </SignUpButton>
    </div>
  );
}

function HeroCtaDark() {
  const { isSignedIn } = useAuth();
  const { data: me } = useSWR<MeResponse>(isSignedIn ? "/api/me" : null, swrFetcher);

  if (isSignedIn) {
    return (
      <Link
        href={me?.homeRoute ?? routes.dashboard.root}
        className={`${outlineBtn} h-12 px-8 text-[15px]`}
      >
        {me?.role === "TENANT" ? "Open portal" : "Open dashboard"}
      </Link>
    );
  }

  return (
    <SignUpButton mode="redirect" forceRedirectUrl="/auth/redirect">
      <button type="button" className={`${outlineBtn} h-12 px-8 text-[15px]`}>
        Start free trial
      </button>
    </SignUpButton>
  );
}
