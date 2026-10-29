import { getCMS } from "@/lib/cms";
import { allowedRequestOrigin } from "@/lib/request-origin";
import { CommerceError } from "@/lib/commerce-validation";
import { updateCashOnDelivery } from "@/lib/cod-orders";

export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!allowedRequestOrigin(request)) return Response.json({ error: "Solicitare nepermisă." }, { status: 403 });
  try {
    const cms = await getCMS();
    const { user } = await cms.auth({ headers: request.headers });
    if (!user || user.collection !== "users") return Response.json({ error: "Autentificare necesară." }, { status: 401 });
    const raw = await request.text();
    if (raw.length > 1000) throw new CommerceError("Solicitare prea mare.");
    const body = JSON.parse(raw);
    if (!Number.isSafeInteger(body.orderID) || body.orderID < 1 || !["collect", "cancel"].includes(body.action)) throw new CommerceError("Operațiune invalidă.");
    return Response.json(await updateCashOnDelivery(cms, body.orderID, body.action));
  } catch (error) {
    return Response.json({ error: error instanceof CommerceError ? error.message : "Operațiunea nu a putut fi finalizată. Reîncearcă." }, { status: error instanceof CommerceError ? error.status : error instanceof SyntaxError ? 400 : 502 });
  }
}
