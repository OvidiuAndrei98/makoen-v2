import { test, expect } from "@playwright/test";
import { coffeeProducts } from "../src/lib/coffee-catalog";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/catalog", route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
});

for (const width of [320, 390, 430, 768, 1280]) {
  test(`water landing remains standalone at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/apa");
    await expect(page.locator(".site")).toHaveClass(/b2b-water/);
    await expect(page).toHaveTitle(/Vero Aqua/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Apă pentru birouri.');
    await expect(page.locator(".world-switch, .mini-switch, .business-switch")).toHaveCount(0);
    await expect(page.locator("#ecosistem")).toHaveCount(0);
    await expect(page.getByRole('navigation', { name: 'Pe pagina de apă' }).locator('a[href="#solutii"]')).toBeVisible();
    await expect(page.locator("#solutii")).toBeAttached();
    await expect(page.locator("#abonamente")).toBeAttached();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

    if (width <= 1000) {
      await page.locator(".menu-button").click();
      const menu = page.locator(".mobile-menu-dialog");
      await expect(menu).toBeVisible();
      await expect(menu.locator('a[href="/apa"]')).toBeVisible();
      await expect(menu.locator('a[href="/apa#filtre"]')).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).not.toBeVisible();
      await page.getByRole('button', { name: 'Cere ofertă pentru apă', exact: true }).click();
    } else {
      const nav = page.locator(".desktop-nav");
      await expect(nav.locator('a[href="/apa"]')).toBeVisible();
      const navBox = await nav.boundingBox();
      const actionsBox = await page.locator(".header-actions").boundingBox();
      expect(navBox!.x + navBox!.width).toBeLessThanOrEqual(actionsBox!.x);
      await page.locator(".header-actions .offer-button").click();
    }
    const form = page.locator(".contact-dialog");
    await expect(form).toBeVisible();
    await expect(form.locator('#interest')).toHaveText('Consultanță pentru apă');
    const whatsapp=await form.getByRole('link',{name:'Preferi WhatsApp?'}).getAttribute('href');
    expect(decodeURIComponent(whatsapp!)).toContain('Consultanță pentru filtrarea apei');
    expect(await form.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  });
}

test("home links directly to water and the water link remains available from the store", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".site")).toHaveClass(/b2b-home/);
  await page.getByRole('link', { name: 'Vezi aparatul și abonamentul', exact: true }).click();
  await expect(page).toHaveURL(/\/apa$/);
  await expect(page.locator(".site")).toHaveClass(/b2b-water/);
  await page.goto("/cafea");
  await expect(page.locator('.desktop-nav a[href="/apa"]')).toBeVisible();
  await page.locator('.desktop-nav a[href="/apa"]').click();
  await expect(page).toHaveURL(/\/apa$/);
  await expect(page.locator(".site")).toHaveClass(/b2b-water/);
});

test('the water subscription keeps its price, term, inclusions and enquiry selection', async ({ page }) => {
  await page.goto('/apa#abonamente');
  const offer = page.locator('#abonamente');
  await expect(offer.getByRole('heading', { level: 1 })).toHaveText('Apă pentru birouri.');
  await expect(offer.locator('.b2b-price')).toContainText('31 €');
  await expect(offer.locator('.b2b-price')).toContainText('+ TVA / lună');
  await expect(offer).toContainText('36 de luni');
  await expect(offer).toContainText('1.116 € + TVA / aparat');
  await expect(offer).toContainText('Înlocuirea filtrelor');
  await expect(offer).toContainText('Mentenanță periodică și igienizare');
  await offer.getByRole('button', { name: 'Cere abonamentul Vero Aqua', exact: true }).click();
  await expect(page.locator('.contact-dialog #interest')).toContainText('Abonament Vero Aqua');
  const whatsapp=await page.locator('.contact-dialog').getByRole('link',{name:'Preferi WhatsApp?'}).getAttribute('href');
  expect(decodeURIComponent(whatsapp!)).toContain('Abonament Vero Aqua — 31 € + TVA/lună');
});
