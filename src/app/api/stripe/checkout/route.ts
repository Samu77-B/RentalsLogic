import { requireLandlord } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { stripe, MEMBERSHIP_PLANS } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { MembershipTier } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const user = await requireLandlord();
    if (!stripe) return jsonError("Stripe not configured", 500);

    const body = await request.json();
    const tier = body.tier as keyof typeof MEMBERSHIP_PLANS;
    const plan = MEMBERSHIP_PLANS[tier];

    if (!plan?.priceId) {
      return jsonError("Stripe price not configured for this tier", 500);
    }

    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?canceled=true`,
      metadata: { userId: user.id, tier },
    });

    return jsonOk({ url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create checkout";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}

export async function GET() {
  try {
    const user = await requireLandlord();
    return jsonOk({
      tier: user.membershipTier,
      plans: Object.values(MEMBERSHIP_PLANS),
      stripeCustomerId: user.stripeCustomerId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch billing";
    return jsonError(message, message === "Unauthorized" ? 401 : 500);
  }
}
