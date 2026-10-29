import { test, expect, type Page } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({ json: {
    products: coffeeProducts, managed: false, checkout: false, shippingBani: 0,
  } }));
});

async function settledDialog(page: Page) {
  const dialog = page.locator('.contact-offer-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('data-offer-state', 'open');
  return dialog;
}

for (const context of [
  { route: '/', action: 'Solicită ofertă pentru birou', title: 'Solicită ofertă.', selection: 'Cafea + apă' },
  { route: '/cafea-pentru-birouri', action: 'Solicită ofertă pentru cafea', title: 'Cafea pentru biroul tău.', selection: 'Abonament de cafea' },
  { route: '/apa', action: 'Solicită abonamentul Vero Aqua', title: 'Apă pentru biroul tău.', selection: 'Abonament Vero Aqua' },
  { route: '/cafea-la-evenimente', action: 'Solicită ofertă pentru rulotă', title: 'Cafea la evenimentul tău.', selection: 'Eveniment — rulotă' },
]) {
  test(`offer dialog uses the selected context from ${context.route}`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(context.route);
    await page.getByRole('button', { name: context.action, exact: true }).first().click();
    const dialog = await settledDialog(page);
    await expect(dialog.getByRole('heading', { level: 2, name: context.title, exact: true })).toBeVisible();
    await expect(dialog.locator('#interest')).toContainText(context.selection);
    await expect(dialog.getByRole('link', { name: /0744|\+40 744/ })).toHaveAttribute('href', 'tel:+40744524728');
    await expect(dialog.getByRole('link', { name: 'info@makeon.ro' })).toHaveAttribute('href', 'mailto:info@makeon.ro');
    await expect(dialog.getByRole('link', { name: 'Preferi WhatsApp?' })).toHaveCount(1);
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });
}

test('desktop offer has one full-height introduction and uniformly sized controls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/apa');
  await page.getByRole('button', { name: 'Solicită abonamentul Vero Aqua', exact: true }).click();
  const dialog = await settledDialog(page);
  const geometry = await dialog.locator('.dialog-content').evaluate(paper => {
    const frame = paper.getBoundingClientRect();
    const intro = paper.querySelector<HTMLElement>('.dialog-intro')!;
    const bounds = intro.getBoundingClientRect();
    const padding = getComputedStyle(intro);
    const close = paper.querySelector('.dialog-close')!.getBoundingClientRect();
    const controls = Array.from(paper.querySelectorAll<HTMLElement>('.contact-field input,.custom-select-trigger'));
    return {
      width: frame.width, heightDifference: Math.abs(frame.height - bounds.height),
      topDifference: Math.abs(frame.top - bounds.top), share: bounds.width / frame.width,
      padding: parseFloat(padding.paddingLeft), closeWidth: close.width, closeHeight: close.height,
      controlHeights: controls.map(control => control.getBoundingClientRect().height),
      overflow: paper.scrollWidth > paper.clientWidth + 1,
    };
  });
  expect(geometry.width).toBeGreaterThanOrEqual(980);
  expect(geometry.width).toBeLessThanOrEqual(1040);
  expect(geometry.heightDifference).toBeLessThan(1);
  expect(geometry.topDifference).toBeLessThan(1);
  expect(geometry.share).toBeGreaterThan(.3);
  expect(geometry.share).toBeLessThan(.36);
  expect(geometry.padding).toBeGreaterThanOrEqual(32);
  expect(geometry.padding).toBeLessThanOrEqual(40);
  expect(geometry.closeWidth).toBeGreaterThanOrEqual(44);
  expect(geometry.closeHeight).toBeGreaterThanOrEqual(44);
  expect(geometry.controlHeights).toHaveLength(6);
  for (const height of geometry.controlHeights) {
    expect(height).toBeGreaterThanOrEqual(48);
    expect(height).toBeLessThanOrEqual(52);
  }
  expect(geometry.overflow).toBe(false);
});

test('short option labels retain canonical payload, WhatsApp context and idempotent retry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: Record<string, string>[] = [];
  await page.route('**/api/contact', async route => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status: requests.length === 1 ? 502 : 200,
      json: requests.length === 1 ? { error: 'Trimiterea a eșuat. Încearcă din nou.' } : { ok: true } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Solicită ofertă pentru birou', exact: true }).first().click();
  const dialog = await settledDialog(page);
  await dialog.locator('#contact-name').fill('A');
  await dialog.locator('#contact-email').fill('invalid');
  await dialog.getByRole('button', { name: 'Trimite solicitarea', exact: true }).click();
  expect(requests).toHaveLength(0);
  await expect(dialog.locator('#contact-name')).toBeFocused();
  await dialog.locator('#contact-name').fill('Client Test');
  await dialog.locator('#contact-email').fill('client@example.test');
  await dialog.locator('#contact-company').fill('Companie Test');
  await dialog.locator('#contact-message').fill('Oferta pentru biroul nostru.');

  await dialog.locator('#interest').click();
  await expect(dialog.getByRole('listbox')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog.getByRole('listbox')).toHaveCount(0);
  await expect(dialog).toBeVisible();
  await dialog.locator('#interest').click();
  await page.keyboard.press('Home');
  for (let step = 0; step < 3; step++) await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog.locator('#interest')).toHaveText('Abonament Vero Aqua');
  await expect(dialog.getByRole('heading', { name: 'Apă pentru biroul tău.', exact: true })).toBeVisible();
  await dialog.locator('#team').click();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(dialog.locator('#team')).toHaveText('31–75 persoane');
  const whatsapp = await dialog.getByRole('link', { name: 'Preferi WhatsApp?' }).getAttribute('href');
  expect(decodeURIComponent(whatsapp!)).toContain('Abonament Vero Aqua — 31 € + TVA/lună');
  expect(decodeURIComponent(whatsapp!)).toContain('31–75 persoane');

  await dialog.getByRole('button', { name: 'Trimite solicitarea', exact: true }).click();
  await expect(dialog.getByRole('alert')).toContainText('Trimiterea a eșuat');
  await expect(dialog.locator('#contact-company')).toHaveValue('Companie Test');
  await expect(dialog.locator('#contact-message')).toHaveValue('Oferta pentru biroul nostru.');
  await expect(dialog.locator('#interest')).toHaveText('Abonament Vero Aqua');
  await dialog.getByRole('button', { name: 'Trimite solicitarea', exact: true }).click();
  await expect(dialog.getByRole('status')).toContainText('Solicitarea a fost trimisă.');
  expect(requests).toHaveLength(2);
  expect(requests[0].interest).toBe('Abonament Vero Aqua — 31 € + TVA/lună');
  expect(requests[0].team).toBe('31–75 persoane');
  expect(requests[0].requestId).toBe(requests[1].requestId);
});

test('exit retains the form until native close and restores focus and page position', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.locator('#despre').scrollIntoViewIfNeeded();
  const position = await page.evaluate(() => scrollY);
  const opener = page.locator('.header-actions .offer-button');
  const box = await opener.boundingBox();
  await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
  const dialog = await settledDialog(page);
  await dialog.locator('#contact-name').fill('Date păstrate la ieșire');
  for (let step = 0; step < 12; step++) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate(node => node.contains(document.activeElement))).toBe(true);
  }
  const close = dialog.getByRole('button', { name:'Închide formularul', exact:true });
  const submit = dialog.getByRole('button', { name:'Trimite solicitarea', exact:true });
  await close.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(submit).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await dialog.evaluate(node => {
    const observer = new MutationObserver(() => {
      if ((node as HTMLElement).dataset.offerState !== 'closing') return;
      (node as HTMLElement).dataset.closingSnapshot = JSON.stringify({
        open: (node as HTMLDialogElement).open,
        value: node.querySelector<HTMLInputElement>('#contact-name')?.value,
        locked: document.body.style.overflow === 'hidden',
      });
      observer.disconnect();
    });
    observer.observe(node, { attributes: true, attributeFilter: ['data-offer-state'] });
  });
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  const closing = JSON.parse((await dialog.getAttribute('data-closing-snapshot'))!);
  expect(closing).toEqual({ open: true, value: 'Date păstrate la ieșire', locked: true });
  await expect(dialog.locator('#contact-name')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(opener).toBeFocused();
  expect(Math.abs(await page.evaluate(() => scrollY) - position)).toBeLessThanOrEqual(1);

  await opener.click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape'); // Interrupt the new entrance.
  await expect(dialog).not.toBeVisible();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await expect(opener).toBeFocused();
});

for (const viewport of [{ width: 320, height: 640 }, { width: 390, height: 844 }, { width: 844, height: 390 }]) {
  test(`offer form and close stay reachable at ${viewport.width}x${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/apa');
    await page.getByRole('button', { name: 'Solicită abonamentul Vero Aqua', exact: true }).click();
    const dialog = await settledDialog(page);
    expect(await dialog.evaluate(node => node.scrollWidth > node.clientWidth)).toBe(false);
    if (viewport.width <= 620) {
      const contacts = await dialog.locator('.dialog-contact-links').evaluate(node => {
        const phone = node.querySelector('.dialog-phone')!.getBoundingClientRect();
        const email = node.querySelector('.dialog-email')!.getBoundingClientRect();
        return { difference: Math.abs(phone.top - email.top),
          intro: node.closest('.dialog-intro')!.getBoundingClientRect().height };
      });
      expect(contacts.difference).toBeLessThan(2);
      expect(contacts.intro).toBeLessThan(330);
    }
    await dialog.evaluate(node => { node.scrollTop = node.scrollHeight; });
    const close = dialog.getByRole('button', { name: 'Închide formularul', exact: true });
    const closeBounds = await close.boundingBox();
    expect(closeBounds!.y).toBeGreaterThanOrEqual(0);
    expect(closeBounds!.y + closeBounds!.height).toBeLessThanOrEqual(viewport.height);
    await expect(dialog.getByRole('button', { name: 'Trimite solicitarea', exact: true })).toBeVisible();
    await close.click();
    await expect(dialog).not.toBeVisible();
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  });
}
