import { test, expect } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
  await page.emulateMedia({ reducedMotion: 'no-preference' });
});

for (const path of ['/', '/cafea-la-evenimente']) {
  for (const width of [768, 1440, 1920]) {
    test(`event photographs and captions share their lines on ${path} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const pair = page.locator('.event-photo-pair');
      await pair.scrollIntoViewIfNeeded();
      await pair.locator('img').evaluateAll(images => Promise.all(images.map(image => (image as HTMLImageElement).decode())));
      const cards = await pair.locator('.event-pair-card').evaluateAll(elements => elements.map(element => {
        const bounds = (selector: string) => {
          const rect = element.querySelector(selector)!.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
        };
        return {
          media: bounds('.event-pair-media'), title: bounds('h3'), action: bounds('.event-pair-action'),
          imageFit: getComputedStyle(element.querySelector('img')!).objectFit,
          imageTransform: getComputedStyle(element.querySelector('img')!).transform,
        };
      }));
      expect(cards).toHaveLength(2);
      expect(Math.abs(cards[0].media.top - cards[1].media.top)).toBeLessThan(1);
      expect(Math.abs(cards[0].media.bottom - cards[1].media.bottom)).toBeLessThan(1);
      expect(Math.abs(cards[0].title.top - cards[1].title.top)).toBeLessThan(1);
      expect(Math.abs(cards[0].action.top - cards[1].action.top)).toBeLessThan(1);
      expect(cards[0].media.width / (cards[0].media.width + cards[1].media.width)).toBeCloseTo(.36, 2);
      expect(cards[0].media.width / cards[0].media.height).toBeCloseTo(.75, 2);
      expect(cards[1].media.width / cards[1].media.height).toBeCloseTo(4 / 3, 2);
      expect(cards.every(card => card.imageFit === 'contain' && card.imageTransform === 'none')).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });
  }
  for (const width of [320, 390]) {
    test(`each event format is a complete mobile block on ${path} at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(path);
      const cards = page.locator('.event-photo-pair .event-pair-card');
      await cards.first().scrollIntoViewIfNeeded();
      const layout = await cards.evaluateAll(elements => elements.map(element => {
        const box = (selector: string) => {
          const rect = element.querySelector(selector)!.getBoundingClientRect();
          return { top: rect.top, bottom: rect.bottom, width: rect.width, height: rect.height };
        };
        return { title: element.querySelector('h3')!.textContent, media: box('.event-pair-media'), heading: box('h3'), action: box('.event-pair-action') };
      }));
      expect(layout[0].title).toContain('Stand');
      expect(layout[1].title).toContain('Rulotă');
      for (const card of layout) {
        expect(card.media.bottom).toBeLessThanOrEqual(card.heading.top);
        expect(card.heading.bottom).toBeLessThanOrEqual(card.action.top);
      }
      expect(layout[0].action.bottom).toBeLessThan(layout[1].media.top);
      expect(layout[0].media.width / layout[0].media.height).toBeCloseTo(.75, 2);
      expect(layout[1].media.width / layout[1].media.height).toBeCloseTo(4 / 3, 2);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    });
  }
}

test('home shows coffee and water, then the coffee shop, then both event formats', async ({ page }) => {
  await page.setViewportSize({ width:1280, height:900 });
  await page.goto('/');
  await expect(page.locator('.home-events .event-pair-card')).toHaveCount(2);
  const catalog = page.locator('#magazin');
  await expect(catalog.locator('.shop-product-card')).toHaveCount(3);
  expect(await catalog.evaluate(section => section.previousElementSibling?.id)).toBe('despre');
  expect(await catalog.evaluate(section => section.nextElementSibling?.className)).toContain('home-events');
  await expect(page.locator('.home-events').getByRole('link', { name:'Vezi standul', exact:true })).toHaveAttribute('href', '/cafea-la-evenimente#bar-mobil');
  await expect(page.locator('.home-events').getByRole('link', { name:'Vezi rulota', exact:true })).toHaveAttribute('href', '/cafea-la-evenimente#rulota');
  await expect(page.locator('#despre')).toContainText('Cafea pentru echipă');
  await expect(page.locator('#despre')).toContainText('Apă filtrată, la îndemână');
  const top = await catalog.evaluate(section => section.getBoundingClientRect().top + scrollY - innerHeight * .8);
  await page.evaluate(async top => {
    const from = scrollY, start = performance.now();
    let progress = 0;
    while (progress < 1) {
      progress = Math.min(1, (performance.now() - start) / 1000);
      scrollTo({ top:from + (top - from) * progress, behavior:'instant' });
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
  }, top);
  await expect(catalog).toHaveAttribute('data-choreography-state', 'running');
  const action = catalog.getByRole('link', { name: 'Deschide magazinul', exact: true });
  const box = (await action.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  const pressed = (await action.boundingBox())!;
  await page.waitForTimeout(180); // A real held pointer must freeze its clickable surface.
  const held = (await action.boundingBox())!;
  expect(Math.abs(held.y - pressed.y)).toBeLessThanOrEqual(1);
  await page.mouse.up();
  await expect(page).toHaveURL(/\/cafea$/);
  await page.locator('.desktop-nav').getByRole('link', { name: 'Evenimentul tău', exact: true }).click();
  await expect(page).toHaveURL(/\/cafea-la-evenimente$/);
  await expect(page.locator('.event-intro-photo img')).toHaveAttribute('src', /rulota-makeon/);
  await expect(page.locator('#bar-mobil')).toBeAttached();
  await expect(page.locator('#rulota')).toBeAttached();
});
