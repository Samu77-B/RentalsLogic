"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ClipboardList,
  Wrench,
  FileText,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

const navItems = [
  { href: routes.tenant.root, label: "Home", icon: Home },
  { href: routes.tenant.reports, label: "Reports", icon: ClipboardList },
  { href: routes.tenant.maintenance, label: "Maintenance", icon: Wrench },
  { href: routes.tenant.documents, label: "Documents", icon: FileText },
  { href: routes.tenant.meters, label: "Meters", icon: Gauge },
];

export function TenantNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
      <div className="mb-6 px-2">
        <Link href="/" className="text-lg font-bold text-primary">
          RentalsLogic
        </Link>
        <p className="text-xs text-muted-foreground">Tenant Portal</p>
      </div>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
