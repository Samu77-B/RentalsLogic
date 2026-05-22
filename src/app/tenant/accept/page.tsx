import { Suspense } from "react";
import AcceptInvitePage from "./accept-client";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-6">Loading...</p>}>
      <AcceptInvitePage />
    </Suspense>
  );
}
