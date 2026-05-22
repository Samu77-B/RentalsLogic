"use client";

import useSWR from "swr";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MEMBERSHIP_PLANS } from "@/lib/stripe";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function BillingPanel() {
  const { data, mutate } = useSWR("/api/stripe/checkout", fetcher);

  async function subscribe(tier: string) {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier }),
    });
    const result = await res.json();
    if (result.url) window.location.href = result.url;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Billing</h2>
        <p className="text-muted-foreground">
          Current plan: <Badge>{data?.tier ?? "BASIC"}</Badge>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {Object.values(MEMBERSHIP_PLANS).map((plan) => (
          <Card key={plan.tier} className={data?.tier === plan.tier ? "border-primary" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-2xl font-bold">£{plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
            </CardHeader>
            <CardContent>
              <ul className="mb-4 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  {plan.propertyLimit === Infinity ? "Unlimited" : plan.propertyLimit} properties
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Full inspection reports
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary" />
                  Tenant portal
                </li>
              </ul>
              <Button
                className="w-full"
                variant={data?.tier === plan.tier ? "secondary" : "default"}
                disabled={data?.tier === plan.tier || !plan.priceId}
                onClick={() => subscribe(plan.tier)}
              >
                {data?.tier === plan.tier ? "Current plan" : "Subscribe"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
