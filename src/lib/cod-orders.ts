import "server-only";
import { sql } from "@payloadcms/db-postgres";
import type { Payload } from "payload";
import { transaction, transactionDB, lockOrder } from "./commerce";
import { CommerceError } from "./commerce-validation";

/** Only an authenticated administrator calls this after verifying collection/cancellation. */
export async function updateCashOnDelivery(cms: Payload, orderID: number, action: "collect" | "cancel") {
  return transaction(cms, async id => {
    const req = { transactionID: id };
    const original = await cms.findByID({ collection: "orders", id: orderID, depth: 0, req });
    await lockOrder(cms, id, original.reference);
    const order = await cms.findByID({ collection: "orders", id: orderID, depth: 0, req });
    if (order.paymentMethod !== "cod") throw new CommerceError("Comanda nu este cu plata ramburs.", 409);
    const target = action === "collect" ? "paid" : "cancelled";
    if (order.status === target) return { reference: order.reference };
    if (order.status !== "cod_pending") throw new CommerceError("Starea comenzii nu permite această operațiune.", 409);
    if (action === "cancel") {
      if (!["new", "processing"].includes(order.fulfillmentStatus ?? "new"))
        throw new CommerceError("Comanda este deja expediată. Gestionează returul înainte de corectarea stocului.", 409);
      const shipment = await transactionDB(cms, id).execute(sql`SELECT order_id FROM order_shipments WHERE order_id = ${orderID} AND state <> 'rejected'`);
      if ("rows" in shipment && shipment.rows.length)
        throw new CommerceError("Comanda are o emitere AWB. Verifică și anulează expedierea înainte de anularea comenzii.", 409);
      const quantities = new Map<number, number>();
      for (const line of order.orderType === "production" ? [] : order.items) {
        const productID = typeof line.product === "number" ? line.product : line.product.id;
        quantities.set(productID, (quantities.get(productID) ?? 0) + line.quantity);
      }
      for (const [productID, quantity] of [...quantities].sort((a,b) => a[0]-b[0]))
        await transactionDB(cms, id).execute(sql`UPDATE products SET stock = stock + ${quantity} WHERE id = ${productID}`);
    }
    await cms.update({ collection: "orders", id: orderID, req, data: { status: target, ...(action === "collect" ? { codCollectedAt: new Date().toISOString() } : {}) } });
    return { reference: order.reference };
  });
}
