"use client";

import Image from "next/image";
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
  BookOpen,
  Lightbulb,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";
import { brand } from "@/lib/brand-assets";

const navItems = [
  { href: routes.dashboard.root, label: "Overview", icon: LayoutDashboard },
  {
    href: routes.dashboard.properties,
    label: "Properties",
    icon: Building2,
    highlight: true,
  },
  { href: routes.dashboard.tenants, label: "Tenants", icon: Users },
  { href: routes.dashboard.inspections, label: "Inspections", icon: ClipboardList },
  { href: routes.dashboard.maintenance, label: "Maintenance", icon: Wrench },
  { href: routes.dashboard.certificates, label: "Certificates", icon: Award },
  { href: routes.dashboard.billing, label: "Billing", icon: CreditCard },
  { href: routes.dashboard.howTo, label: "How to", icon: BookOpen },
  { href: routes.dashboard.tips, label: "Tips", icon: Lightbulb },
  { href: routes.dashboard.news, label: "News", icon: Newspaper },
  { href: routes.dashboard.settings, label: "Settings", icon: Settings },
];

export function DashboardNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex h-full flex-col gap-1 p-4", className)}>
      <div className="mb-6 px-2">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 transition opacity-90 hover:opacity-100"
        >
          <Image
            src={brand.logoMark}
            alt="RentalsLogic"
            width={36}
            height={36}
            className="size-9 object-contain"
            priority
          />
          <div className="min-w-0">
            <p className="font-heading text-base font-semibold tracking-tight text-white">
              RentalsLogic
            </p>
            <p className="text-xs text-white/50">Landlord portal</p>
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === routes.dashboard.root
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-white text-neutral-950 shadow-sm ring-1 ring-brand/45"
                  : item.highlight
                    ? "bg-brand/15 text-white ring-1 ring-brand/40 hover:bg-brand/25"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
