import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Outfit, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { PwaRegister } from "@/components/shared/pwa-register";
import { OfflineSync } from "@/components/shared/offline-sync";
import { SetupRequired, isClerkConfigured } from "@/components/shared/setup-required";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RentalsLogic — Property Management Platform",
  description:
    "Manage properties, inventories, tenants, inspections, maintenance, and compliance in one platform.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RentalsLogic",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isClerkConfigured()) {
    return (
      <html
        lang="en"
        className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col font-sans">
          <SetupRequired />
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/auth/redirect"
      signUpFallbackRedirectUrl="/auth/redirect"
    >
      <html
        lang="en"
        className={`${outfit.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col font-sans">
          <TooltipProvider>
            {children}
            <Toaster />
            <PwaRegister />
            <OfflineSync />
          </TooltipProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
