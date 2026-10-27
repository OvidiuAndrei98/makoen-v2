import { test, expect } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';

test.beforeEach(async ({ page }) => {
  await page.route('**/api/catalog', route => route.fulfill({json:{
    products:coffeeProducts,managed:false,checkout:false,shippingBani:0,
  }}));
  await page.route('**/api/contact', route => route.abort());
});

type HeroFrame={time:number;state:string;reduced:boolean;clip:string;lines:number[];product:number;media:number[]};

async function captureHeroFrames(page: import('@playwright/test').Page) {
  await page.addInitScript(() => {
    const storage=window as typeof window & {__serviceMotionFrames:HeroFrame[]};
    storage.__serviceMotionFrames=[];
    const record=()=>{
      const root=document.querySelector<HTMLElement>('[data-presentation]');
      const media=root?.querySelector<HTMLElement>('[data-presentation-media]');
      if(root&&media) {
        const rect=media.getBoundingClientRect();
        const product=root.querySelector<HTMLElement>('[data-presentation-product]');
        storage.__serviceMotionFrames.push({time:performance.now(),state:root.dataset.presentationState||'uninitialized',
          reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,
          clip:getComputedStyle(media).clipPath,
          lines:Array.from(root.querySelectorAll('[data-presentation-line]')).map(line=>new DOMMatrix(getComputedStyle(line).transform).f),
          product:product?new DOMMatrix(getComputedStyle(product).transform).f:0,
          media:[rect.x,rect.y,rect.width,rect.height],
        });
      }
      if(storage.__serviceMotionFrames.length<600) requestAnimationFrame(record);
    };
    requestAnimationFrame(record);
  });
}

for(const width of [390,1440]) for(const service of ['coffee','water'] as const) {
  test(`${service} hero has a measurable mask and line entrance, then a stable final crop at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:width===390?844:1000});
    await page.emulateMedia({reducedMotion:'no-preference'});
    await captureHeroFrames(page);
    await page.goto(service==='coffee'?'/cafea-pentru-birouri':'/apa');
    const hero=page.locator(`[data-presentation="${service}"]`);
    await expect(hero).toHaveAttribute('data-presentation-state','complete');
    await expect.poll(() => page.evaluate(() =>
      (window as typeof window & {__serviceMotionFrames:HeroFrame[]}).__serviceMotionFrames.filter(frame => frame.state === 'complete').length
    )).toBeGreaterThan(3);
    const frames=await page.evaluate(()=>(window as typeof window & {__serviceMotionFrames:HeroFrame[]}).__serviceMotionFrames);
    const running=frames.filter(frame=>frame.state==='running');
    const complete=frames.filter(frame=>frame.state==='complete');
    expect(frames.every(frame=>frame.reduced===false)).toBe(true);
    expect(running.length).toBeGreaterThan(2);
    expect(new Set(running.map(frame=>frame.clip)).size).toBeGreaterThan(2);
    expect(running.some(frame=>/inset\(/.test(frame.clip)&&frame.clip.match(/-?\d*\.?\d+/g)?.some(value=>Math.abs(Number(value))>1))).toBe(true);
    expect(Math.max(...running.flatMap(frame=>frame.lines.map(Math.abs)))).toBeGreaterThan(width===390?5:10);
    if(service==='water') expect(Math.max(...running.map(frame=>frame.product))).toBeGreaterThan(width===390?8:16);
    expect(complete.length).toBeGreaterThan(2);
    const final=complete.at(-1)!;
    for(const value of final.lines) expect(Math.abs(value)).toBeLessThan(.5);
    if(service==='water') expect(Math.abs(final.product)).toBeLessThan(.5);
    if(final.clip!=='none') for(const value of final.clip.match(/-?\d*\.?\d+/g)||[]) expect(Math.abs(Number(value))).toBeLessThan(.5);
    for(const frame of complete.slice(-4)) frame.media.forEach((value,index)=>expect(Math.abs(value-final.media[index])).toBeLessThanOrEqual(1));
    await expect(hero.getByRole('heading',{level:1})).toHaveCount(1);
    await expect(hero.locator('button.b2b-btn')).toBeEnabled();
    await expect(page.locator('.office-service-page .pin-spacer')).toHaveCount(0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  });
}

for(const width of [390,1440]) {
  test(`the water price, full contract and five inclusions stay visible without opening panels at ${width}px`,async({page})=>{
    await page.setViewportSize({width,height:width===390?844:1000});
    await page.goto('/apa');
    const offer=page.locator('.water-price');
    await expect(offer.locator('.b2b-price')).toContainText('31 €');
    await expect(offer.locator('.b2b-price')).toContainText('+ TVA / lună');
    await expect(offer).toContainText(/per aparat/i);
    await expect(offer).toContainText('36 de luni');
    await expect(offer).toContainText('1.116 € + TVA / aparat');
    const inclusions=page.locator('.water-inclusions');
    await expect(inclusions.locator('li')).toHaveText([
      'Aparat nou','Instalare și punere în funcțiune','Mentenanță periodică și igienizare','Înlocuirea filtrelor','Asistență tehnică',
    ]);
    await expect(inclusions.locator('button[aria-expanded]')).toHaveCount(0);
    for(const item of await inclusions.locator('li').all()) await expect(item).toBeVisible();
    await expect(page.locator('.water-office-context img')).toBeVisible();
  });
}

for(const mode of ['reduce','no-js'] as const) {
  test(`both service pages expose their complete content with ${mode}`,async({browser})=>{
    const context=await browser.newContext({baseURL:test.info().project.use.baseURL,viewport:{width:1440,height:1000},
      javaScriptEnabled:mode!=='no-js',reducedMotion:mode==='reduce'?'reduce':'no-preference'});
    try {
      const page=await context.newPage();
      await page.route('**/api/catalog',route=>route.fulfill({json:{products:coffeeProducts,managed:false,checkout:false,shippingBani:0}}));
      await page.route('**/api/contact',route=>route.abort());
      for(const route of ['/cafea-pentru-birouri','/apa']) {
        await page.goto(route);
        const hero=page.locator('[data-presentation]');
        await expect(hero.getByRole('heading',{level:1})).toBeVisible();
        await expect(hero.locator('[data-presentation-media] img')).toBeVisible();
        await expect(hero.locator('.b2b-btn')).toBeVisible();
        const presentation=await hero.evaluate(root=>Array.from(root.querySelectorAll('[data-presentation-line],[data-presentation-media],[data-presentation-product],[data-presentation-actions]')).map(element=>({opacity:Number(getComputedStyle(element).opacity),transform:getComputedStyle(element).transform,clip:getComputedStyle(element).clipPath})));
        for(const item of presentation) {
          expect(item.opacity).toBe(1);
          if(item.transform!=='none') {
            const translation=await page.evaluate(value=>{const matrix=new DOMMatrix(value);return[matrix.e,matrix.f];},item.transform);
            expect(translation).toEqual([0,0]);
          }
          if(item.clip!=='none') for(const value of item.clip.match(/-?\d*\.?\d+/g)||[]) expect(Math.abs(Number(value))).toBeLessThan(.5);
        }
        await expect(page.locator('.pin-spacer')).toHaveCount(0);
        if(route==='/apa') {
          await expect(page.locator('.water-price')).toContainText('1.116 € + TVA / aparat');
          await expect(page.locator('.water-inclusions li')).toHaveCount(5);
        }
      }
    } finally {await context.close();}
  });
}

test('the offer stays opaque while editing and its fade continues until native close', async ({ page }) => {
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/apa');
  await page.getByRole('button',{name:'Cere abonamentul Vero Aqua',exact:true}).click();
  const dialog=page.locator('.contact-offer-dialog');
  await expect(dialog).toHaveAttribute('data-offer-state','open');
  await expect(dialog.locator('.dialog-content')).toHaveCSS('opacity','1');
  await dialog.locator('#contact-name').fill('Date locale păstrate');
  const recording=dialog.evaluate(async node => {
    const paper=node.querySelector<HTMLElement>('.dialog-content')!;
    const shade=node.querySelector<HTMLElement>('.contact-offer-shade')!;
    const start=performance.now();
    const samples=[];
    while(performance.now()-start<650) {
      const now=performance.now();
      samples.push({ms:now-start,open:(node as HTMLDialogElement).open,
        state:(node as HTMLElement).dataset.offerState,
        paper:paper.isConnected?Number(getComputedStyle(paper).opacity):0,
        shade:shade.isConnected?Number(getComputedStyle(shade).opacity):0,
        value:paper.querySelector<HTMLInputElement>('#contact-name')?.value,
      });
      if(!(node as HTMLDialogElement).open) break;
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    }
    return samples;
  });
  await page.keyboard.press('Escape');
  const samples=await recording;
  const closing=samples.filter(sample=>sample.state==='closing');
  const closed=samples.find(sample=>!sample.open);
  expect(closing.length).toBeGreaterThan(2);
  expect(closed).toBeTruthy();
  const duration=closed!.ms-closing[0].ms;
  expect(duration).toBeLessThanOrEqual(294); //260ms target plus two nominal RAFs.
  const nearZero=closing.find(sample=>sample.paper<.01);
  if(nearZero) expect(closed!.ms-nearZero.ms).toBeLessThanOrEqual(69); //35ms plus two RAFs.
  expect(closing.some(sample=>sample.paper>.1&&sample.paper<.9)).toBe(true);
  closing.forEach((sample,index)=>{
    expect(sample.value).toBe('Date locale păstrate');
    if(index) {
      expect(sample.paper).toBeLessThanOrEqual(closing[index-1].paper+.015);
      expect(sample.shade).toBeLessThanOrEqual(closing[index-1].shade+.015);
    }
  });
  await expect(dialog).not.toBeVisible();
  await expect(dialog.locator('#contact-name')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow','hidden');
});
