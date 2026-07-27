import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { landlordHowToSections } from "@/lib/landlord-how-to";

export default function HowToPage() {
  return (
    <DashboardShell>
      <div className="space-y-8">
        <div>
          <p className="text-sm font-medium tracking-wide text-white/50 uppercase">
            Guide
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white md:text-4xl">
            How to use RentalsLogic
          </h1>
          <p className="mt-3 max-w-2xl text-white/60">
            A clear walkthrough of what you can do in the landlord dashboard — from
            adding properties to inviting tenants and tracking compliance.
          </p>
        </div>

        <div className="grid gap-4">
          {landlordHowToSections.map((section, index) => (
            <section
              key={section.title}
              className="rounded-3xl bg-white p-6 text-neutral-950 ring-1 ring-black/5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-wide text-neutral-400 uppercase">
                    Step {index + 1}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-tight">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-[15px] leading-relaxed text-neutral-600">
                    {section.summary}
                  </p>
                </div>
                {section.href && (
                  <Link
                    href={section.href}
                    className="inline-flex h-9 items-center rounded-full bg-neutral-950 px-4 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    {section.hrefLabel ?? "Open"}
                  </Link>
                )}
              </div>
              <ul className="mt-5 space-y-2 text-sm text-neutral-700">
                {section.steps.map((step) => (
                  <li key={step} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-neutral-950" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
