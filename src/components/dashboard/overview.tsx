"use client";

import useSWR from "swr";
import Link from "next/link";
import { Building2, Wrench, Award, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function DashboardOverview() {
  const { data, isLoading } = useSWR("/api/dashboard", fetcher);

  if (isLoading) return <p className="text-muted-foreground">Loading dashboard...</p>;

  const stats = [
    { label: "Properties", value: data?.properties ?? 0, icon: Building2, href: routes.dashboard.properties },
    { label: "Open maintenance", value: data?.openMaintenance ?? 0, icon: Wrench, href: routes.dashboard.maintenance },
    { label: "Certs expiring (30d)", value: data?.expiringCerts ?? 0, icon: Award, href: routes.dashboard.certificates },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Plan: {data?.membershipTier ?? "BASIC"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" /> Recent activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.recentActivity?.length ? (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          ) : (
            <ul className="space-y-2">
              {data.recentActivity.map((log: {
                id: string;
                action: string;
                entityType: string;
                createdAt: string;
              }) => (
                <li key={log.id} className="flex justify-between text-sm">
                  <span>{log.action.replace(/_/g, " ")} — {log.entityType}</span>
                  <span className="text-muted-foreground">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Button render={<Link href={routes.dashboard.properties} />}>
        Manage properties
      </Button>
    </div>
  );
}
