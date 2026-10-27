import { test, expect, type Locator, type Page } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
  await page.route('**/api/contact', route => route.abort());
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

test('FAQ panels occupy continuously measured height and reverse from their current position', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/apa');
  const rows = page.locator('.b2b-faq-layout > div').last();
  const triggers = rows.locator('.makeon-disclosure-trigger');
  const trigger = triggers.first();
  await trigger.scrollIntoViewIfNeeded();
  const panel = await controlledPanel(page, trigger);
  const nextTop = await rows.evaluate(rows => rows.querySelectorAll('.makeon-disclosure-trigger')[1].getBoundingClientRect().top - rows.getBoundingClientRect().top);
  const recording = rows.evaluate(async rows => {
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

test('FAQ keeps one open answer and keyboard focus on the activated heading', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/apa');
  const faq = page.locator('.b2b-faq-layout');
  const first = faq.locator('.makeon-disclosure-trigger').nth(0);
  const second = faq.locator('.makeon-disclosure-trigger').nth(1);
  await first.focus();
  await page.keyboard.press('Enter');
  await expectOpen(await controlledPanel(page, first));
  await second.focus();
  await page.keyboard.press('Enter');
  await expect(first).toHaveAttribute('aria-expanded', 'false');
  await expect(second).toHaveAttribute('aria-expanded', 'true');
  await expect(faq.locator('.makeon-disclosure-trigger[aria-expanded="true"]')).toHaveCount(1);
  await expect(await controlledPanel(page, first)).toBeHidden();
  await expectOpen(await controlledPanel(page, second));
  await expect(second).toBeFocused();
  await page.keyboard.press('Space');
  await expect(await controlledPanel(page, second)).toBeHidden();
  await expect(second).toBeFocused();
});

for (const config of [{ width: 320, height: 568, motion: 'reduce' }, { width: 390, height: 640, motion: 'no-preference' }] as const) {
  test(`short mobile keeps filtration visible and FAQ and offer usable at ${config.width}px`, async ({ page }) => {
    await page.setViewportSize({ width: config.width, height: config.height });
    await page.emulateMedia({ reducedMotion: config.motion });
    await page.goto('/apa#filtre');
    await expect(page.locator('#filtre .b2b-filter-media img')).toBeVisible();
    const trigger = page.locator('.b2b-faq-layout .makeon-disclosure-trigger').first();
    await trigger.focus();
    await page.keyboard.press('Enter');
    const panel = await controlledPanel(page, trigger);
    if (config.motion === 'reduce') {
      await nextFrames(page, 2);
      expect(await panel.evaluate(element => Math.abs(element.getBoundingClientRect().height - element.firstElementChild!.getBoundingClientRect().height))).toBeLessThanOrEqual(1);
    }
    await expectOpen(panel);
    await page.keyboard.press('Tab');
    await expect(page.locator('.b2b-faq-layout .makeon-disclosure-trigger').nth(1)).toBeFocused();
    const action = page.locator('#servicii').getByRole('button', { name: 'Cere ofertă pentru apă', exact: true });
    await action.click();
    const dialog = page.locator('.contact-dialog');
    await expect(dialog.locator('#interest')).toHaveText('Consultanță pentru apă');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(action).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

test('the visible office coffee preview uses working catalog cards and the existing cart', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 740 });
  await page.goto('/cafea-pentru-birouri#magazin');
  const catalog = page.locator('#magazin #office-shop-products');
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
