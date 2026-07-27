"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SignInButton, SignUpButton, useAuth } from "@clerk/nextjs";
import useSWR from "swr";
import { MarketingFooter, MarketingHeader } from "@/components/marketing/marketing-shell";
import { Reveal } from "@/components/marketing/reveal";
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

const plans = [
  {
    name: "Basic",
    price: "9.99",
    properties: "3 properties",
  },
  {
    name: "Premium",
    price: "24.99",
    properties: "25 properties",
  },
  {
    name: "Enterprise",
    price: "49.99",
    properties: "Unlimited properties",
  },
] as const;

const planPerks = ["Full inspection reports", "Tenant portal"] as const;

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
      <SignInButton mode="redirect" forceRedirectUrl="/auth/redirect">
        <button type="button" className={`${outlineBtn} h-12 px-8 text-[15px]`}>
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="redirect" forceRedirectUrl="/auth/redirect">
        <button
          type="button"
          className="inline-flex h-12 items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 text-[15px] font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
        >
          Get started
        </button>
      </SignUpButton>
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
      <MarketingHeader variant={scrolled ? "light" : "overlay"} />

      <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-neutral-950 text-white">
        <HeroVideo />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/20" />

        <div
          className={`relative z-10 mx-auto w-full max-w-6xl px-6 pb-20 pt-32 transition duration-700 md:pb-28 ${
            ready ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          <Image
            src={brand.logoMark}
            alt="RentalsLogic"
            width={96}
            height={96}
            className="mb-8 h-16 w-16 object-contain md:h-20 md:w-20"
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

      <section className="border-b border-brand/20 bg-[#2c2c2e] py-24 text-white md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-sm font-medium tracking-wide text-white/50 uppercase">
              Everything in one place
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              Built for landlords who want clarity — and tenants who need simplicity.
            </h2>
          </Reveal>

          <div className="mt-16 grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {features.map((feature, index) => (
              <Reveal key={feature.title} delay={120 + index * 100}>
                <div className="mb-5 size-20 overflow-hidden rounded-xl ring-1 ring-white/10">
                  <Image
                    src={feature.icon}
                    alt=""
                    width={160}
                    height={160}
                    className="size-full rounded-xl object-cover"
                  />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-white/60">
                  {feature.desc}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f7] py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal from="left">
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
            </Reveal>
            <Reveal from="right" delay={140}>
              <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
                <Image
                  src={marketing.productInspections}
                  alt="Property inventory preview"
                  width={960}
                  height={720}
                  className="h-auto w-full object-cover"
                />
              </div>
            </Reveal>
          </div>

          <div className="mt-24 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal from="left" className="order-2 lg:order-1" delay={140}>
              <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] ring-1 ring-black/5">
                <Image
                  src={marketing.productInventory}
                  alt="Inspection workflow preview"
                  width={960}
                  height={720}
                  className="h-auto w-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal from="right" className="order-1 lg:order-2">
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
            </Reveal>
          </div>
        </div>
      </section>

      <section className="bg-[#2c2c2e] py-24 text-white md:py-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-sm font-medium tracking-wide text-white/50 uppercase">
              Plans
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
              Choose the plan that fits your portfolio.
            </h2>
            <p className="mt-4 max-w-xl text-lg text-white/60">
              Simple monthly pricing. Upgrade whenever you grow.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {plans.map((plan, index) => (
              <Reveal key={plan.name} delay={120 + index * 110}>
                <div className="flex h-full flex-col rounded-2xl bg-white p-6 text-neutral-950 shadow-[0_20px_50px_-28px_rgba(0,0,0,0.55)] ring-1 ring-black/5">
                  <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    £{plan.price}
                    <span className="text-sm font-normal text-neutral-500">/mo</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm text-neutral-600">
                    <li className="flex items-center gap-2">
                      <span className="inline-flex size-4 items-center justify-center text-neutral-950" aria-hidden>
                        ✓
                      </span>
                      {plan.properties}
                    </li>
                    {planPerks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2">
                        <span className="inline-flex size-4 items-center justify-center text-neutral-950" aria-hidden>
                          ✓
                        </span>
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <SignUpButton mode="redirect" forceRedirectUrl="/auth/redirect">
                    <button
                      type="button"
                      className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-neutral-900 text-sm font-medium text-white ring-1 ring-brand/40 transition hover:bg-neutral-800 hover:ring-brand/60"
                    >
                      Get started
                    </button>
                  </SignUpButton>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-neutral-950 py-28 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
        <Reveal className="relative mx-auto max-w-3xl px-6 text-center">
          <Image
            src={brand.logoMark}
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
        </Reveal>
      </section>

      <MarketingFooter />
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
        Get started
      </button>
    </SignUpButton>
  );
}
