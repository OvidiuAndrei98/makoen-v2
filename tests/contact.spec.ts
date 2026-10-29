import { test, expect } from "@playwright/test";

test.beforeEach(async ({page})=>{
  await page.route('**/api/catalog',route=>route.fulfill({json:{products:[],managed:false,checkout:false,cod:false,shippingBani:null}}));
});

for (const width of [320, 390, 430])
  test(`contact form fits ${width}px and retains inputs after failure`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    let attempts = 0;
    const ids: string[] = [];
    await page.route("**/api/contact", async (route) => {
      const body = route.request().postDataJSON();
      ids.push(body.requestId);
      expect(body.email).toBe("client@example.com");
      attempts++;
      await route.fulfill({
        status: attempts === 1 ? 502 : 200,
        contentType: "application/json",
        body: JSON.stringify(
          attempts === 1
            ? { error: "Trimiterea a eșuat. Încearcă din nou." }
            : { ok: true },
        ),
      });
    });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Solicită ofertă pentru birou", exact: true }).first()
      .click();
    const dialog = page.getByRole("dialog");
    await dialog.locator("#contact-name").fill("Client Test");
    await dialog.locator("#contact-email").fill("client@example.com");
    await dialog
      .locator("#contact-message")
      .fill("O ofertă pentru echipa noastră.");
    await dialog
      .getByRole("button", { name: "Trimite solicitarea", exact: true })
      .click();
    await expect(dialog.getByRole("alert")).toContainText("Trimiterea a eșuat");
    await expect(dialog.locator("#contact-email")).toHaveValue(
      "client@example.com",
    );
    expect(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await dialog
      .getByRole("button", { name: "Trimite solicitarea", exact: true })
      .click();
    await expect(dialog.getByRole("status")).toContainText(
      "Solicitarea a fost trimisă",
    );
    expect(ids[0]).toBe(ids[1]);
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

test('inline business enquiry and offer dialog keep distinct fields and submit the selected company details',async({page})=>{
  let submitted:Record<string,unknown>|undefined;
  await page.route('**/api/contact',async route=>{submitted=route.request().postDataJSON();await route.fulfill({json:{ok:true}})});
  await page.goto('/');
  const form=page.locator('.home-contact-form form');
  await form.getByLabel('Nume',{exact:false}).fill('Client Test');
  await form.getByLabel('Companie',{exact:false}).fill('Firma Test');
  await form.getByLabel('E-mail',{exact:false}).fill('client@example.test');
  await form.getByLabel('Telefon',{exact:false}).fill('0712345678');
  await page.getByRole('button',{name:'Solicită ofertă pentru birou',exact:true}).click();
  const dialog=page.locator('.contact-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('#contact-name')).toHaveValue('');
  const duplicates=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return ids.filter((id,i)=>ids.indexOf(id)!==i)});
  expect(duplicates).toEqual([]);
  await page.keyboard.press('Escape');
  await form.getByRole('button',{name:'Trimite solicitarea'}).click();
  await expect(page.locator('.home-contact-form')).toContainText('Solicitarea a fost trimisă.');
  expect(submitted).toMatchObject({company:'Firma Test',phone:'0712345678',interest:'Cafea + apă',team:'11–30 persoane'});
});
