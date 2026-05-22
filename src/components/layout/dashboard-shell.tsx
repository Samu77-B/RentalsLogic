import { UserButton } from "@clerk/nextjs";
import { DashboardNav } from "@/components/layout/dashboard-nav";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
        <DashboardNav />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b px-6">
          <h1 className="text-sm font-medium text-muted-foreground md:hidden">
            RentalsLogic
          </h1>
          <div className="ml-auto">
            <UserButton />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
