"use client";

import { SignIn } from "@clerk/nextjs";
import { MarketingShell } from "@/components/marketing/marketing-shell";

const clerkAppearance = {
  variables: {
    colorPrimary: "#171717",
    colorText: "#171717",
    colorTextSecondary: "#737373",
    colorBackground: "#ffffff",
    colorInputBackground: "#ffffff",
    colorInputText: "#171717",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-outfit), ui-sans-serif, system-ui, sans-serif",
  },
  elements: {
    rootBox: "mx-auto w-full max-w-[420px]",
    card: "shadow-none border border-black/5 rounded-3xl bg-white",
    headerTitle: "text-2xl font-semibold tracking-tight",
    headerSubtitle: "text-neutral-500",
    socialButtonsBlockButton:
      "border border-black/10 rounded-full hover:bg-neutral-50",
    formButtonPrimary:
      "rounded-full bg-neutral-950 hover:bg-neutral-800 text-sm font-medium normal-case shadow-none",
    footerActionLink: "text-neutral-950 font-medium hover:text-neutral-700",
    formFieldInput: "rounded-xl border-black/10",
  },
} as const;

export default function SignInPage() {
  return (
    <MarketingShell>
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-2 text-neutral-500">
              Sign in to manage your properties and tenancies.
            </p>
          </div>
          <SignIn
            fallbackRedirectUrl="/auth/redirect"
            forceRedirectUrl="/auth/redirect"
            appearance={clerkAppearance}
          />
        </div>
      </div>
    </MarketingShell>
  );
}
