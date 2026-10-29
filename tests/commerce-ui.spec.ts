import { test, expect, type Locator } from "@playwright/test";
import { coffeeProducts } from "../src/lib/coffee-catalog";
import { legal } from "../src/lib/legal";

async function fillCheckout(scope: Locator) {
  await scope.getByLabel("Nume și prenume", { exact: false }).fill("Client test");
  await scope.getByLabel("Telefon", { exact: false }).fill("+40744123456");
  await scope.getByLabel("E-mail", { exact: false }).fill("client@example.test");
  await scope.getByLabel("Stradă, număr, bloc, apartament", { exact: false }).fill("Strada Test 10");
  await scope.getByLabel("Județ / sector", { exact: false }).fill("Cluj");
  await scope.getByLabel("Localitate", { exact: false }).fill("Cluj-Napoca");
}

test("managed catalog and shipping reach checkout; a stock conflict keeps the cart", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/catalog", (route) =>
    route.fulfill({
      json: {
        products: coffeeProducts.map((p) => ({ ...p, price: 49.99, stock: 5 })),
        managed: true,
        checkout: true,
        shippingBani: 2000,
      },
    }),
  );
  let requestItems: unknown;
  await page.route("**/api/checkout", async (route) => {
    requestItems = route.request().postDataJSON().items;
    await route.fulfill({
      status: 409,
      json: { error: "Stocul disponibil s-a schimbat." },
    });
  });
  await page.addInitScript(() =>
    localStorage.setItem(
      "makeon-coffee-cart-v1",
      JSON.stringify([{ slug: "intense", grind: "Boabe", quantity: 2 }]),
    ),
  );
  await page.goto("/cafea");
  await page
    .getByRole("button", { name: "Deschide coșul de cafea (2)" })
    .click();
  const cart = page.getByRole("dialog", { name: "Coșul de cafea" });
  await expect(cart).toContainText("119,98");
  await cart.getByRole("link", { name: "Continuă comanda" }).click();
  await expect(page).toHaveURL(/finalizare-comanda/);
  const form = page.locator(".checkout-form");
  await fillCheckout(form);
  await expect(form.getByRole("button", { name: "Trimite comanda" })).toBeDisabled();
  await form.getByRole("checkbox").check();
  await form.getByRole("button", { name: "Trimite comanda" }).click();
  await expect(form.getByRole("alert")).toHaveText(
    "Stocul disponibil s-a schimbat.",
  );
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("makeon-coffee-cart-v1")!).length)).toBe(1);
  expect(requestItems).toEqual([
    { slug: "intense", grind: "Boabe", quantity: 2 },
  ]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("quantities exceeding stock open a made-to-order request instead of direct payment", async ({
  page,
}) => {
  await page.route("**/api/catalog", (route) =>
    route.fulfill({
      json: {
        products: coffeeProducts.map((p) => ({ ...p, price: 49.99, stock: 1 })),
        managed: true,
        checkout: true,
        shippingBani: 0,
      },
    }),
  );
  await page.addInitScript(() =>
    localStorage.setItem(
      "makeon-coffee-cart-v1",
      JSON.stringify([{ slug: "intense", grind: "Boabe", quantity: 2 }]),
    ),
  );
  await page.goto("/cafea");
  await page
    .getByRole("button", { name: "Deschide coșul de cafea (2)" })
    .click();
  await expect(
    page.getByRole("link", { name: "Continuă comanda" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Înregistrează comanda" }),
  ).toBeVisible();
});

test("a mixed cart submits customer details and selections without immediate payment", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/catalog", (route) =>
    route.fulfill({
      json: {
        products: coffeeProducts.map((p) => ({
          ...p,
          price: 50,
          stock: p.slug === "intense" ? 0 : 5,
        })),
        managed: true,
        checkout: true,
        shippingBani: 2000,
      },
    }),
  );
  await page.addInitScript(() =>
    localStorage.setItem(
      "makeon-coffee-cart-v1",
      JSON.stringify([
        { slug: "intense", grind: "Boabe", quantity: 2 },
        { slug: "noblesse", grind: "Boabe", quantity: 1 },
      ]),
    ),
  );
  let attempts = 0;
  const keys: string[] = [];
  await page.route("**/api/orders/request", async (route) => {
    const body = route.request().postDataJSON();
    expect(body.phone).toBe("+40744123456");
    expect(body.termsAccepted).toBe(true);
    expect(body.legalVersion).toBe(legal.version);
    expect(body.items).toHaveLength(2);
    keys.push(body.key);
    await route.fulfill({
      status: ++attempts === 1 ? 502 : 200,
      json:
        attempts === 1
          ? { error: "Reîncearcă solicitarea." }
          : { reference: "MK-test" },
    });
  });
  await page.goto("/cafea");
  await page
    .getByRole("button", { name: "Deschide coșul de cafea (3)" })
    .click();
  const cart = page.getByRole("dialog", { name: "Coșul de cafea" });
  await fillCheckout(cart);
  await expect(cart.getByRole("button", { name: "Înregistrează comanda" })).toBeDisabled();
  await cart.getByRole("checkbox").check();
  await cart.getByRole("button", { name: "Înregistrează comanda" }).click();
  await expect(cart.getByRole("alert")).toHaveText("Reîncearcă solicitarea.");
  await cart.getByRole("button", { name: "Înregistrează comanda" }).click();
  await expect(cart.getByRole("status")).toContainText(
    "Comanda a fost înregistrată",
  );
  expect(keys[0]).toBe(keys[1]);
  expect(await cart.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(
    true,
  );
});

for (const width of [320, 390, 1440]) {
  test(`company invoicing and COD confirmation work at ${width}px`, async ({page}) => {
    await page.setViewportSize({width,height:900});
    await page.route('**/api/catalog', route => route.fulfill({json:{products:coffeeProducts.map(p=>({...p,price:50,stock:5})),managed:true,checkout:true,cod:true,shippingBani:2500}}));
    await page.addInitScript(()=>localStorage.setItem('makeon-coffee-cart-v1',JSON.stringify([{slug:'intense',grind:'Boabe',quantity:2}])));
    let body: Record<string,any> | undefined;
    await page.route('**/api/checkout', async route=>{
      body=route.request().postDataJSON();
      await route.fulfill({json:{reference:'MK-cod-test',paymentMethod:'cod'}});
    });
    await page.goto('/finalizare-comanda');
    const form=page.locator('.checkout-form');
    await fillCheckout(form);
    await form.getByRole('radio',{name:'Persoană juridică'}).check();
    await form.getByLabel('Denumirea firmei',{exact:false}).fill('Firma Test SRL');
    await form.getByLabel('CUI / CIF',{exact:false}).fill('RO12345678');
    await form.getByLabel('Adresa sediului social',{exact:false}).fill('Strada Sediu 20, Cluj-Napoca, Cluj');
    await form.getByRole('radio',{name:/Ramburs/}).check();
    await form.getByRole('checkbox').check();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('.checkout-summary')).toContainText('125,00');
    await form.getByRole('button',{name:'Trimite comanda'}).click();
    await expect(page.getByRole('heading',{name:'Mulțumim pentru comandă.'})).toBeVisible();
    expect(body?.details.paymentMethod).toBe('cod');
    expect(body?.details.billing.companyName).toBe('Firma Test SRL');
    expect(body?.details.billing.address).toContain('Sediu 20');
    expect(body?.details.shipping.line1).toBe('Strada Test 10');
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('makeon-coffee-cart-v1')!).length)).toBe(0);
  });
}

test('card checkout submits billing details and keeps the cart until payment is confirmed', async ({page})=>{
  await page.route('**/api/catalog', route=>route.fulfill({json:{products:coffeeProducts.map(p=>({...p,price:50,stock:5})),managed:true,checkout:true,cod:true,shippingBani:2500}}));
  await page.addInitScript(()=>localStorage.setItem('makeon-coffee-cart-v1',JSON.stringify([{slug:'intense',grind:'Boabe',quantity:1}])));
  let submitted: Record<string,any> | undefined;
  await page.route('**/api/checkout', async route=>{
    submitted=route.request().postDataJSON();
    await route.fulfill({json:{url:'http://127.0.0.1:3000/comanda?card-checkout-test=1'}});
  });
  await page.goto('/finalizare-comanda');
  const form=page.locator('.checkout-form');
  await fillCheckout(form);
  await expect(form.getByRole('radio',{name:/Card online/})).toBeChecked();
  await form.getByRole('checkbox').check();
  await form.getByRole('button',{name:'Trimite comanda'}).click();
  await expect(page).toHaveURL(/card-checkout-test=1/);
  expect(submitted?.details.paymentMethod).toBe('card');
  expect(submitted?.details.billing.type).toBe('personal');
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('makeon-coffee-cart-v1')!).length)).toBe(1);
  expect(await page.evaluate(()=>sessionStorage.getItem('makeon-checkout-key'))).toBe(submitted?.key);
});


for (const destination of ['/cafea','/finalizare-comanda']) {
  test(`return from Stripe to ${destination} immediately releases stock and keeps the cart`,async({page})=>{
    let cancelled=0;
    const key='a1234567-1234-4123-8123-123456789012';
    await page.route('**/api/catalog',route=>route.fulfill({json:{products:coffeeProducts.map(p=>({...p,price:50,stock:cancelled?5:4})),managed:true,checkout:true,cod:true,shippingBani:2500}}));
    await page.route('**/api/checkout/cancel',async route=>{
      expect(route.request().postDataJSON().key).toBe(key);cancelled++;
      await route.fulfill({json:{cancelled:true}});
    });
    await page.addInitScript(({key})=>{
      localStorage.setItem('makeon-coffee-cart-v1',JSON.stringify([{slug:'intense',grind:'Boabe',quantity:1}]));
      sessionStorage.setItem('makeon-checkout-key',key);
      sessionStorage.setItem('makeon-checkout-cart',JSON.stringify([{slug:'intense',grind:'Boabe',quantity:1}]));
    },{key});
    await page.goto(destination);
    await expect.poll(()=>cancelled).toBe(1);
    await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('makeon-checkout-key'))).toBe(null);
    expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('makeon-coffee-cart-v1')!).length)).toBe(1);
    if(destination==='/finalizare-comanda') await expect(page.getByRole('heading',{name:'Finalizează comanda.'})).toBeVisible();
    await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
    expect(cancelled).toBe(1);
  });
}

test('native browser Back from Stripe cancels the unpaid attempt immediately',async({page})=>{
  let cancelled=0;
  await page.route('**/api/catalog',route=>route.fulfill({json:{products:coffeeProducts.map(p=>({...p,price:50,stock:5})),managed:true,checkout:true,cod:true,shippingBani:2500}}));
  await page.addInitScript(()=>localStorage.setItem('makeon-coffee-cart-v1',JSON.stringify([{slug:'intense',grind:'Boabe',quantity:1}])));
  await page.route('https://checkout.stripe.com/mock-return',route=>route.fulfill({contentType:'text/html',body:'<h1>Stripe test checkout</h1>'}));
  await page.route('**/api/checkout',route=>route.fulfill({json:{url:'https://checkout.stripe.com/mock-return'}}));
  await page.route('**/api/checkout/cancel',async route=>{cancelled++;await route.fulfill({json:{cancelled:true}});});
  await page.goto('/finalizare-comanda');
  await fillCheckout(page.locator('.checkout-form'));
  await page.getByRole('checkbox').check();
  await page.getByRole('button',{name:'Trimite comanda'}).click();
  await expect(page).toHaveURL('https://checkout.stripe.com/mock-return');
  await page.goBack();
  await expect(page).toHaveURL(/finalizare-comanda/);
  await expect.poll(()=>cancelled).toBe(1);
  await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('makeon-checkout-key'))).toBe(null);
  await expect(page.getByRole('heading',{name:'Finalizează comanda.'})).toBeVisible();
  // BFCache restores an existing component instead of mounting it again.
  await page.evaluate(()=>{
    sessionStorage.setItem('makeon-checkout-key','b1234567-1234-4123-8123-123456789012');
    window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true}));
  });
  await expect.poll(()=>cancelled).toBe(2);
  await expect.poll(()=>page.evaluate(()=>sessionStorage.getItem('makeon-checkout-key'))).toBe(null);
});
