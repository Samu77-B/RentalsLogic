"use client";

import { SWRConfig } from "swr";
import { swrDefaults } from "@/lib/swr";

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={swrDefaults}>{children}</SWRConfig>;
}
