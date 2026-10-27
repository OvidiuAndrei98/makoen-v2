import { test, expect } from "@playwright/test";
import { coffeeProducts } from "../src/lib/coffee-catalog";
import { eventServices } from "../src/lib/service-options";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/catalog", route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
});

for (const width of [320, 390, 430, 768, 1280]) {
  test(`event formats and enquiry fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/cafea-la-evenimente#formate");
    const section = page.locator('#formate');
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator('article')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const [index, service] of [eventServices.bar, eventServices.trailer].entries()) {
      await section.locator('article').nth(index).getByRole('button').click();
      const form = page.locator('.contact-dialog');
      await expect(form.locator('#interest')).toContainText(service === eventServices.bar ? 'bar mobil' : 'rulotă');
      await expect(form.getByText('Câți invitați estimezi?', { exact: true })).toBeVisible();
      await expect(form.locator('#contact-message')).toHaveAttribute('placeholder', /Data evenimentului/);
      expect(await form.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
      await page.keyboard.press('Escape');
    }
  });
}

for (const [format, service] of [['bar-mobil', eventServices.bar], ['rulota', eventServices.trailer]] as const) test(`event request carries ${format} and details without sending a real email`, async ({ page }) => {
  let request: Record<string, string> | undefined;
  await page.route('**/api/contact', async route => {
    request = route.request().postDataJSON();
    await route.fulfill({json:{ok:true}});
  });
  await page.goto('/');
  await page.locator('.desktop-nav').getByRole('link', {name: 'Evenimentul tău', exact: true}).click();
  await page.locator(`#${format}`).getByRole('button').click();
  await page.locator('#contact-name').fill('Client eveniment');
  await page.locator('#contact-email').fill('event@example.test');
  const setup = format === 'bar-mobil' ? 'bar mobil' : 'rulotă';
  await page.locator('#contact-message').fill(`15 noiembrie, Brașov, 30 de invitați, 4 ore, ${setup}`);
  await page.locator('.contact-dialog button[type="submit"]').click();
  await expect(page.locator('.contact-summary')).toContainText('Solicitarea a fost trimisă.');
  expect(request?.interest).toBe(service);
  expect(request?.message).toContain('Brașov');
  expect(request?.message).toContain('4 ore');
  expect(request?.message).toContain(setup);
  await page.keyboard.press('Escape');
  await page.goto('/apa');
  await expect(page.locator('#formate')).toHaveCount(0);
});
