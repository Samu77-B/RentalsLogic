import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : (null as unknown as Stripe);

export const MEMBERSHIP_PLANS = {
  BASIC: {
    tier: "BASIC" as const,
    name: "Basic",
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    propertyLimit: 3,
    price: 9.99,
  },
  PREMIUM: {
    tier: "PREMIUM" as const,
    name: "Premium",
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID,
    propertyLimit: 25,
    price: 24.99,
  },
  ENTERPRISE: {
    tier: "ENTERPRISE" as const,
    name: "Enterprise",
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    propertyLimit: Infinity,
    price: 49.99,
  },
} as const;

export function getPropertyLimit(tier: keyof typeof MEMBERSHIP_PLANS) {
  return MEMBERSHIP_PLANS[tier].propertyLimit;
}
