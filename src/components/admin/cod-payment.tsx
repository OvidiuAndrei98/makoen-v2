"use client";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Order } from "@/payload-types";

export default function CodPayment({ order }: { order: Order }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [action, setAction] = useState<"collect" | "cancel" | null>(null);
  if (order.paymentMethod !== "cod" && order.status !== "cod_pending") return null;
  const amount = new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON" }).format(order.totalBani / 100);
  if (order.status === "paid") return <section className="makeon-order-panel makeon-cod-payment">
    <h3><CheckCircle2 size={20} aria-hidden="true" /> Ramburs încasat</h3>
    <p>Suma încasată: <strong>{amount}</strong>, inclusiv transport.</p>
    {order.codCollectedAt && <p>Confirmat la {new Date(order.codCollectedAt).toLocaleString("ro-RO", { timeZone: "Europe/Bucharest" })}.</p>}
  </section>;
  if (order.status !== "cod_pending") return null;
  const cancellable = ["new", "processing"].includes(order.fulfillmentStatus ?? "new");
  const submit = async () => {
    if (busy || !action) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/orders/cod", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderID: order.id, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      window.location.reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Operațiunea nu a reușit."); }
    finally { setBusy(false); }
  };
  return <section className="makeon-order-panel makeon-cod-payment">
    <h3>Plată ramburs</h3>
    <p>De încasat: <strong>{amount}</strong>, inclusiv transport.</p>
    <p>După ce ai verificat încasarea banilor, marchează comanda ca plătită.</p>
    {action ? <div className="makeon-cod-confirmation" role="group" aria-label={action === "collect" ? "Confirmare încasare" : "Confirmare anulare"}>
      <p>{action === "collect" ? <>Confirmi că ai încasat <strong>{amount}</strong> pentru această comandă?</> : <>Confirmi anularea comenzii? Produsele din stoc redevin disponibile.</>}</p>
      <div className="makeon-cod-actions">
        <button type="button" className={action === "collect" ? "makeon-cod-collect" : "makeon-cod-cancel"} disabled={busy} onClick={() => void submit()}>
          {busy ? "Se salvează…" : action === "collect" ? "Confirmă încasarea" : "Confirmă anularea"}
        </button>
        <button type="button" className="makeon-cod-back" disabled={busy} onClick={() => { setAction(null); setError(""); }}>Renunță</button>
      </div>
    </div> : <div className="makeon-cod-actions">
      <button type="button" className="makeon-cod-collect" onClick={() => setAction("collect")}><CheckCircle2 size={18} aria-hidden="true" />Marchează încasat</button>
      {cancellable && <button type="button" className="makeon-cod-cancel" onClick={() => setAction("cancel")}><XCircle size={18} aria-hidden="true" />Anulează comanda ramburs</button>}
    </div>}
    {error && <p className="makeon-cod-error" role="alert">{error}</p>}
  </section>;
}
