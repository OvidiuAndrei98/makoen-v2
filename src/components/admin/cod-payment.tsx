"use client";
import { useState } from "react";
import type { Order } from "@/payload-types";

export default function CodPayment({ order }: { order: Order }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  if (order.paymentMethod !== "cod" || order.status !== "cod_pending") return null;
  const delivered = order.fulfillmentStatus === "delivered";
  const cancellable = ["new", "processing"].includes(order.fulfillmentStatus ?? "new");
  const act = async (action: "collect" | "cancel") => {
    if (busy || !confirm) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/orders/cod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderID: order.id, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Operațiunea nu a reușit."); }
    finally { setBusy(false); }
  };
  return <section className="makeon-order-panel">
    <h3>Plată ramburs</h3>
    <p>De încasat la livrare: <strong>{new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(order.totalBani / 100)}</strong>, inclusiv transport.</p>
    <p>Livrarea nu confirmă automat încasarea. Marchează plata doar după verificarea decontului curierului.</p>
    {(delivered || cancellable) && <label><input type="checkbox" checked={confirm} onChange={e => setConfirm(e.target.checked)} disabled={busy} /> {delivered ? "Am verificat și confirm încasarea rambursului." : "Confirm anularea înainte de expediere și restabilirea stocului pentru produsele din stoc."}</label>}
    {delivered && <button type="button" className="btn btn--style-primary" disabled={busy || !confirm} onClick={() => void act("collect")}>Confirmă încasarea rambursului</button>}
    {cancellable && <button type="button" className="btn btn--style-secondary" disabled={busy || !confirm} onClick={() => void act("cancel")}>Anulează comanda ramburs</button>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
