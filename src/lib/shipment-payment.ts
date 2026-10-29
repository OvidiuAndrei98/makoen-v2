import type { Order } from "@/payload-types";

export type ShipmentPayment = { allowed: boolean; cashOnDeliveryBani: number; reason: string | null };

/** One rule for the AWB endpoint, provider payload and admin display. */
export function shipmentPayment(order: Pick<Order, "status" | "paymentMethod" | "orderType" | "totalBani" | "fulfillmentStatus">): ShipmentPayment {
  const blocked = (reason: string): ShipmentPayment => ({ allowed: false, cashOnDeliveryBani: 0, reason });
  if (["shipped", "delivered"].includes(order.fulfillmentStatus)) return blocked("Comanda este deja expediată sau livrată.");
  // Paid always wins, including COD orders whose collection has been confirmed.
  if (order.status === "paid") return { allowed: true, cashOnDeliveryBani: 0, reason: null };
  // This status already identifies an accepted COD order, including older snapshots
  // where paymentMethod was not loaded into the admin form.
  if (order.status === "cod_pending") {
    if (!Number.isSafeInteger(order.totalBani) || order.totalBani <= 0) return blocked("Totalul rambursului nu este valid. Verifică produsele și transportul comenzii.");
    return { allowed: true, cashOnDeliveryBani: order.totalBani, reason: null };
  }
  if (order.status === "requested" && order.paymentMethod === "cod")
    return blocked("Confirmă mai întâi prețurile și transportul în secțiunea «Confirmare telefonică și plată», folosind «Confirmă comanda ramburs».");
  if (order.status === "cancelled") return blocked("Comanda este anulată. Nu se poate emite AWB.");
  return blocked("Pentru plata cu cardul, AWB-ul se emite după confirmarea plății. Comenzile ramburs confirmate pot fi expediate fără plată în avans.");
}
