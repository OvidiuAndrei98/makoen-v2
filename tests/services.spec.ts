import { test, expect } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
});

test('coffee services remain keyboard accessible and keep their enquiry and WhatsApp selections', async ({ page }) => {
  await page.goto('/cafea-pentru-birouri#servicii');
  const services = page.locator('#servicii');
  await expect(services.locator('.makeon-disclosure-trigger')).toHaveCount(4);
  await expect(services.locator('.makeon-disclosure-trigger[aria-expanded="true"]')).toHaveCount(0);
  const action=services.locator('.office-service-action button');
  await expect(action).toHaveCount(1);
  await expect(services.locator('.makeon-disclosure-panel button')).toHaveCount(0);
  await expect(page.locator('.b2b-faq-layout button[aria-expanded="true"]')).toHaveCount(0);
  await action.click();
  const initialDialog=page.locator('.contact-dialog');
  await expect(initialDialog.locator('#interest')).toHaveText('Cafea și espressoare');
  const initialWhatsApp=await initialDialog.getByRole('link',{name:'Preferi WhatsApp?'}).getAttribute('href');
  expect(decodeURIComponent(initialWhatsApp!)).toContain('Cafea și espressoare');
  await page.keyboard.press('Escape');
  await expect(initialDialog).not.toBeVisible();
  for (const [title, interest, label] of [
    ['Prăjire în loturi mici', 'Prăjire și blenduri personalizate', 'Prăjire și blenduri'],
    ['Blenduri personalizate', 'Prăjire și blenduri personalizate', 'Prăjire și blenduri'],
    ['Cafea pentru espresso și filtru', 'Cafea pentru espresso sau filtru', 'Cafea espresso / filtru'],
    ['Cafea de probă', 'Cafea de probă', 'Cafea de probă'],
  ]) {
    const trigger=services.getByRole('button',{name:title,exact:true});
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(trigger).toHaveAttribute('aria-expanded','true');
    await expect(services.locator('.makeon-disclosure-trigger[aria-expanded="true"]')).toHaveCount(1);
    await action.click();
    const dialog = page.locator('.contact-dialog');
    await expect(dialog.locator('#interest')).toHaveText(label);
    const whatsapp = await dialog.getByRole('link', { name: 'Preferi WhatsApp?' }).getAttribute('href');
    expect(whatsapp).toContain('https://wa.me/40744524728?text=');
    expect(decodeURIComponent(whatsapp!)).toContain(interest);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  }
});

for (const motion of ['reduce', 'no-preference'] as const) {
  test(`water services and filter compatibility remain usable with ${motion} motion`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: motion });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/apa#filtre');
    const filters=page.locator('#filtre');
    const filterTrigger=filters.getByRole('button',{name:'Filtre și compatibilitate',exact:true});
    await expect(filterTrigger).toHaveAttribute('aria-expanded','false');
    await expect(page.locator('#servicii .makeon-disclosure-trigger[aria-expanded="true"]')).toHaveCount(0);
    await expect(page.locator('.b2b-faq-layout button[aria-expanded="true"]')).toHaveCount(0);
    await filterTrigger.focus();
    await page.keyboard.press('Enter');
    await expect(filters.locator('.b2b-filter-stages')).toBeVisible();
    await expect(page.locator('.b2b-filter-stages li')).toHaveCount(4);
    await page.locator('.b2b-filter-media').scrollIntoViewIfNeeded();
    await expect(page.locator('.b2b-filter-media img')).toBeVisible();
    const maintenance=page.locator('#servicii').getByRole('button',{name:'Mentenanță și schimb de filtre',exact:true});
    await maintenance.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#servicii')).toContainText('Intervalele și costurile se stabilesc');
    await page.locator('#servicii .office-service-action button').click();
    await expect(page.locator('.contact-dialog #interest')).toHaveText('Mentenanță și filtre');
    const whatsapp=await page.locator('.contact-dialog').getByRole('link',{name:'Preferi WhatsApp?'}).getAttribute('href');
    expect(decodeURIComponent(whatsapp!)).toContain('Schimb filtre și mentenanță');
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: 'Filtre pentru espressor', exact: true }).click();
    await expect(page).toHaveURL(/\/cafea-pentru-birouri#filtre$/);
    await page.getByRole('button', { name: 'Cere detalii despre filtre', exact: true }).click();
    await expect(page.locator('.contact-dialog #interest')).toContainText('Filtre pentru apă și cafea');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}
