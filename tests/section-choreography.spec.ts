import { test, expect } from '@playwright/test';
import { coffeeProducts } from '../src/lib/coffee-catalog';

test.beforeEach(async({page})=>{
  await page.route('**/api/catalog',route=>route.fulfill({json:{products:coffeeProducts,managed:false,checkout:false,shippingBani:0}}));
  await page.route('**/api/contact',route=>route.abort());
  await page.emulateMedia({reducedMotion:'no-preference'});
});

test('the three real coffee cards enter with measurable stagger while the section heading and rule settle',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/cafea-pentru-birouri');
  const catalog=page.locator('#magazin');
  await expect(catalog.locator('.shop-product-card')).toHaveCount(3);
  await expect(catalog).toHaveAttribute('data-choreography-state','waiting');
  const recording=catalog.evaluate(async root=>{
    const start=performance.now();
    const samples=[];
    while(performance.now()-start<4000) {
      samples.push({state:(root as HTMLElement).dataset.choreographyState,
        cards:Array.from(root.querySelectorAll('.shop-product-card')).map(card=>({y:new DOMMatrix(getComputedStyle(card).transform).f,opacity:Number(getComputedStyle(card).opacity)})),
        heading:Array.from(root.querySelectorAll('[data-choreo-heading]')).map(heading=>new DOMMatrix(getComputedStyle(heading).transform).f),
        rule:Array.from(root.querySelectorAll('[data-choreo-line]')).map(line=>new DOMMatrix(getComputedStyle(line).transform).a),
      });
      if((root as HTMLElement).dataset.choreographyState==='complete') break;
      await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
    }
    return samples;
  });
  const target=await catalog.evaluate(root=>Math.max(0,root.getBoundingClientRect().top+scrollY-innerHeight*.72));
  await page.evaluate(async top=>{
    const from=scrollY,start=performance.now();
    const duration=Math.max(900,Math.abs(top-from)/.6);
    let progress=0;
    while(progress<1) {
      progress=Math.min(1,(performance.now()-start)/duration);
      scrollTo({top:from+(top-from)*progress,behavior:'instant'});
      await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
    }
  },target);
  const samples=await recording;
  const running=samples.filter(sample=>sample.state==='running');
  expect(running.length).toBeGreaterThan(3);
  expect(Math.max(...running.flatMap(sample=>sample.cards.map(card=>card.y)))).toBeGreaterThan(15);
  expect(running.some(sample=>sample.cards[0].y+1<sample.cards[2].y&&sample.cards[0].opacity>sample.cards[2].opacity)).toBe(true);
  expect(Math.max(...running.flatMap(sample=>sample.heading.map(Math.abs)))).toBeGreaterThan(5);
  expect(running.some(sample=>sample.rule.some(scale=>scale>.05&&scale<.95))).toBe(true);
  await expect(catalog).toHaveAttribute('data-choreography-state','complete');
  const final=await catalog.locator('.shop-product-card').evaluateAll(cards=>cards.map(card=>({y:new DOMMatrix(getComputedStyle(card).transform).f,opacity:Number(getComputedStyle(card).opacity)})));
  for(const card of final) {expect(Math.abs(card.y)).toBeLessThan(.5);expect(card.opacity).toBe(1);}
  await expect(catalog.getByRole('link',{name:'Intense',exact:true})).toHaveAttribute('href','/cafea/intense');
});

test('fast scrolling finishes passed sections and read content stays visible on reverse and reduced-motion changes',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/cafea-pentru-birouri');
  await expect(page.locator('#magazin')).toHaveAttribute('data-choreography-state','waiting');
  await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  await expect.poll(()=>page.locator('[data-choreography]').evaluateAll(groups=>groups.filter(group=>group.getBoundingClientRect().top<innerHeight).every(group=>(group as HTMLElement).dataset.choreographyState==='complete'))).toBe(true);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await expect(page.locator('#magazin')).toHaveAttribute('data-choreography-state','complete');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(page.locator('#magazin')).toHaveAttribute('data-choreography-state','complete');
  for(const target of await page.locator('#magazin [data-choreo-heading],#magazin .shop-product-card').all()) await expect(target).toHaveCSS('opacity','1');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
});
