"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/** Native Back (including BFCache) and shop navigation cancel only unpaid stock checkouts. */
export default function useCheckoutReturn(onReleased: () => void) {
  const pathname = usePathname();
  const callback = useRef(onReleased);
  callback.current = onReleased;
  const activeKey = useRef<string | null>(null);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const recover = useCallback(async () => {
    // The result page verifies payment server-side or handles Stripe's cancel URL.
    if (window.location.pathname === "/comanda") return;
    const key = sessionStorage.getItem("makeon-checkout-key");
    if (!key || activeKey.current === key) return;
    activeKey.current = key;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/checkout/cancel", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Nu am putut elibera rezervarea. Reîncearcă.");
      if (result.paid && result.url) { window.location.replace(result.url); return; }
      if (sessionStorage.getItem("makeon-checkout-key") === key) {
        sessionStorage.removeItem("makeon-checkout-key");
        sessionStorage.removeItem("makeon-checkout-cart");
      }
      setRevision(value => value + 1);
      callback.current();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nu am putut elibera rezervarea. Reîncearcă.");
    } finally { activeKey.current = null; setBusy(false); }
  }, []);
  useEffect(() => {
    void recover();
    const onPageShow = (event: PageTransitionEvent) => { if (event.persisted) void recover(); };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [pathname, recover]);
  return { busy, error, revision, retry: recover };
}
