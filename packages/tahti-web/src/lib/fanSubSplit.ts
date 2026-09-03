const STRIPE_PCT = 0.029;
const STRIPE_FIXED_CENTS = 30;
const ORG_FEE_PCT = 0.02;

export const EXAMPLE_FAN_SUB_GROSS_CENTS = 500;

export type FanSubSplit = {
  grossCents: number;
  stripeFeeCents: number;
  orgFeeCents: number;
  netToArtistCents: number;
};

export function computeFanSubSplit(grossCents: number): FanSubSplit {
  const gross = Math.max(0, Math.round(grossCents));
  const stripeFeeCents =
    Math.round(gross * STRIPE_PCT) + (gross > 0 ? STRIPE_FIXED_CENTS : 0);
  const orgFeeCents = Math.round(gross * ORG_FEE_PCT);
  const netToArtistCents = gross - stripeFeeCents - orgFeeCents;
  return { grossCents: gross, stripeFeeCents, orgFeeCents, netToArtistCents };
}

export function eurosFromCents(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}
