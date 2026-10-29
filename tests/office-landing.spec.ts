import { test, expect } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
});

for (const width of [320,390,430,768,1280,1920]) {
  test(`the company offer and both office services remain accessible at ${width}px`,async ({page})=>{
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    const hero=page.locator('.opening-atmosphere');
    await expect(hero.locator('h1')).toHaveText(/Cafea și apă\s*pentru biroul tău\./);
    await expect(hero.locator('.opening-description')).toHaveText('Espressoare SwitchMORN și dozatoare Vero Aqua pentru companii.');
    await expect(hero.getByRole('img', { name: /Espressor SwitchMORN și dozator Vero Aqua/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Vezi soluția de cafea', exact: true })).toHaveAttribute('href','/cafea-pentru-birouri');
    await expect(page.getByRole('link', { name: 'Vezi aparatul și abonamentul', exact: true })).toHaveAttribute('href','/apa');
    await expect(page.locator('.world-switch, .business-switch, .element-scene')).toHaveCount(0);
    if(width>=1280){
      const copy=await hero.locator('.opening-copy').boundingBox();
      const frame=await hero.boundingBox();
      expect(copy!.x).toBeGreaterThanOrEqual(frame!.x);
      expect(copy!.y+copy!.height).toBeLessThanOrEqual(frame!.y+frame!.height);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await hero.getByRole('button',{name:'Solicită ofertă pentru birou',exact:true}).click();
    await expect(page.locator('.contact-dialog #interest')).toContainText('Cafea + apă');
    await page.keyboard.press('Escape');
  });
}

for (const width of [390, 1280]) {
  test(`cart selections survive both service pages and refresh at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/cafea/intense');
    await expect(page.locator('.related-coffees .shop-product-card').first()).toBeVisible();
    await page.getByRole('button', { name: 'Adaugă în coș', exact: true }).click();
    await expect(page.locator('.header-actions .cart-button')).toHaveAccessibleName('Deschide coșul de cafea (1)');
    await page.locator('.header').getByRole('link', { name: 'Makeon, acasă' }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.getByRole('link', { name: 'Vezi aparatul și abonamentul', exact: true }).click();
    await expect(page).toHaveURL(/\/apa$/);
    await expect(page.locator('.b2b-water')).toBeVisible();
    await page.locator('.header').getByRole('link', { name: 'Makeon, acasă' }).click();
    await page.getByRole('link', { name: 'Vezi soluția de cafea', exact: true }).click();
    await expect(page).toHaveURL(/\/cafea-pentru-birouri$/);
    await page.reload();
    await page.getByRole('button', { name: 'Deschide coșul de cafea (1)' }).click();
    const cart = page.getByRole('dialog', { name: 'Coșul de cafea' });
    await expect(cart.locator('.cart-line')).toHaveCount(1);
    await expect(cart).toContainText('Intense');
    await page.keyboard.press('Escape');
  });

  test(`coffee equipment, conditions and offer stay distinct from the store at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/cafea-pentru-birouri');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Cafea de origine, proaspăt prăjită, direct la biroul tău.');
    await expect(page.locator('.coffee-intro .service-coffee-photo img')).toBeVisible();
    await expect(page.locator('#abonamente .coffee-plan-product-image img')).toBeVisible();
    await expect(page.locator('.element-scene, .world-switch')).toHaveCount(0);
    await expect(page.locator('#abonamente')).toContainText('Ofertă personalizată.');
    await expect(page.locator('#abonamente')).not.toContainText('31 €');
    await expect(page.getByRole('button', { name: 'Solicită ofertă pentru cafea', exact: true })).toHaveCount(1);
    await page.locator('.office-service-hero').getByRole('button', { name: 'Solicită ofertă pentru cafea', exact: true }).click();
    await expect(page.locator('.contact-dialog #interest')).toContainText('Abonament de cafea');
    await page.keyboard.press('Escape');
    const catalog=page.locator('#magazin');
    await expect(catalog.locator('#office-shop-products .shop-product-card')).toHaveCount(3);
    await expect(catalog.locator('#office-shop-products .shop-product-card').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

test('main services have direct keyboard-accessible links and indicate the current page',async({page})=>{
  await page.goto('/apa');
  const nav=page.locator('.desktop-nav');
  await expect(nav.getByRole('link')).toHaveCount(5);
  await expect(nav.getByRole('link',{name:'Pauza ta de hidratare',exact:true})).toHaveAttribute('aria-current','page');
  const coffee=nav.getByRole('link',{name:'Cafeaua ta',exact:true});
  await coffee.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/cafea-pentru-birouri$/);
  await expect(coffee).toHaveAttribute('aria-current','page');
  await expect(nav.getByRole('link',{name:'Evenimentul tău',exact:true})).toHaveAttribute('href','/cafea-la-evenimente');
});

test('header stays visible and skip link reaches the main content',async({page})=>{
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link',{name:'Sari la conținut'})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.locator('#despre').scrollIntoViewIfNeeded();
  const header=page.locator('.site > header');
  await expect(header).toHaveCSS('position','sticky');
  expect((await header.boundingBox())!.y).toBe(0);
});

for (const motion of ['reduce', 'no-preference'] as const) {
  test(`mobile menu hands over to the cart with focus and scroll lock intact with ${motion} motion`, async ({page}) => {
    await page.setViewportSize({width:390,height:844});
    await page.emulateMedia({reducedMotion:motion});
    await page.goto('/cafea/intense');
    await expect(page.locator('.related-coffees .shop-product-card').first()).toBeVisible();
    await page.getByRole('button',{name:'Adaugă în coș',exact:true}).click();
    await expect(page.locator('.header-actions .cart-button')).toHaveAccessibleName('Deschide coșul de cafea (1)');
    await page.getByRole('button',{name:'Deschide meniul',exact:true}).click();
    const menu=page.getByRole('dialog',{name:'Meniul Makeon'});
    await menu.getByRole('button',{name:'Deschide coșul de cafea (1)',exact:true}).click();
    const cart=page.getByRole('dialog',{name:'Coșul de cafea'});
    await expect(menu).not.toBeVisible();
    await expect(cart).toBeVisible();
    await expect(cart.locator('.cart-line')).toHaveCount(1);
    await expect(page.locator('body')).toHaveCSS('overflow','hidden');
    await page.keyboard.press('Escape');
    await expect(cart).not.toBeVisible();
    await expect(page.locator('body')).not.toHaveCSS('overflow','hidden');
    await expect(page.locator('.header-actions .cart-button')).toBeFocused();
  });
}

for(const viewport of [{width:390,height:844},{width:844,height:390}]) {
  test(`mobile menu restores focus and opens the offer without leaving scroll unlocked at ${viewport.width}px`,async({page})=>{
    await page.setViewportSize(viewport);
    await page.goto('/');
    const opener=page.getByRole('button',{name:'Deschide meniul',exact:true});
    await opener.click();
    const menu=page.getByRole('dialog',{name:'Meniul Makeon'});
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
    await expect(opener).toBeFocused();
    await opener.click();
    await menu.getByRole('button',{name:'Solicită ofertă',exact:true}).click();
    const offer=page.locator('.contact-dialog');
    await expect(offer).toBeVisible();
    await expect(menu).not.toBeVisible();
    await expect(page.locator('body')).toHaveCSS('overflow','hidden');
    await page.keyboard.press('Escape');
    await expect(offer).not.toBeVisible();
    await expect(page.locator('body')).not.toHaveCSS('overflow','hidden');
  });
}
