"use client";
import { useId, useState } from "react";
import { Banknote, CreditCard } from "lucide-react";

export default function CheckoutFields({ card = true, cod = true }: { card?: boolean; cod?: boolean }) {
  const uid = useId();
  const [company, setCompany] = useState(false);
  const [method, setMethod] = useState(card ? "card" : "cod");
  const input = (name: string, label: string, autocomplete: string, max: number, type = "text", min = 2, optional = false) => (
    <label className={name === "address" ? "checkout-wide" : undefined} htmlFor={`${uid}-${name}`}>
      {label}{optional ? " (opțional)" : " *"}
      <input id={`${uid}-${name}`} name={name} type={type} autoComplete={autocomplete} required={!optional} minLength={optional ? undefined : min} maxLength={max} />
    </label>
  );
  return <div className="checkout-fields">
    <fieldset>
      <legend>Date de contact</legend>
      <div className="checkout-input-grid">
        {input("name", "Nume și prenume", "name", 100)}
        {input("phone", "Telefon", "tel", 40, "tel", 7)}
        {input("email", "E-mail", "email", 254, "email", 3)}
      </div>
    </fieldset>
    <fieldset>
      <legend>Adresă de livrare</legend>
      <p className="checkout-hint">Livrare la adresă, în România.</p>
      <div className="checkout-input-grid">
        {input("address", "Stradă, număr, bloc, apartament", "shipping street-address", 250, "text", 5)}
        {input("county", "Județ / sector", "shipping address-level1", 100)}
        {input("city", "Localitate", "shipping address-level2", 100)}
        {input("postalCode", "Cod poștal", "shipping postal-code", 6, "text", 0, true)}
      </div>
    </fieldset>
    <fieldset>
      <legend>Facturare</legend>
      <div className="checkout-choice-row">
        <label><input type="radio" name="billingType" value="personal" checked={!company} onChange={() => setCompany(false)} />Persoană fizică</label>
        <label><input type="radio" name="billingType" value="company" checked={company} onChange={() => setCompany(true)} />Persoană juridică</label>
      </div>
      {company ? <div className="checkout-input-grid checkout-company">
        {input("companyName", "Denumirea firmei", "billing organization", 160)}
        {input("taxId", "CUI / CIF", "off", 12)}
        {input("registrationNumber", "Nr. Registrul Comerțului", "off", 50, "text", 0, true)}
        <label className="checkout-wide" htmlFor={`${uid}-billing-address`}>Adresa sediului social *
          <input id={`${uid}-billing-address`} name="billingAddress" autoComplete="billing street-address" placeholder="Stradă, număr, localitate, județ" required minLength={5} maxLength={350} />
        </label>
      </div> : <p className="checkout-hint">Factura folosește numele și adresa de livrare completate mai sus.</p>}
    </fieldset>
    <fieldset>
      <legend>Metodă de plată</legend>
      <div className="checkout-payment-options">
        {card && <label className={method === "card" ? "is-selected" : ""}>
          <input type="radio" name="paymentMethod" value="card" checked={method === "card"} onChange={() => setMethod("card")} />
          <CreditCard size={22} aria-hidden="true" /><span><strong>Card online</strong><small>Plată securizată prin Stripe.</small></span>
        </label>}
        {cod && <label className={method === "cod" ? "is-selected" : ""}>
          <input type="radio" name="paymentMethod" value="cod" checked={method === "cod"} onChange={() => setMethod("cod")} />
          <Banknote size={22} aria-hidden="true" /><span><strong>Ramburs</strong><small>Achită totalul comenzii la livrare.</small></span>
        </label>}
      </div>
    </fieldset>
  </div>;
}
