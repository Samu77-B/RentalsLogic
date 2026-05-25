export function SetupRequired() {
  const checks = {
    clerkPublic: Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY),
    clerkSecret: Boolean(process.env.CLERK_SECRET_KEY),
    database: Boolean(process.env.DATABASE_URL),
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "(not set)",
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col justify-center p-8 font-sans">
      <h1 className="text-2xl font-bold">RentalsLogic — setup required</h1>
      <p className="mt-4 text-muted-foreground">
        The app deployed, but Vercel environment variables are missing or incomplete.
        This usually causes <code>MIDDLEWARE_INVOCATION_FAILED</code>.
      </p>
      <ul className="mt-6 space-y-2 text-sm">
        <li>{checks.clerkPublic ? "✓" : "✗"} NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</li>
        <li>{checks.clerkSecret ? "✓" : "✗"} CLERK_SECRET_KEY</li>
        <li>{checks.database ? "✓" : "✗"} DATABASE_URL (Supabase postgresql:// URI)</li>
        <li>App URL: {checks.appUrl}</li>
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">
        In Vercel → Settings → Environment Variables, add the missing values for{" "}
        <strong>Production</strong>, then Redeploy. Also add{" "}
        <code>https://rentals-logic-two.vercel.app/*</code> to Clerk allowed redirect URLs.
      </p>
      <p className="mt-4 text-sm">
        Diagnostic:{" "}
        <a className="text-primary underline" href="/api/setup-check">
          /api/setup-check
        </a>
      </p>
    </div>
  );
}

function isClerkConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim() &&
      process.env.CLERK_SECRET_KEY?.trim()
  );
}

export { isClerkConfigured };
