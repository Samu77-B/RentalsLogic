import { Building2, ClipboardCheck, Users, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthButtons, HeroCta } from "@/components/shared/auth-buttons";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <span className="text-xl font-bold text-primary">RentalsLogic</span>
          <div className="flex items-center gap-3">
            <AuthButtons />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Property management for landlords and tenants
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Inventories, inspections, meter readings, e-signatures, maintenance,
            and compliance — better than paper, better than the rest.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <HeroCta />
          </div>
        </section>

        <section className="border-t bg-muted/30 py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Building2,
                title: "Property & inventory",
                desc: "Rooms, items, photos, and condition tracking",
              },
              {
                icon: ClipboardCheck,
                title: "Inspection reports",
                desc: "Check-in, interim, check-out with side-by-side compare",
              },
              {
                icon: Users,
                title: "Tenant portal",
                desc: "Review reports, comment, approve, and e-sign",
              },
              {
                icon: Wrench,
                title: "Maintenance & compliance",
                desc: "Requests, certificates, meter readings, alerts",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="mb-2 h-8 w-8 text-primary" />
                  <CardTitle className="text-base">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} RentalsLogic. All rights reserved.
      </footer>
    </div>
  );
}
