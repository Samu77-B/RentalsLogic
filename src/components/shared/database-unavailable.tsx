import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DatabaseUnavailable({ detail }: { detail?: string }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-14 items-center justify-end border-b px-6">
        <UserButton />
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-lg">
          <CardHeader>
            <CardTitle>Can&apos;t reach the database</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You&apos;re signed in, but RentalsLogic can&apos;t load your properties because
              the database connection failed from this machine.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Check Supabase that the project is not paused</li>
              <li>
                In Supabase → Connect, copy the <strong>Transaction pooler</strong> URI
                (port 6543) into <code>DATABASE_URL</code> in <code>.env</code>
              </li>
              <li>Restart <code>npm run dev</code> after updating <code>.env</code></li>
              <li>Or try the live site on Vercel if the database works there</li>
            </ul>
            {detail && (
              <p className="rounded-md bg-muted p-3 font-mono text-xs break-all">{detail}</p>
            )}
            <Button nativeButton={false} render={<Link href="/" />}>
              Back to home
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
