"use client";

import useSWR from "swr";
import Link from "next/link";
import { Building2, Wrench, Award, Activity, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function DashboardOverview() {
  const { data, isLoading, error } = useSWR("/api/dashboard", fetcher);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-48 rounded-full bg-white/10" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-white/10 ring-1 ring-brand/15" />
          ))}
        </div>
        <div className="h-48 rounded-3xl bg-white/10 ring-1 ring-brand/15" />
      </div>
    );
  }

  if (error || data?.error) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-3xl bg-white p-8 text-center text-neutral-950 ring-1 ring-black/5">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          {data?.error ||
            "Could not load dashboard data. Check the database connection."}
        </p>
        <Button
          nativeButton={false}
          className="rounded-full"
          render={<Link href={routes.dashboard.properties} />}
        >
          Try properties
        </Button>
      </div>
    );
  }

  const propertyCount = data?.properties ?? 0;
  const tier = data?.membershipTier ?? "BASIC";
  const stats = [
    {
      label: "Properties",
      value: propertyCount,
      icon: Building2,
      href: routes.dashboard.properties,
      hint: "Manage portfolio",
    },
    {
      label: "Open maintenance",
      value: data?.openMaintenance ?? 0,
      icon: Wrench,
      href: routes.dashboard.maintenance,
      hint: "Jobs to action",
    },
    {
      label: "Certs expiring",
      value: data?.expiringCerts ?? 0,
      icon: Award,
      href: routes.dashboard.certificates,
      hint: "Next 30 days",
    },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium tracking-wide text-white/50 uppercase">
              Overview
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Dashboard
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-neutral-950">
                Plan: {tier}
              </span>
              {propertyCount === 0 && (
                <span className="text-sm text-white/55">
                  Add your first property to get started
                </span>
              )}
            </div>
          </div>

          <Button
            nativeButton={false}
            size="lg"
            className="h-11 rounded-full bg-white px-5 text-neutral-950 hover:bg-white/90"
            render={<Link href={routes.dashboard.properties} />}
          >
            <Plus className="size-4" />
            {propertyCount === 0 ? "Add property" : "Manage properties"}
          </Button>
        </div>
      </Reveal>

      {propertyCount === 0 && (
        <Reveal delay={80}>
          <div className="rounded-3xl bg-white/8 px-6 py-8 ring-1 ring-brand/20 sm:px-8">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Welcome to your landlord workspace
            </h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/65">
              Create a property, invite tenants, and run inspections — all from one
              calm place.
            </p>
            <Button
              nativeButton={false}
              size="lg"
              variant="secondary"
              className="mt-6 h-11 rounded-full bg-white text-neutral-950 hover:bg-white/90"
              render={<Link href={routes.dashboard.properties} />}
            >
              Create first property
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href, hint }, index) => (
          <Reveal key={label} delay={100 + index * 90}>
            <Link
              href={href}
              className={cn(
                "group flex h-full flex-col rounded-3xl bg-white p-5 text-neutral-950 ring-1 ring-brand/20 transition",
                "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-28px_rgba(0,0,0,0.55)]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-neutral-500">{label}</p>
                  <p className="mt-2 font-heading text-4xl font-semibold tracking-tight">
                    {value}
                  </p>
                </div>
                <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-[#f5f5f7] text-neutral-700 transition group-hover:bg-neutral-950 group-hover:text-white">
                  <Icon className="size-4" strokeWidth={1.75} />
                </span>
              </div>
              <p className="mt-4 flex items-center gap-1 text-sm text-neutral-500 transition group-hover:text-neutral-950">
                {hint}
                <ArrowRight className="size-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </p>
            </Link>
          </Reveal>
        ))}
      </div>

      <Reveal delay={280}>
        <section className="rounded-3xl bg-white p-5 text-neutral-950 ring-1 ring-brand/20 sm:p-6">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-neutral-500" strokeWidth={1.75} />
            <h2 className="text-base font-semibold tracking-tight">Recent activity</h2>
          </div>

          {!data?.recentActivity?.length ? (
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              Nothing here yet. Activity from properties, inspections, and tenants will
              show up as you work.
            </p>
          ) : (
            <ul className="mt-4 divide-y divide-black/5">
              {data.recentActivity.map(
                (log: {
                  id: string;
                  action: string;
                  entityType: string;
                  createdAt: string;
                }) => (
                  <li
                    key={log.id}
                    className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="capitalize text-neutral-800">
                      {log.action.replace(/_/g, " ")}
                      <span className="text-neutral-400"> · {log.entityType}</span>
                    </span>
                    <span className="shrink-0 text-neutral-500">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </span>
                  </li>
                )
              )}
            </ul>
          )}
        </section>
      </Reveal>
    </div>
  );
}
