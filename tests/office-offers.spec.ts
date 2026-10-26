import { test, expect, type Page, type Locator } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';
import { revealHomeOffers } from './helpers/home-scene';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
});

async function settleOpening(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await revealHomeOffers(page);
}

async function expectOfferData(page: Page) {
  const coffee = page.locator('.opening-service-coffee');
  const water = page.locator('.opening-service-water');
  await expect(coffee.getByRole('img', { name: 'SwitchMORN Coffee', exact: true })).toBeVisible();
  await expect(water.getByRole('img', { name: 'Vero Aqua', exact: true })).toBeVisible();
  await expect(coffee.getByText('Ofertă personalizată', { exact: true })).toBeVisible();
  await expect(coffee).toContainText('Instalarea și mentenanța se stabilesc în ofertă.');
  await expect(water.locator('.opening-price')).toHaveText('31 € + TVA / lună');
  await expect(water.locator('.opening-water-term')).toHaveText('per aparat · 36 de luni');
  await expect(coffee.getByRole('link', { name: 'Vezi soluția de cafea', exact: true })).toHaveAttribute('href', '/cafea-pentru-birouri');
  await expect(water.getByRole('link', { name: 'Vezi aparatul și abonamentul', exact: true })).toHaveAttribute('href', '/apa');
  for (const image of await page.locator('.opening-equipment img').all()) {
    await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
}

async function expectOfferGeometry(page: Page) {
  const geometry = await page.locator('.opening-offer-surface').evaluateAll(surfaces => surfaces.map(surface => {
    const bounds = surface.getBoundingClientRect();
    const copy = surface.querySelector('.opening-service-copy')!.getBoundingClientRect();
    const product = surface.querySelector('.opening-equipment')!.getBoundingClientRect();
    const overlapX = Math.min(copy.right, product.right) - Math.max(copy.left, product.left);
    const overlapY = Math.min(copy.bottom, product.bottom) - Math.max(copy.top, product.top);
    const clipped = Array.from(surface.querySelectorAll<HTMLElement>(
      '.opening-offer-brand img, h2, .opening-service-description, .opening-commercial, .opening-service-link, .opening-equipment'
    )).filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.left < bounds.left - 1 || rect.right > bounds.right + 1
        || rect.top < bounds.top - 1 || rect.bottom > bounds.bottom + 1
        || element.scrollWidth > element.clientWidth + 2;
    }).map(element => element.className || element.tagName);
    return { overlaps: overlapX > 1 && overlapY > 1, clipped };
  }));
  expect(geometry).toHaveLength(2);
  for (const offer of geometry) {
    expect(offer.overlaps).toBe(false);
    expect(offer.clipped).toEqual([]);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
}

async function matrix(locator: Locator) {
  return locator.evaluate(element => {
    const value = new DOMMatrix(getComputedStyle(element).transform);
    return [value.a, value.b, value.c, value.d, value.e, value.f];
  });
}

for (const viewport of [{ width: 1440, height: 1000 }, { width: 1920, height: 1080 }]) {
  test(`both offer interiors fit the completed scene surfaces at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    await settleOpening(page);
    await expectOfferData(page);
    await expectOfferGeometry(page);
    const rows = await page.locator('.opening-services').evaluate(panel => {
      const area = panel.getBoundingClientRect();
      const heroElement = panel.parentElement!.querySelector('.opening-atmosphere')!;
      const hero = heroElement.getBoundingClientRect();
      const clip = getComputedStyle(heroElement).clipPath;
      const inset = clip.startsWith('inset(') ? parseFloat(clip.replace(/^inset\(|\)$/g,'').split(/\s+/)[1] || '0') : 0;
      const heroRight = hero.right - hero.width * inset / 100;
      return Array.from(panel.querySelectorAll('.opening-offer-surface')).map(surface => {
        const rect = surface.getBoundingClientRect();
        return { withinPanel: rect.top >= area.top - 1 && rect.bottom <= area.bottom + 1,
          besideHero: area.left >= heroRight - 1 && Math.abs(area.top - hero.top) <= 1 && Math.abs(area.bottom - hero.bottom) <= 1,
          share: rect.height / area.height };
      });
    });
    for (const row of rows) {
      expect(row.withinPanel).toBe(true);
      expect(row.besideHero).toBe(true);
      expect(Math.abs(row.share - .5)).toBeLessThan(.03);
    }
  });
}

test('intermediate offers remain adjoining columns below the hero with complete commercial details', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('.opening-services').scrollIntoViewIfNeeded();
  await settleOpening(page);
  await expectOfferData(page);
  await expectOfferGeometry(page);
  const [hero, coffee, water] = await Promise.all([
    page.locator('.opening-atmosphere').boundingBox(),
    page.locator('.opening-offer-surface-coffee').boundingBox(),
    page.locator('.opening-offer-surface-water').boundingBox(),
  ]);
  expect(Math.abs(coffee!.y - water!.y)).toBeLessThan(2);
  expect(water!.x).toBeGreaterThanOrEqual(coffee!.x + coffee!.width - 1);
  expect(coffee!.y).toBeGreaterThanOrEqual(hero!.y + hero!.height - 1);
});

test('mobile offers stack in normal flow without losing brands, conditions or usable links', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('.opening-services').scrollIntoViewIfNeeded();
  await settleOpening(page);
  await expectOfferData(page);
  await expectOfferGeometry(page);
  const coffee = await page.locator('.opening-offer-surface-coffee').boundingBox();
  const water = await page.locator('.opening-offer-surface-water').boundingBox();
  expect(Math.abs(coffee!.x - water!.x)).toBeLessThan(2);
  expect(Math.abs(coffee!.width - water!.width)).toBeLessThan(2);
  expect(water!.y).toBeGreaterThanOrEqual(coffee!.y + coffee!.height - 1);
  for (const link of await page.locator('.opening-service-link').all()) {
    expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
});

test('hover and focus move only the inner product wrapper after the entrance', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await settleOpening(page);
  for (const name of ['coffee', 'water']) {
    const article = page.locator(`.opening-service-${name}`);
    const interaction = article.locator('.opening-product-interaction');
    const scroll = article.locator('.opening-product-mask > .opening-product-scroll');
    const initialArticle = await matrix(article);
    const initialScroll = await matrix(scroll);
    const box = await article.boundingBox();
    await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
    await expect.poll(async () => (await matrix(interaction))[0]).toBeGreaterThan(1);
    expect(await matrix(article)).toEqual(initialArticle);
    expect(await matrix(scroll)).toEqual(initialScroll);
    await page.mouse.move(0, 0);
    await expect.poll(async () => (await matrix(interaction))[0]).toBeCloseTo(1, 4);
    const link = article.getByRole('link');
    await link.evaluate(element => (element as HTMLElement).focus({ preventScroll: true }));
    await expect(link).toBeFocused();
    await expect.poll(async () => (await matrix(interaction))[0]).toBeGreaterThan(1);
    expect(await matrix(article)).toEqual(initialArticle);
    expect(await matrix(scroll)).toEqual(initialScroll);
  }
});

test('reduced motion keeps products stable through hover and focus', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.opening-services').scrollIntoViewIfNeeded();
  await settleOpening(page);
  for (const name of ['coffee', 'water']) {
    const article = page.locator(`.opening-service-${name}`);
    const interaction = article.locator('.opening-product-interaction');
    const scroll = article.locator('.opening-product-mask > .opening-product-scroll');
    const initialArticle = await matrix(article);
    await article.hover();
    expect(await matrix(interaction)).toEqual([1, 0, 0, 1, 0, 0]);
    await article.getByRole('link').focus();
    expect(await matrix(interaction)).toEqual([1, 0, 0, 1, 0, 0]);
    expect(await matrix(scroll)).toEqual([1, 0, 0, 1, 0, 0]);
    expect(await matrix(article)).toEqual(initialArticle);
  }
});
