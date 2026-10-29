import { CommerceError } from "./commerce-validation";

export type BillingDetails = {
  type: "personal" | "company";
  companyName: string;
  taxId: string;
  registrationNumber: string;
  address: string;
};
export type CheckoutDetails = {
  paymentMethod: "card" | "cod";
  contact: { name: string; email: string; phone: string };
  shipping: { line1: string; city: string; state: string; postal_code: string; country: "RO" };
  billing: BillingDetails;
};

/** Canonical server snapshot. Neither totals nor payment state come from the browser. */
export function parseCheckoutDetails(value: unknown): CheckoutDetails {
  if (!value || typeof value !== "object") throw new CommerceError("Completează datele comenzii.");
  const body = value as Record<string, unknown>;
  const object = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
  const text = (obj: Record<string, unknown>, key: string, min: number, max: number) => {
    const result = typeof obj[key] === "string" ? obj[key].trim() : "";
    if (result.length < min || result.length > max || /[\x00-\x1f\x7f]/.test(result))
      throw new CommerceError("Completează corect datele de contact, livrare și facturare.");
    return result;
  };
  if (body.paymentMethod !== "card" && body.paymentMethod !== "cod") throw new CommerceError("Alege plata cu cardul sau ramburs.");
  const contact = object(body.contact), shipping = object(body.shipping), billing = object(body.billing);
  const name = text(contact, "name", 2, 100), email = text(contact, "email", 3, 254), phone = text(contact, "phone", 7, 40);
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email) || !/^[+\d\s().-]+$/.test(phone) || phone.replace(/\D/g, "").length < 7)
    throw new CommerceError("Completează un e-mail și un telefon valide.");
  const line1 = text(shipping, "line1", 5, 250), city = text(shipping, "city", 2, 100), state = text(shipping, "state", 2, 100), postal_code = text(shipping, "postal_code", 0, 6);
  if (shipping.country !== "RO" || (postal_code && !/^\d{6}$/.test(postal_code))) throw new CommerceError("Livrăm în România. Codul poștal trebuie să aibă 6 cifre.");
  if (billing.type !== "personal" && billing.type !== "company") throw new CommerceError("Alege tipul de facturare.");
  const company = billing.type === "company";
  const companyName = company ? text(billing, "companyName", 2, 160) : "";
  const taxId = company ? text(billing, "taxId", 2, 12).toUpperCase().replace(/\s/g, "") : "";
  if (company && !/^(RO)?\d{2,10}$/.test(taxId)) throw new CommerceError("Introdu un CUI valid, cu sau fără prefixul RO.");
  return {
    paymentMethod: body.paymentMethod,
    contact: { name, email, phone },
    shipping: { line1, city, state, postal_code, country: "RO" },
    billing: {
      type: billing.type, companyName, taxId,
      registrationNumber: company ? text(billing, "registrationNumber", 0, 50) : "",
      address: company ? text(billing, "address", 5, 350) : `${line1}, ${city}, ${state}, România`,
    },
  };
}

export function checkoutDetailsFromForm(form: FormData): CheckoutDetails {
  const get = (name: string) => String(form.get(name) ?? "");
  return parseCheckoutDetails({
    paymentMethod: get("paymentMethod"),
    contact: { name: get("name"), email: get("email"), phone: get("phone") },
    shipping: { line1: get("address"), city: get("city"), state: get("county"), postal_code: get("postalCode"), country: "RO" },
    billing: { type: get("billingType"), companyName: get("companyName"), taxId: get("taxId"), registrationNumber: get("registrationNumber"), address: get("billingAddress") },
  });
}
