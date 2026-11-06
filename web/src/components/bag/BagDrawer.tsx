"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBag } from "./BagProvider";
import { CheckIcon, CloseIcon, MinusIcon, PlusIcon } from "../Icons";
import { formatPickup, getPickupDays, getPickupTimes, torontoNow } from "@/lib/hours";
import { money, telHref } from "@/lib/format";
import { bagTone } from "@/lib/format";
import { GRINDS, type Grind } from "@/lib/types";

type Step = "bag" | "details" | "sent";

interface Sent {
  firstName: string;
  orderNumber: string;
  pickup: string;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

export function BagDrawer() {
  const { lines, count, subtotal, hasUnpriced, setQty, setGrind, clear, panel, closePanel, settings } = useBag();
  const open = panel === "bag";
  const [step, setStep] = useState<Step>("bag");
  const [form, setForm] = useState({ name: "", phone: "", email: "", notes: "", website: "" });
  const [date, setDate] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);
  const [clock, setClock] = useState(() => torontoNow());
  const ref = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);

  // when the drawer opens: remember what had focus, move focus in, and refresh the clock
  useEffect(() => {
    if (!open) return;
    opener.current = document.activeElement;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setClock(torontoNow());
    if (step === "sent") setStep("bag");
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    return () => {
      clearTimeout(t);
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
    // step is read once on open on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closePanel();
      if (e.key === "Tab" && ref.current) {
        const items = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
        if (items.length === 0) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closePanel]);

  const days = useMemo(() => (step === "details" ? getPickupDays(settings, clock) : []), [step, settings, clock]);
  const activeDate = date && days.some((d) => d.date === date) ? date : (days[0]?.date ?? null);
  const times = useMemo(
    () => (activeDate ? getPickupTimes(settings, activeDate, clock) : []),
    [activeDate, settings, clock],
  );

  const canSend =
    form.name.trim().length > 1 && form.phone.replace(/\D/g, "").length >= 10 && activeDate && minutes !== null && times.some((t) => t.minutes === minutes);

  async function send() {
    if (!canSend || !activeDate || minutes === null) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          email: form.email,
          notes: form.notes,
          website: form.website,
          date: activeDate,
          minutes,
          items: lines.map((l) => ({ slug: l.slug, sizeLabel: l.sizeLabel, grind: l.grind, qty: l.qty })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; orderNumber?: string };
      if (!res.ok || !data.ok) {
        setError(data.error || "Something went wrong. Please try again or call the shop.");
        return;
      }
      setSent({
        firstName: form.name.trim().split(/\s+/)[0],
        orderNumber: data.orderNumber ?? "",
        pickup: formatPickup(activeDate, minutes),
      });
      setStep("sent");
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function finish() {
    clear();
    setForm((f) => ({ ...f, notes: "", website: "" }));
    setMinutes(null);
    setSent(null);
    setStep("bag");
    closePanel();
  }

  const title =
    step === "bag"
      ? { eyebrow: "Pickup bag", title: count ? `${count} ${count === 1 ? "item" : "items"}` : "Nothing yet" }
      : step === "details"
        ? { eyebrow: "Step 2 of 2", title: "Pickup details" }
        : { eyebrow: "Request sent", title: "See you soon" };

  return (
    <>
      <button
        type="button"
        className={`scrim${panel ? " open" : ""}`}
        aria-label="Close"
        tabIndex={-1}
        onClick={closePanel}
      />
      <aside
        ref={ref}
        className={`drawer${open ? " open" : ""}`}
        role="dialog"
        aria-modal={open}
        aria-label="Pickup bag"
        aria-hidden={!open}
      >
        <div className="dhead">
          <div>
            <p className="eyebrow" style={{ margin: "0 0 4px" }}>
              {title.eyebrow}
            </p>
            <span className="serif" style={{ fontSize: 28 }} aria-live="polite">
              {title.title}
            </span>
          </div>
          <button ref={closeRef} type="button" className="iconbtn" onClick={closePanel} aria-label="Close bag">
            <CloseIcon />
          </button>
        </div>

        {step === "bag" && (
          <>
            <div className="dbody">
              {lines.length === 0 ? (
                <div className="empty">
                  <p className="serif" style={{ fontSize: 24, color: "var(--espresso)", margin: "0 0 8px" }}>
                    Your bag is empty
                  </p>
                  <p style={{ margin: "0 0 22px" }}>Add some beans or a seasonal tea.</p>
                  <Link className="btn btn-dark" href="/shop" onClick={closePanel}>
                    Go to the shop
                  </Link>
                </div>
              ) : (
                lines.map((l) => (
                  <div className="line" key={l.key}>
                    <div className={`mini p-${bagTone(l)}`} aria-hidden="true" />
                    <div className="lmid">
                      <b>{l.name}</b>
                      <span className="lsub">
                        {l.sizeLabel} · {l.unitPrice ? money(l.unitPrice * l.qty) : "priced at pickup"}
                      </span>
                      {l.type === "coffee" && (
                        <label className="sr-only" htmlFor={`grind-${l.key}`}>
                          Grind for {l.name}
                        </label>
                      )}
                      {l.type === "coffee" && (
                        <select
                          id={`grind-${l.key}`}
                          className="grind"
                          value={l.grind ?? GRINDS[0]}
                          onChange={(e) => setGrind(l.key, e.target.value as Grind)}
                        >
                          {GRINDS.map((g) => (
                            <option key={g} value={g}>
                              Grind: {g}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="qty">
                      <button type="button" onClick={() => setQty(l.key, l.qty - 1)} aria-label={`One less ${l.name}`}>
                        <MinusIcon />
                      </button>
                      <span aria-live="polite">{l.qty}</span>
                      <button type="button" onClick={() => setQty(l.key, l.qty + 1)} aria-label={`One more ${l.name}`}>
                        <PlusIcon />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="dfoot">
              <div className="sum">
                <span>Subtotal</span>
                <b>{subtotal > 0 ? money(subtotal) : "Priced at pickup"}</b>
              </div>
              {hasUnpriced && subtotal > 0 && <p className="note" style={{ margin: 0 }}>Items without a price are priced at pickup.</p>}
              {!settings.pickupEnabled && (
                <p className="note" style={{ margin: 0 }}>
                  Online pickup is paused right now. <a href={telHref(settings.phone)}>Call the shop</a> to order.
                </p>
              )}
              <button
                type="button"
                className="btn btn-dark"
                onClick={() => setStep("details")}
                disabled={lines.length === 0 || !settings.pickupEnabled}
              >
                Choose pickup time
              </button>
            </div>
          </>
        )}

        {step === "details" && (
          <>
            <form
              className="dbody"
              style={{ gap: 20 }}
              id="pickup-form"
              onSubmit={(e) => {
                e.preventDefault();
                void send();
              }}
            >
              <label className="field">
                Your name
                <input
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="First and last"
                />
              </label>
              <label className="field">
                Phone, for the ready text
                <input
                  type="tel"
                  name="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="705 555 0123"
                />
              </label>
              <label className="field">
                Email, if you want a confirmation (optional)
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </label>
              <fieldset className="field">
                <legend style={{ marginBottom: 8, padding: 0 }}>Pickup day</legend>
                <div className="slots">
                  {days.length === 0 && <span className="note">No pickup days open right now. Please call the shop.</span>}
                  {days.map((d) => (
                    <button
                      type="button"
                      key={d.date}
                      className={`slot${d.date === activeDate ? " on" : ""}`}
                      aria-pressed={d.date === activeDate}
                      onClick={() => {
                        setDate(d.date);
                        setMinutes(null);
                      }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <fieldset className="field">
                <legend style={{ marginBottom: 8, padding: 0 }}>Pickup time</legend>
                <div className="slots">
                  {times.map((t) => (
                    <button
                      type="button"
                      key={t.minutes}
                      className={`slot${t.minutes === minutes ? " on" : ""}`}
                      aria-pressed={t.minutes === minutes}
                      onClick={() => setMinutes(t.minutes)}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="field">
                Anything we should know? (optional)
                <textarea
                  name="notes"
                  maxLength={300}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </label>
              {/* honeypot: real people never see or fill this */}
              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
                <label>
                  Website
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => setForm({ ...form, website: e.target.value })}
                  />
                </label>
              </div>
              <p className="note">No card needed now. Pay at the counter with cash, debit, Visa or Mastercard.</p>
              {error && (
                <p className="err" role="alert">
                  {error}
                </p>
              )}
            </form>
            <div className="dfoot">
              <button type="submit" form="pickup-form" className="btn btn-dark" disabled={!canSend || busy}>
                {busy ? "Sending" : "Send pickup request"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setStep("bag")}>
                Back to bag
              </button>
            </div>
          </>
        )}

        {step === "sent" && sent && (
          <>
            <div className="dbody">
              <div className="sent">
                <div className="tick">
                  <CheckIcon size={34} />
                </div>
                <span className="serif" style={{ fontSize: 28 }}>
                  Thanks, {sent.firstName}.
                </span>
                <p style={{ margin: 0, color: "#4e4038", lineHeight: 1.6 }}>
                  Hamley&apos;s got your order for <b>{sent.pickup}</b>. You&apos;ll get a text once it&apos;s bagged and ready.
                </p>
                {sent.orderNumber && <p className="note" style={{ margin: 0 }}>Order {sent.orderNumber}</p>}
              </div>
            </div>
            <div className="dfoot">
              <button type="button" className="btn btn-dark" onClick={finish}>
                Done
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
