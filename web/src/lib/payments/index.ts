/**
 * Payment providers. Pickup orders are pay-at-the-counter today, so the only
 * provider is `none`. When HelcimPay.js is added later, implement
 * `PaymentProvider` in lib/payments/helcim.ts and return it below when
 * PAYMENTS_HELCIM_ENABLED=true. The order flow only talks to this interface.
 */

export interface PaymentSession {
  /** What the browser should do after the order is saved. */
  kind: "none" | "redirect" | "inline";
  /** Provider specific data, e.g. a HelcimPay.js checkout token. */
  payload?: Record<string, unknown>;
}

export interface PaymentProvider {
  id: "none" | "helcim";
  /** Human text shown in the bag, e.g. "Pay at the counter". */
  label: string;
  /** Called by /api/pickup after totals are re-priced on the server. */
  createSession(order: { orderNumber: string; totalCents: number | null }): Promise<PaymentSession>;
}

const none: PaymentProvider = {
  id: "none",
  label: "Pay at the counter",
  async createSession() {
    return { kind: "none" };
  },
};

export function getPaymentProvider(): PaymentProvider {
  // Helcim is intentionally not built yet. The flag exists so it can drop in later.
  if (process.env.PAYMENTS_HELCIM_ENABLED === "true") {
    console.warn("PAYMENTS_HELCIM_ENABLED is true but no Helcim provider exists yet. Using none.");
  }
  return none;
}
