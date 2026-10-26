import { expect, type Page } from '@playwright/test';

export async function homeSceneEnabled(page: Page) {
  return page.evaluate(() => innerWidth >= 1280 && innerHeight >= 960
    && !matchMedia('(prefers-reduced-motion: reduce)').matches);
}

export async function expectHomeSceneMode(page: Page) {
  const enabled = await homeSceneEnabled(page);
  const opening = page.locator('.home-opening');
  await expect(opening).toHaveClass(enabled ? /\bis-scroll-scene\b/ : /^(?!.*\bis-scroll-scene\b)/);
  await expect(opening.locator('.pin-spacer')).toHaveCount(0);
  if(enabled) await expect(opening.locator('.opening-stage')).toHaveCSS('position','sticky');
  else await expect(opening.locator('.opening-stage')).not.toHaveCSS('position','sticky');
  return enabled;
}

export async function homeSceneMetrics(page: Page) {
  return page.locator('.home-opening').evaluate(root => {
    const stage = root.querySelector<HTMLElement>('.opening-stage')!;
    const data = (root as HTMLElement).dataset;
    const start = Number(data.openingStart);
    const end = Number(data.openingEnd);
    return {
      start, end, range: end - start,
      reservedRange: root.getBoundingClientRect().height - stage.getBoundingClientRect().height,
      progress: Number(data.openingProgress),
      stageHeight: stage.getBoundingClientRect().height,
      rootHeight: root.getBoundingClientRect().height,
    };
  });
}

export async function seekHomeScene(page: Page, progress: number) {
  await page.evaluate(() => document.fonts.ready);
  if (!await expectHomeSceneMode(page)) return;
  await expect.poll(async () => (await homeSceneMetrics(page)).range).toBeGreaterThan(0);
  const { start, range } = await homeSceneMetrics(page);
  await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), start + range * progress);
  await expect.poll(async () => Math.abs((await homeSceneMetrics(page)).progress - progress)).toBeLessThan(.015);
}

export async function revealHomeOffers(page: Page) {
  if (await expectHomeSceneMode(page)) await seekHomeScene(page, 1);
  else await page.locator('.opening-services').scrollIntoViewIfNeeded();
  for (const article of await page.locator('.opening-service').all()) await expect(article).toHaveCSS('opacity', '1');
}
