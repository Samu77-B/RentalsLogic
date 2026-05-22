"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  ClipboardList,
  Wrench,
  Award,
  CreditCard,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

const navItems = [
  { href: routes.dashboard.root, label: "Overview", icon: LayoutDashboard },
  { href: routes.dashboard.properties, label: "Properties", icon: Building2 },
  { href: routes.dashboard.tenants, label: "Tenants", icon: Users },
  { href: routes.dashboard.inspections, label: "Inspections", icon: ClipboardList },
  { href: routes.dashboard.maintenance, label: "Maintenance", icon: Wrench },
  { href: routes.dashboard.certificates, label: "Certificates", icon: Award },
  { href: routes.dashboard.billing, label: "Billing", icon: CreditCard },
  { href: routes.dashboard.settings, label: "Settings", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 p-4">
      <div className="mb-6 px-2">
        <Link href="/" className="text-lg font-bold text-primary">
          RentalsLogic
        </Link>
        <p className="text-xs text-muted-foreground">Landlord Portal</p>
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
