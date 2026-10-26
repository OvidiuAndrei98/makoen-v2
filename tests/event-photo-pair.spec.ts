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

test('home has one destination per event format and the event hero retains the night photograph', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('.home-events');
  await expect(section.locator('a')).toHaveCount(2);
  await expect(section.getByRole('link', { name: 'Vezi standul', exact: true })).toHaveAttribute('href', '/cafea-la-evenimente#bar-mobil');
  await expect(section.getByRole('link', { name: 'Vezi rulota', exact: true })).toHaveAttribute('href', '/cafea-la-evenimente#rulota');
  await section.getByRole('link', { name: 'Vezi standul', exact: true }).click();
  await expect(page).toHaveURL(/\/cafea-la-evenimente#bar-mobil$/);
  await expect(page.locator('.event-intro-photo img')).toHaveAttribute('src', /rulota-makeon/);
  await expect(page.locator('#bar-mobil')).toBeAttached();
  await expect(page.locator('#rulota')).toBeAttached();
});
