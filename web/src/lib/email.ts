import "server-only";
import { Resend } from "resend";
import { money, smsHref, telHref } from "./format";
import type { SiteSettings } from "./types";

export interface OrderItem {
  name: string;
  type: string;
  sizeLabel: string;
  grind?: string;
  qty: number;
  unitPrice: number | null;
}

export interface OrderForEmail {
  id: string;
  orderNumber: string;
  name: string;
  phone: string;
  email?: string;
  notes?: string;
  pickupLabel: string;
  items: OrderItem[];
}

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const ESPRESSO = "#2A1D16";
const COPPER = "#8A4B16";

function itemsTable(items: OrderItem[], withTotals = true): string {
  const rows = items
    .map((i) => {
      const line = i.unitPrice ? money(i.unitPrice * i.qty) : "priced at pickup";
      const detail = [i.sizeLabel, i.grind ? `Grind: ${i.grind}` : ""].filter(Boolean).map(esc).join(" · ");
      return `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #EADFD0;font-size:16px;color:${ESPRESSO}"><strong>${esc(i.name)}</strong><br><span style="font-size:14px;color:#6B5A4E">${detail}</span></td>
        <td style="padding:12px 8px;border-bottom:1px solid #EADFD0;font-size:16px;text-align:center;color:${ESPRESSO}">x${i.qty}</td>
        <td style="padding:12px 0;border-bottom:1px solid #EADFD0;font-size:14px;text-align:right;color:#6B5A4E">${line}</td>
      </tr>`;
    })
    .join("");
  const priced = items.reduce((n, i) => n + (i.unitPrice ? i.unitPrice * i.qty : 0), 0);
  const hasUnpriced = items.some((i) => !i.unitPrice);
  const total = withTotals
    ? `<tr><td colspan="3" style="padding:14px 0 0;text-align:right;font-size:15px;color:${ESPRESSO}">${priced > 0 ? `Subtotal <strong>${money(priced)}</strong>` : "Priced at pickup"}${priced > 0 && hasUnpriced ? "<br><span style='font-size:13px;color:#6B5A4E'>Other items priced at pickup</span>" : ""}</td></tr>`
    : "";
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${rows}${total}</table>`;
}

function shell(title: string, inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#FBF7F1;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FBF7F1"><tr><td align="center" style="padding:24px 12px">
    <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #EADFD0;border-radius:16px">
      <tr><td style="background:${ESPRESSO};color:#F3EADC;padding:20px 28px;border-radius:16px 16px 0 0;font-size:13px;letter-spacing:2px;text-transform:uppercase">Hamley's Tea &amp; Coffee Co.</td></tr>
      <tr><td style="padding:28px">
        <h1 style="margin:0 0 18px;font:400 26px Georgia,serif;color:${ESPRESSO}">${esc(title)}</h1>
        ${inner}
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

function shopSlip(order: OrderForEmail, studioUrl: string | null): string {
  const msg = `Hi ${order.name.split(/\s+/)[0]}, your Hamley's order is bagged and ready for pickup. See you soon!`;
  const sms = smsHref(order.phone, msg);
  const inner = `
    <p style="margin:0 0 6px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${COPPER}">Pickup</p>
    <p style="margin:0 0 20px;font:400 22px Georgia,serif;color:${ESPRESSO}">${esc(order.pickupLabel)}</p>
    <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:${ESPRESSO}">
      <strong>${esc(order.name)}</strong><br>
      <a href="${telHref(order.phone)}" style="color:${COPPER}">${esc(order.phone)}</a>
      ${order.email ? `<br><a href="mailto:${esc(order.email)}" style="color:${COPPER}">${esc(order.email)}</a>` : ""}
    </p>
    ${itemsTable(order.items)}
    ${order.notes ? `<p style="margin:20px 0 0;padding:14px;background:#F3EADC;border-radius:10px;font-size:15px;color:${ESPRESSO}"><strong>Note:</strong> ${esc(order.notes)}</p>` : ""}
    <p style="margin:28px 0 0"><a href="${sms}" style="display:block;text-align:center;background:${ESPRESSO};color:#FBF7F1;text-decoration:none;font-size:18px;font-weight:700;padding:20px 24px;border-radius:999px">Text customer it's ready</a></p>
    <p style="margin:10px 0 0;text-align:center;font-size:13px;color:#6B5A4E">Opens your messages with the text already written. Open this email on your phone.</p>
    ${studioUrl ? `<p style="margin:22px 0 0;text-align:center;font-size:14px"><a href="${studioUrl}" style="color:${COPPER}">Open this order in Studio</a> to mark it bagged or picked up</p>` : ""}`;
  return shell(`New pickup order ${order.orderNumber}`, inner);
}

function customerConfirmation(order: OrderForEmail, settings: SiteSettings): string {
  const inner = `
    <p style="margin:0 0 20px;font-size:17px;line-height:1.6;color:${ESPRESSO}">Thanks, ${esc(order.name.split(/\s+/)[0])}. Hamley's got your order. You'll get a text once it's bagged and ready.</p>
    <p style="margin:0 0 6px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${COPPER}">Order ${esc(order.orderNumber)}</p>
    <p style="margin:0 0 20px;font:400 22px Georgia,serif;color:${ESPRESSO}">Pickup: ${esc(order.pickupLabel)}</p>
    ${itemsTable(order.items)}
    <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:${ESPRESSO}">No card needed. Pay at the counter with cash, debit, Visa or Mastercard.</p>
    <p style="margin:20px 0 0;font-size:15px;line-height:1.6;color:${ESPRESSO}"><strong>${esc(settings.name)}</strong><br>${esc(settings.address)}<br><a href="${telHref(settings.phone)}" style="color:${COPPER}">${esc(settings.phone)}</a></p>
    <p style="margin:22px 0 0"><a href="${esc(settings.mapLink)}" style="display:inline-block;background:${ESPRESSO};color:#FBF7F1;text-decoration:none;font-weight:600;padding:14px 26px;border-radius:999px">Get directions</a></p>`;
  return shell(`Your pickup order ${order.orderNumber}`, inner);
}

/** Sends the shop slip and, if the customer gave an email, a confirmation. Never throws: the order is already saved. */
export async function sendOrderEmails(order: OrderForEmail, settings: SiteSettings): Promise<{ shop: boolean; customer: boolean }> {
  const result = { shop: false, customer: false };
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const shopTo = process.env.SHOP_NOTIFICATION_EMAIL || settings.notificationEmail;
  if (!key || !from) {
    console.warn("Resend is not configured (RESEND_API_KEY / EMAIL_FROM). Order saved, no emails sent.");
    return result;
  }
  const resend = new Resend(key);
  const studio = process.env.NEXT_PUBLIC_STUDIO_URL?.replace(/\/$/, "");
  const studioUrl = studio ? `${studio}/intent/edit/id=${encodeURIComponent(order.id)};type=pickupOrder` : null;

  if (shopTo) {
    try {
      const { error } = await resend.emails.send({
        from,
        to: shopTo,
        replyTo: order.email || undefined,
        subject: `New pickup ${order.orderNumber}: ${order.name}, ${order.pickupLabel}`,
        html: shopSlip(order, studioUrl),
      });
      if (error) console.error("Resend shop email failed:", error.message);
      else result.shop = true;
    } catch (e) {
      console.error("Resend shop email threw:", e instanceof Error ? e.message : e);
    }
  } else {
    console.warn("No shop notification address set (SHOP_NOTIFICATION_EMAIL).");
  }

  if (order.email) {
    try {
      const { error } = await resend.emails.send({
        from,
        to: order.email,
        subject: `Your Hamley's pickup order ${order.orderNumber}`,
        html: customerConfirmation(order, settings),
      });
      if (error) console.error("Resend customer email failed:", error.message);
      else result.customer = true;
    } catch (e) {
      console.error("Resend customer email threw:", e instanceof Error ? e.message : e);
    }
  }
  return result;
}
