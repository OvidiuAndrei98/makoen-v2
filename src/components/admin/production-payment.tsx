"use client";
import { useState } from "react";
import type { Order } from "@/payload-types";

/** The admin submits a quote in RON; the server freezes integer-bani amounts before Stripe. */
export default function ProductionPayment({ order }: { order: Order }) {
  const [prices, setPrices] = useState(
    order.items.map((line) => String(line.unitPriceBani / 100 || "")),
  );
  const [shipping, setShipping] = useState(String(order.shippingBani / 100));
  const [url, setUrl] = useState(
    order.status === "pending" ? order.paymentUrl || "" : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const locked = order.status === "pending";
  if (["paid", "cod_pending", "cancelled"].includes(order.status))
    return (
      <section className="makeon-order-panel">
        <strong>{order.status === "cancelled" ? "Comandă anulată." : order.status === "cod_pending" ? "Comandă ramburs confirmată. Poți începe pregătirea; plata se încasează la livrare." : "Plată confirmată. Poți începe pregătirea comenzii."}</strong>
      </section>
    );
  return (
    <section className="makeon-order-panel production-payment">
      <h3>Confirmare telefonică și plată</h3>
      <p>
        Contactează clientul, confirmă termenul și completează prețurile
        agreate. {order.paymentMethod === "cod" ? "Confirmarea comenzii stabilește suma de încasat la livrare." : "Linkul se transmite clientului după generare."}
      </p>
      {order.customerNote && (
        <p>
          <strong>Mesaj client:</strong> {order.customerNote}
        </p>
      )}
      <div className="production-payment-fields">
        {order.items.map((line, index) => (
          <label key={line.id || index}>
            {line.name} · {line.grind} · {line.quantity} buc.
            <span>Preț unitar (RON)</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={prices[index]}
              disabled={locked || busy}
              onChange={(event) =>
                setPrices((previous) =>
                  previous.map((value, i) =>
                    i === index ? event.target.value : value,
                  ),
                )
              }
            />
          </label>
        ))}
        <label>
          Transport (RON)
          <input
            type="number"
            min="0"
            step="0.01"
            value={shipping}
            disabled={locked || busy}
            onChange={(event) => setShipping(event.target.value)}
          />
        </label>
      </div>
      {locked && (
        <p>
          Prețurile sunt blocate cât timp linkul este activ. La expirare poți
          genera un link nou.
        </p>
      )}
      <button
        type="button"
        className="btn btn--style-primary"
        disabled={busy}
        onClick={async () => {
          if (busy) return;
          setBusy(true);
          setError("");
          setCopied(false);
          try {
            const response = await fetch("/api/orders/payment-link", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderID: order.id,
                unitPrices: prices.map((value) => Number(value)),
                shipping: shipping === "" ? null : Number(shipping),
              }),
            });
            const result = await response.json();
            if (!response.ok || (!result.url && !result.reference))
              throw new Error(result.error || "Linkul nu a putut fi generat.");
            setUrl(result.url || "");
            window.location.reload();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Reîncearcă.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy
          ? "Se generează…"
          : locked
            ? "Verifică / recuperează linkul"
            : order.paymentMethod === "cod" ? "Confirmă comanda ramburs" : "Generează link de plată"}
      </button>
      {url && (
        <div className="production-payment-link">
          <a href={url} target="_blank" rel="noopener noreferrer">
            Deschide linkul de plată
          </a>
          <button
            type="button"
            className="btn btn--style-secondary"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                setCopied(true);
              } catch {
                setError(
                  "Copierea nu este disponibilă. Copiază adresa de mai jos.",
                );
              }
            }}
          >
            {copied ? "Link copiat" : "Copiază linkul"}
          </button>
          <input
            aria-label="Link de plată"
            value={url}
            readOnly
            onFocus={(event) => event.target.select()}
          />
          {order.expiresAt && (
            <p>
              Valabil până la{" "}
              {new Date(order.expiresAt).toLocaleString("ro-RO")}.
            </p>
          )}
        </div>
      )}
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
