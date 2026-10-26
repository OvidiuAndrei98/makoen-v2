import { test, expect, type Page } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ json:{ products:coffeeProducts, managed:false, checkout:false, shippingBani:0 } }));
});

for (const width of [320,390,768,1024,1279,1280,1440]) {
  test(`header controls fit and stay aligned at ${width}px`, async ({ page }) => {
    await page.setViewportSize({width,height:900});
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const header = page.locator('.site-header-modern');
    const mobile = width < 1280;
    const nav = header.locator('.desktop-nav');
    const menu = header.locator('.header-actions .menu-button');
    await expect(mobile ? menu : nav).toBeVisible();
    await expect(mobile ? nav : menu).toBeHidden();
    const geometry = await header.evaluate(el => {
      const box = (selector:string) => el.querySelector(selector)!.getBoundingClientRect();
      const header = el.getBoundingClientRect();
      const logo = box(':scope > .brand-mark');
      const cart = box('.header-actions .cart-button');
      const menu = box('.header-actions .menu-button');
      const mark = box('.header-actions .menu-mark');
      return {height:header.height, logoCenter:logo.y+logo.height/2,cartCenter:cart.y+cart.height/2,
        menuCenter:menu.y+menu.height/2, menuWidth:menu.width,menuHeight:menu.height,
        markDeltaX:mark.x+mark.width/2-menu.x-menu.width/2,
        markDeltaY:mark.y+mark.height/2-menu.y-menu.height/2,
        collision:cart.left < logo.right, overflow:document.documentElement.scrollWidth>innerWidth};
    });
    expect(geometry.overflow).toBe(false);
    expect(geometry.collision).toBe(false);
    expect(Math.abs(geometry.logoCenter-geometry.cartCenter)).toBeLessThan(1);
    if(mobile) {
      expect(geometry.height).toBe(76);
      expect(geometry.menuWidth).toBe(46);
      expect(geometry.menuHeight).toBe(46);
      expect(Math.abs(geometry.menuCenter-geometry.cartCenter)).toBeLessThan(1);
      expect(Math.abs(geometry.markDeltaX)).toBeLessThan(1);
      expect(Math.abs(geometry.markDeltaY)).toBeLessThan(1);
    }
  });
}

async function openMenu(page:Page) {
  const trigger = page.locator('.header-actions .menu-button');
  await trigger.click();
  const dialog = page.locator('.modern-mobile-menu');
  await expect(dialog).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-expanded','true');
  return dialog;
}

test('menu survives interrupted toggles, resize, Escape and focus restoration without a hidden overlay', async ({page}) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const dialog=await openMenu(page);
  const close=dialog.locator('.mobile-menu-close');
  const row = await page.evaluate(() => {
    const box = (selector:string) => document.querySelector(selector)!.getBoundingClientRect();
    const header = box('.header-actions .menu-button');
    const menu = box('.mobile-menu-close');
    return { x:Math.abs(header.x-menu.x),y:Math.abs(header.y-menu.y) };
  });
  expect(row.x).toBeLessThan(1);
  expect(row.y).toBeLessThan(1);
  await close.click();
  await expect(page.locator('.header-actions .menu-button')).toHaveAttribute('aria-expanded','false');
  await expect(dialog).toBeHidden();
  await openMenu(page);
  await page.setViewportSize({width:1440,height:1000});
  await expect(dialog).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
  await expect(page.locator('.desktop-nav')).toBeVisible();
  await page.locator('.desktop-nav a[href="/apa"]').click();
  await expect(page).toHaveURL(/\/apa$/);
  await page.setViewportSize({width:390,height:844});
  const trigger=page.locator('.header-actions .menu-button');
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await expect.poll(() => dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Tab');
  await expect.poll(() => dialog.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded','false');
});

test('pointer feedback avoids the autofocus frame while keyboard focus and editorial selection stay available',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const trigger=page.locator('.header-actions .menu-button');
  await expect(trigger).toHaveCSS('user-select','none');
  await expect(page.locator('.opening-description')).not.toHaveCSS('user-select','none');
  const dialog=await openMenu(page);
  const close=dialog.locator('.mobile-menu-close');
  await expect(close).toHaveCSS('outline-style','none');
  await page.keyboard.press('Tab');
  const focus = dialog.locator(':focus');
  await expect(focus).toHaveCSS('outline-style','solid');
  await page.keyboard.press('Escape');
  await trigger.focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveCSS('outline-style','solid');
});
