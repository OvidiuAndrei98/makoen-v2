import { test, expect, type Locator, type Page } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';
import { expectHomeSceneMode, homeSceneMetrics, revealHomeOffers, seekHomeScene } from './helpers/home-scene';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
});

async function clickVisible(page: Page, control: Locator) {
  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

async function settleEntrance(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('.opening-copy')).toHaveCSS('opacity', '1');
  await expect.poll(() => page.locator('.opening-photo-enter').evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a)).toBe(1);
}

async function expectCompleteOpening(page: Page) {
  const opening = page.locator('.home-opening');
  await expect(opening.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(opening.locator('h1')).toHaveText(/Cafea și apă\s*pentru biroul tău\./);
  await expect(opening.locator('.opening-description')).toHaveText('Espressoare SwitchMORN și dozatoare Vero Aqua pentru companii.');
  await expect(opening.getByRole('button', { name: 'Cere ofertă pentru birou', exact: true })).toBeEnabled();
  await expect(opening.getByRole('link', { name: 'Descoperă cafeaua și apa', exact: true })).toHaveAttribute('href', '#solutii');
  await expect(opening.getByRole('link', { name: 'Vezi soluția de cafea', exact: true })).toHaveAttribute('href', '/cafea-pentru-birouri');
  await expect(opening.getByRole('link', { name: 'Vezi aparatul și abonamentul', exact: true })).toHaveAttribute('href', '/apa');
  await expect(opening.locator('.opening-price')).toHaveText('31 € + TVA / lună');
  await expect(opening.locator('.opening-water-term')).toHaveText('per aparat · 36 de luni');
  await expect(opening.locator('.opening-service')).toHaveCount(2);
  for (const article of await opening.locator('.opening-service').all()) {
    await expect(article).toBeVisible();
    expect(await article.evaluate(element => !!element.closest('[inert], [hidden], [aria-hidden="true"]'))).toBe(false);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
}

const layouts = [
  { width: 360, height: 800, motion: 'no-preference', layout: 'stack' },
  { width: 1024, height: 900, motion: 'no-preference', layout: 'columns' },
  { width: 1280, height: 800, motion: 'no-preference', layout: 'columns' },
  { width: 1440, height: 1000, motion: 'no-preference', layout: 'panel' },
  { width: 1440, height: 1000, motion: 'reduce', layout: 'panel' },
] as const;

for (const config of layouts) test(`the complete opening remains readable and keyboard reachable at ${config.width}x${config.height} with ${config.motion}`, async ({ page }) => {
  await page.setViewportSize({ width: config.width, height: config.height });
  await page.emulateMedia({ reducedMotion: config.motion });
  await page.goto('/');
  await settleEntrance(page);
  const pinned = await expectHomeSceneMode(page);
  await revealHomeOffers(page);
  await expectCompleteOpening(page);
  const geometry = await page.locator('.opening-stage').evaluate(stage => {
    const rect = (selector: string) => {
      const bounds = stage.querySelector(selector)!.getBoundingClientRect();
      const clip = getComputedStyle(stage.querySelector(selector)!).clipPath;
      const rightInset = selector === '.opening-atmosphere' && clip.startsWith('inset(')
        ? parseFloat(clip.replace(/^inset\(|\)$/g,'').split(/\s+/)[1] || '0') : 0;
      const right = bounds.right - bounds.width * rightInset / 100;
      return { left: bounds.left, right, top: bounds.top, bottom: bounds.bottom, width:right-bounds.left, height: bounds.height };
    };
    return {
      root: stage.parentElement!.getBoundingClientRect().height, stage: stage.getBoundingClientRect().height,
      hero: rect('.opening-atmosphere'), copy: rect('.opening-copy'), title: rect('h1'),
      description: rect('.opening-description'), actions: rect('.opening-actions'),
      coffee: rect('.opening-offer-surface-coffee'), water: rect('.opening-offer-surface-water'),
    };
  });
  if (pinned) {
    const scene = await homeSceneMetrics(page);
    expect(scene.range).toBeGreaterThanOrEqual(config.height * .6);
    expect(scene.range).toBeLessThanOrEqual(config.height * .9);
    expect(Math.abs(scene.reservedRange - scene.range)).toBeLessThanOrEqual(1);
  } else expect(Math.abs(geometry.root - geometry.stage)).toBeLessThanOrEqual(1);
  for (const element of [geometry.title, geometry.description, geometry.actions]) {
    expect(element.left).toBeGreaterThanOrEqual(geometry.copy.left - 1);
    expect(element.right).toBeLessThanOrEqual(geometry.copy.right + 1);
    expect(element.bottom).toBeLessThanOrEqual(geometry.hero.bottom + 1);
  }
  expect(geometry.title.bottom).toBeLessThanOrEqual(geometry.description.top + 1);
  expect(geometry.description.bottom).toBeLessThanOrEqual(geometry.actions.top + 1);
  if (config.layout === 'panel') {
    expect(geometry.coffee.left).toBeGreaterThanOrEqual(geometry.hero.right - 1);
    expect(Math.abs(geometry.coffee.top - geometry.hero.top)).toBeLessThanOrEqual(1);
    expect(geometry.water.top).toBeGreaterThanOrEqual(geometry.coffee.bottom - 1);
    expect(Math.abs(geometry.water.bottom - geometry.hero.bottom)).toBeLessThanOrEqual(1);
  } else {
    expect(geometry.coffee.top).toBeGreaterThanOrEqual(geometry.hero.bottom - 1);
    if (config.layout === 'columns') {
      expect(Math.abs(geometry.coffee.top - geometry.water.top)).toBeLessThanOrEqual(1);
      expect(geometry.water.left).toBeGreaterThanOrEqual(geometry.coffee.right - 1);
    } else {
      expect(geometry.water.top).toBeGreaterThanOrEqual(geometry.coffee.bottom - 1);
      expect(Math.abs(geometry.water.width - geometry.coffee.width)).toBeLessThanOrEqual(1);
    }
  }
  await page.locator('.opening-actions a').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.opening-service-coffee a')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.opening-service-water a')).toBeFocused();
});

test('the panoramic scene follows native forward and reverse scroll, then keeps a stable readable tail', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await settleEntrance(page);
  const visual = () => page.locator('.home-opening').evaluate(root => {
    const mask = getComputedStyle(root.querySelector('.opening-atmosphere')!).clipPath;
    const sides = mask.replace(/^inset\(|\)$/g, '').split(/\s+/).map(parseFloat);
    const product = (name: string) => new DOMMatrix(getComputedStyle(root.querySelector(`.opening-service-${name} .opening-product-scroll`)!).transform).f;
    return { right: sides[1] ?? sides[0], coffeeY: product('coffee'), waterY: product('water'),
      opacity: ['coffee','water'].map(name => Number(getComputedStyle(root.querySelector(`.opening-service-${name}`)!).opacity)),
      positions: Array.from(root.querySelectorAll('.opening-service-copy,.opening-equipment')).map(element => {
        const rect=element.getBoundingClientRect(); return [rect.x,rect.y,rect.width,rect.height];
      }) };
  });
  const samples: Awaited<ReturnType<typeof visual>>[] = [];
  for (const progress of [0,.35,.65,.8,1]) {
    await seekHomeScene(page,progress);
    samples.push(await visual());
  }
  expect(samples[0].right).toBeCloseTo(0,1);
  expect(samples.at(-1)!.right).toBeCloseTo(45,1);
  expect(Math.max(samples[0].coffeeY,samples[0].waterY)).toBeGreaterThanOrEqual(30);
  expect(samples[1].opacity[0]).toBeGreaterThan(samples[1].opacity[1]);
  samples.forEach((sample,index) => { if(index) expect(sample.right).toBeGreaterThanOrEqual(samples[index-1].right-.1); });
  for (const productY of [samples.at(-1)!.coffeeY,samples.at(-1)!.waterY]) expect(Math.abs(productY)).toBeLessThan(1);
  samples[3].positions.forEach((position,index) => position.forEach((value,coordinate) => expect(Math.abs(value-samples[4].positions[index][coordinate])).toBeLessThanOrEqual(1)));
  await seekHomeScene(page,.35);
  expect((await visual()).right).toBeCloseTo(samples[1].right,1);
  await seekHomeScene(page,0);
  const {end}=await homeSceneMetrics(page);
  await page.evaluate(top => scrollTo({top,behavior:'instant'}),end+1200);
  await expect.poll(async () => (await homeSceneMetrics(page)).progress).toBe(1);
  for(const article of await page.locator('.opening-service').all()) await expect(article).toHaveCSS('opacity','1');
  await seekHomeScene(page,0);
  await expect(page.locator('.opening-copy')).toHaveCSS('opacity','1');
  await expectCompleteOpening(page);
  expect(errors).toEqual([]);
});

test('resizing removes and recreates the eligible sticky scene without generated wrappers while both service links remain keyboard reachable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  for (const viewport of [{ width: 1280, height: 800 }, { width: 360, height: 800 }, { width: 1024, height: 900 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    await revealHomeOffers(page);
    await expectCompleteOpening(page);
    const link = page.locator('.opening-service-water a');
    await page.locator('.opening-service-coffee a').focus();
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
    await expect(link).toBeInViewport();
  }
});

test('the hero offer and populated cart retain their business data and restore page scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => localStorage.setItem('makeon-coffee-cart-v1', JSON.stringify([{ slug: 'intense', quantity: 1, grind: 'Boabe' }])));
  await page.goto('/');
  await page.getByRole('button', { name: 'Cere ofertă pentru birou', exact: true }).click();
  await expect(page.locator('.contact-dialog')).toBeVisible();
  await expect(page.locator('.contact-dialog #interest')).toContainText('Cafea + apă');
  await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
  await page.keyboard.press('Escape');
  await expect(page.locator('.contact-dialog')).not.toBeVisible();
  await page.evaluate(() => scrollTo({ top: 300, behavior: 'instant' }));
  const position = await page.evaluate(() => scrollY);
  await clickVisible(page, page.locator('.header-actions .cart-button'));
  const cart = page.getByRole('dialog', { name: 'Coșul de cafea' });
  await expect(cart).toBeVisible();
  await expect(cart.locator('.cart-line')).toHaveCount(1);
  await expect(cart).toContainText('Intense');
  await page.keyboard.press('Escape');
  await expect(cart).not.toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(position);
});

test('Back and Forward preserve normal scroll position and do not replay the home entrance', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await settleEntrance(page);
  await seekHomeScene(page,.86);
  const position = await page.evaluate(() => scrollY);
  await clickVisible(page,page.locator('.opening-service-coffee a'));
  await expect(page).toHaveURL(/\/cafea-pentru-birouri$/);
  await expect(page.locator('h1.b2b-title')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, 0);
  await expectCompleteOpening(page);
  await expectHomeSceneMode(page);
  expect(await page.locator('.opening-photo-enter').evaluate(element => new DOMMatrix(getComputedStyle(element).transform).a)).toBe(1);
  await page.goForward();
  await expect(page).toHaveURL(/\/cafea-pentru-birouri$/);
  await page.goBack();
  await expectCompleteOpening(page);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, 0);
});

test('server markup exposes the full hero and both offers without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ baseURL: test.info().project.use.baseURL, javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  try {
    const page = await context.newPage();
    await page.goto('/');
    await expectCompleteOpening(page);
    await expect(page.locator('.home-opening .pin-spacer')).toHaveCount(0);
    for (const article of await page.locator('.opening-service').all()) await expect(article).toHaveCSS('opacity', '1');
  } finally { await context.close(); }
});

for(const viewport of [{width:1024,height:900},{width:1440,height:1000}]) test(`the existing solutions URL exposes both offers in its ${viewport.width}px layout`, async ({ page }) => {
  await page.setViewportSize(viewport);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/#solutii');
  if(await expectHomeSceneMode(page)) {
    await expect.poll(async()=>(await homeSceneMetrics(page)).progress).toBe(1);
    await expect.poll(async()=>Math.abs(await page.evaluate(()=>scrollY)-(await homeSceneMetrics(page)).end)).toBeLessThanOrEqual(1);
  } else {
    const offset = await page.locator('#solutii').evaluate(element =>
      (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0)
      + (parseFloat(getComputedStyle(element).scrollMarginTop) || 0));
    await expect.poll(() => page.locator('#solutii').evaluate(element => element.getBoundingClientRect().top)).toBeCloseTo(offset, 0);
  }
  await expectCompleteOpening(page);
  for (const link of await page.locator('.opening-service-link').all()) await expect(link).toBeInViewport();
});

test('keyboard focus reveals the complete offer scene from the panoramic start',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/');
  await settleEntrance(page);
  await seekHomeScene(page,0);
  await page.locator('.opening-actions a').evaluate(element=>(element as HTMLElement).focus({preventScroll:true}));
  await page.keyboard.press('Tab');
  await expect(page.locator('.opening-service-coffee a')).toBeFocused();
  await expect.poll(async()=>(await homeSceneMetrics(page)).progress).toBe(1);
  for(const link of await page.locator('.opening-service-link').all()) await expect(link).toBeInViewport();
});

test('an initial pointer gesture near the office CTA edge survives entrance initialization',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const button=page.getByRole('button',{name:'Cere ofertă pentru birou',exact:true});
  const box=await button.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x+box!.width/2,box!.y+2);
  await page.mouse.down();
  await page.evaluate(()=>new Promise<void>(resolve=>setTimeout(resolve,120)));
  await page.mouse.up();
  await expect(page.locator('.contact-dialog')).toBeVisible();
  await expect(page.locator('.contact-dialog #interest')).toContainText('Cafea + apă');
  await page.keyboard.press('Escape');
  await expect(page.locator('.contact-dialog')).not.toBeVisible();
});
