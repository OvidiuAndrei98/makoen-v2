import { createHash } from "node:crypto";
import { createCheckout, parseLines, CommerceError } from "@/lib/commerce";
import { ordersConfigured } from "@/lib/commerce-env";
import { parseCheckoutDetails } from "@/lib/checkout-details";
import { requireLegalAcceptance } from "@/lib/commerce-validation";

export const runtime = "nodejs";
// Best-effort per-instance abuse control; retries of one key do not create new orders.
const attempts = new Map<string, { keys: Set<string>; expires: number }>();
/** Validate browser input; the commerce service owns pricing and inventory locks. */
export async function POST(request: Request) {
  if (!ordersConfigured())
    return Response.json(
      { error: "Comenzile nu sunt disponibile momentan." },
      { status: 503 },
    );
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(process.env.APP_URL!).origin)
    return Response.json({ error: "Cerere neautorizată." }, { status: 403 });
  try {
    const text = await request.text();
    if (text.length > 16000) throw new CommerceError("Coș prea mare.");
    const body = JSON.parse(text);
    const legalVersion = requireLegalAcceptance(body);
    if (
      typeof body.key !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        body.key,
      )
    )
      throw new CommerceError("Identificator de plată invalid.");
    const details = parseCheckoutDetails(body.details);
    const now = Date.now();
    for (const [key, entry] of attempts) if (entry.expires <= now) attempts.delete(key);
    const ip = createHash("sha256").update(request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown").digest("hex");
    const entry = attempts.get(ip) ?? { keys: new Set<string>(), expires: now + 10 * 60000 };
    if (!entry.keys.has(body.key) && entry.keys.size >= 10) throw new CommerceError("Prea multe comenzi. Încearcă din nou în câteva minute.", 429);
    if (attempts.size >= 5000) attempts.delete(attempts.keys().next().value!);
    entry.keys.add(body.key); attempts.set(ip, entry);
    return Response.json(
      await createCheckout(
        parseLines(body),
        body.key,
        undefined,
        undefined,
        legalVersion,
        details,
      ),
    );
  } catch (error) {
    if (error instanceof CommerceError)
      return Response.json({ error: error.message }, { status: error.status });
    if (error instanceof SyntaxError)
      return Response.json({ error: "Coș invalid." }, { status: 400 });
    console.error(
      "Checkout failed:",
      error instanceof Error ? error.name : "unknown",
    );
    return Response.json(
      { error: "Nu am putut deschide plata. Reîncearcă în câteva momente." },
      { status: 502 },
    );
  }
}
