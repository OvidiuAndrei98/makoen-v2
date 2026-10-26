import { test, expect, type Locator, type Page } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';
import { expectHomeSceneMode } from './helpers/home-scene';

const lenisClass = /(?:^|\s)lenis(?:\s|$)/;
const stoppedClass = /(?:^|\s)lenis-stopped(?:\s|$)/;

async function mockCatalog(page: Page) {
  await page.route('**/api/catalog', route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
}

test.beforeEach(async ({ page }) => {
  await mockCatalog(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
});

async function clickVisible(page: Page, control: Locator) {
  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  // A sticky header's visible control must not be scrolled back to its flow box.
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

async function frames(page: Page, count = 12) {
  return page.evaluate(async count => {
    const samples = [];
    for (let index = 0; index < count; index++) {
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      const root = document.querySelector('.home-opening');
      samples.push({
        y: scrollY, openingDocumentTop: root ? root.getBoundingClientRect().top + scrollY : null,
        smooth: document.documentElement.classList.contains('lenis-smooth'),
        stopped: document.documentElement.classList.contains('lenis-stopped'),
        overlayLocked: !!document.querySelector('dialog[open]') || getComputedStyle(document.body).overflow === 'hidden',
      });
    }
    return samples;
  }, count);
}

async function expectPosition(page: Page, target: number) {
  await expect.poll(() => page.evaluate(target => Math.abs(scrollY - target), target)).toBeLessThanOrEqual(1);
}

async function expectStablePosition(page: Page, target: number) {
  await expect.poll(async () => Math.max(...(await frames(page, 8)).map(frame => Math.abs(frame.y - target)))).toBeLessThanOrEqual(1);
}

async function openingReady(page: Page) {
  await expect(page.locator('.opening-services')).toBeVisible();
  await expectHomeSceneMode(page);
  await page.evaluate(() => document.fonts.ready);
}

async function anchorPosition(page: Page, id: string) {
  return page.locator(`#${id}`).evaluate(element => {
    const offset = (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
      + (parseFloat(getComputedStyle(element).scrollMarginTop) || 0);
    return Math.max(0, Math.min(element.getBoundingClientRect().top + scrollY - offset,
      document.documentElement.scrollHeight - innerHeight));
  });
}

test('wheel input is interpolated while the opening root retains its document position during the scene', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(lenisClass);
  await openingReady(page);
  const start = await page.evaluate(() => scrollY);
  const openingTop = await page.locator('.home-opening').evaluate(element => element.getBoundingClientRect().top + scrollY);
  await page.mouse.move(700, 650);
  const recording = frames(page, 20);
  await page.mouse.wheel(0, 420);
  const samples = await recording;
  expect(samples.some(frame => frame.y > start + 1 && frame.y < start + 419)).toBe(true);
  expect(samples.filter(frame => frame.y > start + 1).some(frame => frame.smooth)).toBe(true);
  for (const [index, frame] of samples.entries()) {
    if (index) expect(frame.y).toBeGreaterThanOrEqual(samples[index - 1].y - 1);
    expect(frame.openingDocumentTop).not.toBeNull();
    expect(Math.abs(frame.openingDocumentTop! - openingTop)).toBeLessThanOrEqual(1);
  }
  await expectPosition(page, start + 420);
  expect(errors).toEqual([]);
});

test('offer and cart dialogs stop page inertia, retain native inner scrolling and resume without a jump', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 480 });
  await page.addInitScript(lines => localStorage.setItem('makeon-coffee-cart-v1', JSON.stringify(lines)),
    coffeeProducts.slice(0, 8).map(product => ({ slug: product.slug, quantity: 1, grind: 'Boabe' })));
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveClass(lenisClass);
  for (const config of [
    { trigger: '.header-actions .offer-button', dialog: '.contact-dialog' },
    { trigger: '.header-actions .cart-button', dialog: '.cart-drawer' },
  ]) {
    await page.mouse.move(700, 400);
    await page.mouse.wheel(0, 350);
    await frames(page, 2);
    await clickVisible(page, page.locator(config.trigger));
    const dialog = page.locator(config.dialog);
    await expect(dialog).toBeVisible();
    await expect(html).toHaveClass(stoppedClass);
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    const lockedPosition = await page.evaluate(() => scrollY);
    await expect.poll(() => dialog.evaluate(element => element.scrollHeight - element.clientHeight)).toBeGreaterThan(0);
    const initialInner = await dialog.evaluate(element => element.scrollTop);
    const box = await dialog.boundingBox();
    await page.mouse.move(box!.x + 10, box!.y + box!.height / 2);
    await page.mouse.wheel(0, 260);
    await expect.poll(() => dialog.evaluate(element => element.scrollTop)).toBeGreaterThan(initialInner);
    await expectStablePosition(page, lockedPosition);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(html).not.toHaveClass(stoppedClass);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await expectStablePosition(page, lockedPosition);
    await page.mouse.move(700, 400);
    await page.mouse.wheel(0, 120);
    await expectPosition(page, lockedPosition + 120);
  }
});

test('same-page anchors and Back preserve CSS offsets, focus and ordinary hash history', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 800 });
  await page.goto('/#solutii');
  await expect(page.locator('html')).toHaveClass(lenisClass);
  await openingReady(page);
  const solutions = await anchorPosition(page, 'solutii');
  await expectPosition(page, solutions);
  const historyLength = await page.evaluate(() => history.length);
  const about = await anchorPosition(page, 'despre');
  // Programmatic header focus must preserve the history position being tested.
  await page.locator('.desktop-nav').getByRole('link', { name: 'Despre Makeon', exact: true })
    .evaluate(element => (element as HTMLElement).focus({ preventScroll: true }));
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/#despre$/);
  await expectPosition(page, about);
  await expect(page.locator('#despre')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('#despre a').first()).toBeFocused();
  await expect(page.locator('#despre')).not.toHaveAttribute('tabindex');
  expect(await page.evaluate(() => history.length)).toBe(historyLength + 1);
  await page.getByRole('link', { name: 'Sari la conținut', exact: true })
    .evaluate(element => (element as HTMLElement).focus({ preventScroll: true }));
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/#main-content$/);
  await expectPosition(page, await anchorPosition(page, 'main-content'));
  await expect(page.locator('main')).toBeFocused();
  expect(await page.evaluate(() => history.length)).toBe(historyLength + 2);
  await page.goBack();
  await expect(page).toHaveURL(/\/#despre$/);
  await expectPosition(page, about);
  await expectStablePosition(page, about);
  await page.goBack();
  await expect(page).toHaveURL(/\/#solutii$/);
  await expectPosition(page, solutions);
  await expectStablePosition(page, solutions);
});

test('route changes, Back and keyboard focus discard momentum instead of carrying it into the next page', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(lenisClass);
  await openingReady(page);
  await page.mouse.move(700, 650);
  await page.mouse.wheel(0, 800);
  const moving = await frames(page, 2);
  expect(moving.at(-1)!.y).toBeLessThan(799);
  const departure = page.evaluate(() => new Promise<number>(resolve => {
    document.addEventListener('click', () => resolve(scrollY), { capture: true, once: true });
  }));
  await clickVisible(page, page.locator('.desktop-nav').getByRole('link', { name: 'Apă & filtrare', exact: true }));
  const savedPosition = await departure;
  await expect(page).toHaveURL(/\/apa$/);
  await expect(page.locator('.b2b-water')).toBeVisible();
  await expectPosition(page, 0);
  await expectStablePosition(page, 0);
  await page.mouse.move(700, 650);
  await page.mouse.wheel(0, 400);
  await frames(page, 2);
  await page.keyboard.press('Tab');
  const focused = await page.evaluate(() => ({ y: scrollY, tag: document.activeElement?.tagName }));
  expect(focused.tag).not.toBe('BODY');
  await expectStablePosition(page, focused.y);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await openingReady(page);
  await expectPosition(page, savedPosition);
  await expectStablePosition(page, savedPosition);
  await expect(page.locator('html')).toHaveClass(lenisClass);
});

test('changing reduced motion destroys smoothing and restores native wheel scrolling without hiding offers', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveClass(lenisClass);
  await openingReady(page);
  await page.mouse.move(700, 650);
  await page.mouse.wheel(0, 300);
  await frames(page, 2);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(html).not.toHaveClass(/(?:^|\s)lenis(?:-|\s|$)/);
  await expect(page.locator('.home-opening .pin-spacer')).toHaveCount(0);
  await expect(page.locator('.opening-services').getByRole('link')).toHaveCount(2);
  await expect(html).toHaveCSS('scroll-behavior', 'auto');
  const nativeStart = await page.evaluate(() => scrollY);
  const recording = frames(page, 16);
  await page.mouse.wheel(0, 280);
  const native = await recording;
  await expectPosition(page, nativeStart + 280);
  // A native wheel step has no intermediate Lenis positions or smooth class.
  for (const frame of native) {
    const delta = frame.y - nativeStart;
    expect(Math.abs(delta) <= 1 || Math.abs(delta - 280) <= 1).toBe(true);
    expect(frame.smooth).toBe(false);
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(html).toHaveClass(lenisClass);
  await openingReady(page);
  const resumed = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 200);
  await expectPosition(page, resumed + 200);
  await expectStablePosition(page, resumed + 200);
  await expectHomeSceneMode(page);
});

test('mobile touch stays native and the menu-to-cart handoff keeps scrolling locked until Escape', async ({ browser }) => {
  const context = await browser.newContext({
    baseURL: test.info().project.use.baseURL, viewport: { width: 390, height: 844 },
    isMobile: true, hasTouch: true, reducedMotion: 'no-preference',
  });
  const page = await context.newPage();
  try {
    await mockCatalog(page);
    await page.addInitScript(() => localStorage.setItem('makeon-coffee-cart-v1', JSON.stringify([
      { slug: 'intense', quantity: 1, grind: 'Boabe' },
    ])));
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveClass(lenisClass);
    await expect(page.locator('.home-opening .pin-spacer')).toHaveCount(0);
    const client = await context.newCDPSession(page);
    const recording = frames(page, 40);
    // This Chrome target emits no touchmove for synthesizeScrollGesture; send
    // a real touch sequence so native scrolling is exercised, including inertia.
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart', touchPoints: [{ x: 195, y: 650, id: 1, radiusX: 2, radiusY: 2, force: 1 }],
    });
    for (let index = 1; index <= 12; index++) {
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => resolve())));
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove', touchPoints: [{ x: 195, y: 650 - 340 * index / 12, id: 1, radiusX: 2, radiusY: 2, force: 1 }],
      });
    }
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    const touch = await recording;
    expect(touch.some(frame => frame.y > 1)).toBe(true);
    expect(touch.every(frame => !frame.smooth)).toBe(true);
    await expect.poll(async () => {
      const samples = await frames(page, 6);
      return Math.max(...samples.map(frame => frame.y)) - Math.min(...samples.map(frame => frame.y));
    }).toBeLessThanOrEqual(1);
    const position = await page.evaluate(() => scrollY);
    await clickVisible(page, page.getByRole('button', { name: 'Deschide meniul', exact: true }));
    const menu = page.getByRole('dialog', { name: 'Meniul Makeon' });
    await expect(menu).toBeVisible();
    await expect(html).toHaveClass(stoppedClass);
    await expect(menu.locator('.mobile-menu-link').last()).toHaveCSS('opacity', '1');
    const handoff = frames(page, 40);
    await clickVisible(page, menu.getByRole('button', { name: 'Deschide coșul de cafea (1)', exact: true }));
    const cart = page.getByRole('dialog', { name: 'Coșul de cafea' });
    await expect(menu).not.toBeVisible();
    await expect(cart).toBeVisible();
    await expect(cart.locator('.cart-line')).toHaveCount(1);
    for (const frame of await handoff) {
      expect(frame.overlayLocked).toBe(true);
      expect(frame.stopped).toBe(true);
      expect(Math.abs(frame.y - position)).toBeLessThanOrEqual(1);
    }
    await page.keyboard.press('Escape');
    await expect(cart).not.toBeVisible();
    await expect(html).not.toHaveClass(stoppedClass);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
    await expect(page.locator('.header-actions .cart-button')).toBeFocused();
    await expectStablePosition(page, position);
  } finally {
    await context.close();
  }
});
