import { test, expect } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
  await page.route('**/api/contact', route => route.abort());
});

for (const width of [320, 1440]) {
  test(`home coffee and water summaries open their own offer context at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height:900 });
    await page.goto('/');
    const summary = page.locator('#despre');
    await expect(summary.locator('.home-solution')).toHaveCount(2);
    await expect(summary.locator('button[aria-expanded]')).toHaveCount(0);
    await expect(summary).toContainText('Patru stadii de filtrare');
    await expect(summary).toContainText('1.116 € + TVA / aparat');
    for (const [name, selected, canonical] of [
      ['Solicită ofertă pentru cafea', 'Abonament de cafea', 'Abonament de cafea'],
      ['Solicită abonamentul de apă', 'Abonament Vero Aqua', 'Abonament Vero Aqua — 31 € + TVA/lună'],
    ]) {
      const action = summary.getByRole('button', { name, exact:true });
      await action.click();
      const dialog = page.locator('.contact-dialog');
      await expect(dialog.locator('#interest')).toHaveText(selected);
      expect(decodeURIComponent((await dialog.getByRole('link', { name:'Preferi WhatsApp?' }).getAttribute('href'))!)).toContain(canonical);
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(action).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

for (const width of [390, 1440]) {
  test(`coffee services stay visible and contextual enquiries preserve their selections at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/cafea-pentru-birouri#servicii');
    const services = page.locator('#servicii');
    for (const name of ['Prăjire în loturi mici', 'Blenduri personalizate', 'Espresso sau filtru', 'Cafea de probă']) {
      await expect(services.getByRole('heading', { name, exact: true })).toBeVisible();
    }
    await expect(page.locator('main button[aria-expanded]')).toHaveCount(4); // FAQ only.
    await expect(page.locator('.b2b-anchor-nav')).toHaveCount(0);
    for (const [label, interest, selected] of [
      ['Solicită cafea de probă', 'Cafea de probă', 'Cafea de probă'],
      ['Discută un blend personalizat', 'Prăjire și blenduri personalizate', 'Prăjire și blenduri'],
      ['Solicită detalii despre filtre', 'Filtre pentru apă și cafea', 'Filtre pentru apă și cafea'],
      ['Solicită ofertă pentru birou', 'Abonament de cafea', 'Abonament de cafea'],
    ]) {
      const action = page.getByRole('button', { name: label, exact: true });
      await action.focus();
      await page.keyboard.press('Enter');
      const dialog = page.locator('.contact-dialog');
      await expect(dialog).toBeVisible();
      await expect(dialog.locator('#interest')).toHaveText(selected);
      const whatsapp = await dialog.getByRole('link', { name: 'Preferi WhatsApp?' }).getAttribute('href');
      expect(decodeURIComponent(whatsapp!)).toContain(interest);
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
      await expect(action).toBeFocused();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  });
}

for (const motion of ['reduce', 'no-preference'] as const) {
  test(`water filtration is visible and existing-system enquiries remain selectable with ${motion} motion`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({ reducedMotion: motion });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/apa#filtre');
    const filters = page.locator('#filtre');
    await expect(filters.locator('.b2b-filter-media img')).toBeVisible();
    await expect(filters.locator('.office-filter-labels li')).toHaveText(['Sediment', 'Cărbune activ', 'Carbon block', 'Membrană UF']);
    await expect(filters.getByRole('button', { expanded: false })).toHaveCount(0);
    for (const name of ['Instalare', 'Mentenanță', 'Schimb de filtre']) {
      await expect(page.locator('#servicii').getByRole('heading', { name, exact: true })).toBeVisible();
    }
    await page.getByRole('button', { name: 'Solicită ofertă pentru apă', exact: true }).click();
    const dialog = page.locator('.contact-dialog');
    await expect(dialog.locator('#interest')).toHaveText('Consultanță pentru apă');
    for (const [label, canonical] of [
      ['Instalare filtrare', 'Instalare sistem de filtrare'],
      ['Mentenanță și filtre', 'Schimb filtre și mentenanță'],
      ['Filtre pentru apă și cafea', 'Filtre pentru apă și cafea'],
    ]) {
      await dialog.locator('#interest').click();
      await dialog.getByRole('option', { name: label, exact: true }).click();
      await expect(dialog.locator('#interest')).toHaveText(label);
      const whatsapp = await dialog.getByRole('link', { name: 'Preferi WhatsApp?' }).getAttribute('href');
      expect(decodeURIComponent(whatsapp!)).toContain(canonical);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(errors).toEqual([]);
  });
}
