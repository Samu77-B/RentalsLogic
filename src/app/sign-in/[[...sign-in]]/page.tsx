"use client";

import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/marketing/marketing-shell";

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
    card: "shadow-2xl shadow-black/25 border border-white/60 rounded-3xl bg-white/95 backdrop-blur-md",
    headerTitle: "font-heading text-2xl font-semibold tracking-tight",
    headerSubtitle: "text-neutral-500",
    socialButtons: "hidden",
    socialButtonsBlockButton: "hidden",
    dividerRow: "hidden",
    formButtonPrimary:
      "rounded-full bg-neutral-950 hover:bg-neutral-800 text-sm font-medium normal-case shadow-none",
    footerActionLink: "text-neutral-950 font-medium hover:text-neutral-700",
    formFieldInput: "rounded-xl border-black/10",
  },
} as const;

export default function SignInPage() {
  return (
    <AuthShell>
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <h1 className="font-heading text-3xl font-semibold tracking-tight drop-shadow-sm">
            Welcome back
          </h1>
          <p className="mt-2 text-white/80">
            Sign in to manage your properties and tenancies.
          </p>
        </div>
        <SignIn
          fallbackRedirectUrl="/auth/redirect"
          forceRedirectUrl="/auth/redirect"
          appearance={clerkAppearance}
        />
      </div>
    </AuthShell>
  );
}
