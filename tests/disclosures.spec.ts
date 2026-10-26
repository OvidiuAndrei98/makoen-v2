import { test, expect, type Locator, type Page } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
});

async function controlledPanel(page: Page, trigger: Locator) {
  const id = await trigger.getAttribute('aria-controls');
  expect(id).toBeTruthy();
  return page.locator(`[id="${id}"]`);
}

async function nextFrames(page: Page, count = 1) {
  await page.evaluate(async count => {
    for (let index = 0; index < count; index++) await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }, count);
}

async function expectOpen(panel: Locator) {
  await expect.poll(() => panel.evaluate(element => (element as HTMLElement).inert)).toBe(false);
  await expect(panel).toBeVisible();
}

test('service panels occupy continuously measured height and reverse from their current position', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/apa#servicii');
  const triggers = page.locator('#servicii .makeon-disclosure-trigger');
  const trigger = triggers.first();
  const panel = await controlledPanel(page, trigger);
  const nextTop = await triggers.nth(1).evaluate(element => element.getBoundingClientRect().top - element.closest('.b2b-service-rows')!.getBoundingClientRect().top);
  const recording = page.locator('#servicii .b2b-service-rows').evaluate(async rows => {
    const panel = rows.querySelector('.makeon-disclosure-panel')!;
    const next = rows.querySelectorAll('.makeon-disclosure-trigger')[1];
    const samples = [];
    for (let index = 0; index < 32; index++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      samples.push({ height: panel.getBoundingClientRect().height, next: next.getBoundingClientRect().top - rows.getBoundingClientRect().top });
    }
    return samples;
  });
  await trigger.click();
  const samples = await recording;
  await expectOpen(panel);
  const fullHeight = (await panel.boundingBox())!.height;
  expect(samples.some(sample => sample.height > 1 && sample.height < fullHeight - 1)).toBe(true);
  expect(new Set(samples.map(sample => Math.round(sample.height))).size).toBeGreaterThan(3);
  for (const sample of samples) expect(Math.abs(sample.next - nextTop - sample.height)).toBeLessThanOrEqual(1);

  await trigger.click();
  await nextFrames(page, 2);
  const halfway = (await panel.boundingBox())!.height;
  expect(halfway).toBeGreaterThan(0);
  expect(halfway).toBeLessThan(fullHeight);
  const reversal = await trigger.evaluate(async element => {
    const panel = document.getElementById(element.getAttribute('aria-controls')!)!;
    const before = panel.getBoundingClientRect().height;
    (element as HTMLButtonElement).click();
    await Promise.resolve();
    return { before, after: panel.getBoundingClientRect().height };
  });
  expect(Math.abs(reversal.after - reversal.before)).toBeLessThanOrEqual(1);
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expectOpen(panel);
  expect(Math.abs((await panel.boundingBox())!.height - fullHeight)).toBeLessThanOrEqual(1);
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(panel).toBeHidden();
  expect(errors).toEqual([]);
});

test('FAQ and services use independent single-open groups with keyboard-operable reversible headings', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/apa#servicii');
  const service = page.locator('#servicii .makeon-disclosure-trigger').first();
  await service.click();
  await expectOpen(await controlledPanel(page, service));
  const faq = page.locator('.b2b-faq-layout');
  const first = faq.locator('.makeon-disclosure-trigger').nth(0);
  const second = faq.locator('.makeon-disclosure-trigger').nth(1);
  await first.focus();
  await page.keyboard.press('Enter');
  await second.focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('aria-expanded', 'false');
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  await expect(faq.locator('.makeon-disclosure-trigger[aria-expanded="true"]')).toHaveCount(1);
  await expect(await controlledPanel(page, first)).toBeHidden();
  await expectOpen(await controlledPanel(page, second));
  await expect(service).toHaveAttribute('aria-expanded', 'true');
  await second.focus();
  await page.keyboard.press('Enter');
  await expect(await controlledPanel(page, second)).toBeHidden();
  await expect(service).toHaveAttribute('aria-expanded', 'true');
});

for (const config of [{ width: 320, height: 568, motion: 'reduce' }, { width: 390, height: 640, motion: 'no-preference' }] as const) {
  test(`short mobile panels keep hidden links out of Tab and one contextual action after the group at ${config.width}px`, async ({ page }) => {
    await page.setViewportSize({ width: config.width, height: config.height });
    await page.emulateMedia({ reducedMotion: config.motion });
    await page.goto('/apa#filtre');
    const filters = page.locator('#filtre').getByRole('button', { name: 'Filtre și compatibilitate', exact: true });
    await expect(filters).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('link', { name: 'Filtre pentru espressor', exact: true })).toHaveCount(0);
    await filters.focus();
    await page.keyboard.press('Tab');
    await expect(page.locator('#servicii .makeon-disclosure-trigger').first()).toBeFocused();
    await filters.focus();
    await page.keyboard.press('Enter');
    const filterPanel = await controlledPanel(page, filters);
    await expectOpen(filterPanel);
    await filters.focus();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Cere un filtru compatibil', exact: true })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Filtre pentru espressor', exact: true })).toBeFocused();
    await filters.focus();
    await page.keyboard.press('Enter');
    await expect(filterPanel).toBeHidden();

    const services = page.locator('#servicii');
    const maintenance = services.getByRole('button', { name: 'Mentenanță și schimb de filtre', exact: true });
    await maintenance.focus();
    await page.keyboard.press('Enter');
    const panel = await controlledPanel(page, maintenance);
    if (config.motion === 'reduce') {
      await nextFrames(page, 2);
      expect(await panel.evaluate(element => Math.abs(element.getBoundingClientRect().height - element.firstElementChild!.getBoundingClientRect().height))).toBeLessThanOrEqual(1);
    }
    await expectOpen(panel);
    const action = services.locator('.office-service-action button');
    await expect(action).toHaveCount(1);
    await expect(action).toHaveAccessibleName('Solicită mentenanță și filtre');
    await expect(services.locator('.makeon-disclosure-panel button')).toHaveCount(0);
    const [rows, cta] = await Promise.all([services.locator('.b2b-service-rows').boundingBox(), action.boundingBox()]);
    expect(cta!.y).toBeGreaterThanOrEqual(rows!.y + rows!.height - 1);
    await action.click();
    const dialog = page.locator('.contact-dialog');
    await expect(dialog.locator('#interest')).toHaveText('Mentenanță și filtre');
    const whatsapp = await dialog.getByRole('link', { name: 'Preferi WhatsApp?' }).getAttribute('href');
    expect(decodeURIComponent(whatsapp!)).toContain('Schimb filtre și mentenanță');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

test('the visible office coffee preview uses working catalog cards and the existing cart', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto('/cafea-pentru-birouri#magazin');
  const catalog = page.locator('#magazin #office-shop-products');
  await expect(catalog.locator('.shop-product-card').first()).toBeVisible();
  const card = catalog.locator('.shop-product-card').first();
  await expect(card.locator('.coffee-pack-art')).toBeVisible();
  await expect(card.getByRole('link', { name: 'Intense', exact: true })).toHaveAttribute('href', '/cafea/intense');
  await card.getByRole('button', { name: 'Adaugă Intense în coș', exact: true }).click();
  const trigger = page.locator('.header-actions .cart-button');
  await expect(trigger).toHaveAccessibleName('Deschide coșul de cafea (1)');
  const box = await trigger.boundingBox();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  const cart = page.getByRole('dialog', { name: 'Coșul de cafea' });
  await expect(cart.locator('.cart-line')).toHaveCount(1);
  await expect(cart).toContainText('Intense');
  await cart.locator('.remove-line').click();
  await expect(cart.locator('.empty-cart')).toBeVisible();
});
