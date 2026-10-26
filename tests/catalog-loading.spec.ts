import { test, expect } from "@playwright/test";
import { coffeeProducts } from "../src/lib/coffee-catalog";

const product = { ...coffeeProducts[0], name: "Produs real", imageUrl: "/test-product.png" };
const catalog = { products: [product], managed: true, checkout: false, shippingBani: 0 };
const pixel = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jL1sAAAAASUVORK5CYII=", "base64");

test("waits for catalog data and photo without showing demo packaging", async ({ page }) => {
  let releaseData!: () => void;
  let releaseImage!: () => void;
  const dataReady = new Promise<void>(resolve => { releaseData = resolve; });
  const imageReady = new Promise<void>(resolve => { releaseImage = resolve; });
  await page.route("**/api/catalog", async route => { await dataReady; await route.fulfill({ json: catalog }); });
  await page.route("**/test-product.png", async route => { await imageReady; await route.fulfill({ body: pixel, contentType: "image/png" }); });
  await page.goto("/cafea", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("status")).toHaveText("Se încarcă produsele…");
  await expect(page.locator(".shop-product-card")).toHaveCount(0);
  releaseData();
  const card = page.locator(".shop-product-card");
  await expect(card).toHaveCount(1);
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator(".product-photo-loading")).toBeVisible();
  await expect(card.locator(".shop-pack")).toHaveCount(0);
  releaseImage();
  await expect(card.locator(".photo-loaded")).toBeVisible();
  await expect(card.locator(".product-photo-loading")).toHaveCount(0);
  await expect(card.getByRole("heading")).toHaveText("Produs real");
});

test("first catalog failure offers retry instead of demo products", async ({ page }) => {
  let failCatalog = true;
  await page.route("**/api/catalog", route => failCatalog
    ? route.fulfill({ status: 503, json: { error: "Unavailable" } })
    : route.fulfill({ json: { ...catalog, products: [{ ...product, imageUrl: undefined }] } }));
  await page.goto("/cafea");
  await expect(page.locator(".coffee-shop").getByRole("alert")).toContainText("Catalogul este temporar indisponibil.");
  await expect(page.locator(".shop-product-card")).toHaveCount(0);
  failCatalog = false;
  await page.getByRole("button", { name: "Reîncearcă", exact: true }).click();
  await expect(page.locator(".shop-product-card")).toHaveCount(1);
  await expect(page.locator(".shop-product-card h3")).toHaveText("Produs real");
});

test("failed image leaves a clear placeholder without falling back to demo artwork", async ({ page }) => {
  await page.route("**/api/catalog", route => route.fulfill({ json: catalog }));
  await page.route("**/test-product.png", route => route.fulfill({ status: 404, body: "" }));
  await page.goto("/cafea");
  await page.locator(".shop-product-card").scrollIntoViewIfNeeded();
  await expect(page.locator(".product-photo-error")).toHaveText("Imagine indisponibilă");
  await expect(page.locator(".product-photo-loading, .shop-pack")).toHaveCount(0);
});

test("product details wait for the cart catalog and preserve selections while it loads", async ({ page }) => {
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/catalog", async route => {
    await gate;
    await route.fulfill({ json:{ products:coffeeProducts, managed:false, checkout:false, shippingBani:0 } });
  });
  await page.goto("/cafea/etiopia", { waitUntil:"domcontentloaded" });
  const add = page.getByRole("button", { name:"Adaugă în coș", exact:true });
  await expect(add).toBeDisabled();
  await expect(page.locator("#product-catalog-status")).toHaveText("Verificăm disponibilitatea produsului…");
  await page.getByRole("combobox", { name:"Măcinare pentru" }).click();
  await page.getByRole("option", { name:"Ibric", exact:true }).click();
  await page.getByRole("spinbutton", { name:"Număr de ambalaje" }).fill("2");
  release();
  await expect(add).toBeEnabled();
  await add.click();
  await page.getByRole("button", { name:"Deschide coșul de cafea (2)" }).click();
  await expect(page.locator(".cart-line")).toContainText("250 g · Ibric");
});

test("product details expose a retry after catalog failure without accepting a lost cart action", async ({ page }) => {
  let failCatalog = true;
  await page.route("**/api/catalog", route => failCatalog
    ? route.fulfill({ status:503, json:{ error:"Unavailable" } })
    : route.fulfill({ json:{ products:coffeeProducts, managed:false, checkout:false, shippingBani:0 } }));
  await page.goto("/cafea/intense");
  const add = page.getByRole("button", { name:"Adaugă în coș", exact:true });
  await expect(add).toBeDisabled();
  await expect(page.locator("#product-catalog-status")).toHaveText("Nu putem verifica produsul momentan.");
  failCatalog = false;
  await page.getByRole("button", { name:"Reîncearcă verificarea", exact:true }).click();
  await expect(add).toBeEnabled();
  await add.click();
  await expect(page.getByRole("button", { name:"Deschide coșul de cafea (1)" })).toBeVisible();
});
