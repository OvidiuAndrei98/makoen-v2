# Makeon presentation design

The current presentation uses warm white (`#faf9f6`), light neutral (`#f1f0eb`),
warm graphite (`#25231f`), Cormorant Garamond Variable for headings, DM Sans
Variable for body text and controls, and the existing brand gold for primary actions.
The coffee craft band and offer introduction use graphite; the water offer uses the
light neutral. Common colors are declared as `--makeon-*` tokens in `business.css`.
The shop retains its serif
product titles, product cards, spacing, filters, artwork and commercial behavior.
The shared header and footer are the only intentional visual changes in the shop.

## Composition and assets

| Placement | Existing asset | Presentation |
| --- | --- | --- |
| Home opening | `images/makeon-office-hero-v2.webp`, 1672 x 941 | Panorama changes to 55% image / 45% offers through one scroll timeline and native CSS sticky positioning on sufficiently large windows. Text stays anchored. Complete static layouts cover smaller windows, reduced motion and no JavaScript. See [opening motion](opening-motion.md). |
| Home coffee | `images/coffee-machine-switchmorn.png`, 1015 x 1549; original SwitchMORN logo | Warm adjoining offer surface, with optically sized circular logo, larger apparatus zone, distinct personalized-quote label and existing service link. |
| Home water | `images/vero-aqua-dispenser.webp`, 430 x 1200; original Vero Aqua logo | Light neutral adjoining surface separates the white apparatus from its background. Price is prominent with VAT, monthly/apparatus unit and term kept together. |
| Home service summaries | Client's cropped SwitchMORN photograph; original Vero Aqua dispenser and both brand marks | Two branded campaign panels: coffee uses a graphite surround, large serif heading and a restrained dark photo mount; water uses a blue-gray product stage with the actual dispenser, temperatures and filtration information. Commercial details and one contextual action share a separate lower rail. Mobile follows title/copy, image, then offer/action. |
| Home shop | Live catalog and `CoffeeProductCard` | Appears before events, after the coffee/water support band. Three actual products remain visible on desktop and mobile, using the shared catalog and cart. |
| Home events | Original stand and trailer photographs | Follows the shop with two complete format blocks and direct links to the dedicated events page. The original photo ratios share a desktop height; neutral panels match the service pages. |
| Coffee service | Dedicated crop of the office illustration; original espresso-machine cutout; client-provided SwitchMORN photograph | 40% introduction / 60% contextual hero. Below it: equipment/quote, three live catalog products, a graphite service band with the client's photograph framed to 4:3, and one illustrated compatibility enquiry. Only FAQ answers collapse. |
| Water service | Original dispenser cutout and existing office illustration | Existing title/equipment/price hero retained. Below it: a wide contextual image, five visible inclusions with icons, a large four-filter illustration and visible existing-system services with one enquiry action. Only FAQ answers collapse. |
| Filtration | `filtration/four-filters.webp` | Existing illustration, qualified as one depicted configuration, with compatibility checked for the chosen equipment. |
| Events introduction | `events/rulota-makeon.webp`, 1600 x 1200 | Actual nighttime setup, large photograph beside live text; text precedes it on mobile. |
| Events formats | Existing bar and exterior trailer photographs | Same aligned photographic pair as home, with separate enquiry actions using the original service identifiers. No additional crop, zoom or parallax. The trailer wheel is already cropped in the original file. |
| Product selection | Existing catalog and `CoffeeProductCard` | Same live data and add-to-cart action as the store; no duplicate static catalog. |

Content photography uses neutral gallery panels (`#eeece7`), a fine structural
edge, 4px outer corners and 20px space around the image (12px on narrow screens).
Photographs have a 2px inner corner and no colored border or shadow. Event panels
use equal percentage insets horizontally to retain the paired photographs' exact
proportions and shared height. Equipment and product galleries share the surface
and edge with their existing interior spacing. These rules live in
`media-frames.css`, leave source image colors intact, and preserve
`object-fit: contain` for apparatus and complete event photographs.
The home opening keeps its full-bleed background photograph; brand marks retain
their transparent artwork. Home's coffee campaign overrides the shared matte
with a 10px dark mount and a fine light edge, keeping the source's 4:3 crop. The
water campaign stages the original transparent dispenser with no image filter,
shadow or additional generated image. Both campaigns use real variable italic
Cormorant glyphs for their title accents. The photo's optional 2% hover zoom and
button-arrow feedback apply only to hover-capable pointers without reduced motion.
Current before/after captures are in
`artifacts/home-media-refresh/`.

`images/switchmorn-coffee-corner.webp` is the actual photograph supplied by the
client, compressed from the 2048×1365 original. Its 4:3 display uses a 1200×900
window at x800/y300: water bottles, upper empty space and the lower table edge
are outside the visible crop. The full source is retained; no equipment or
background was generated or retouched.

The office hero is an existing generated illustration, not evidence of a customer
installation. No new images, clients, installations or equipment were generated
for this redesign. The coffee crop uses approximately 660 x 528 source pixels
and is capped at a 720 x 576 display frame. A dedicated real photograph of the
espresso machine, counter and serving area at least 1600 x 1280 is needed for a
crisp high-density replacement. The water context also uses the existing
illustration, labeled explicitly; no client installation is claimed.
Capacity, dimensions and event package pricing
are not added because verified client data is unavailable.

`OfficeOffers` adapts its interior to the normal-flow desktop panel, intermediate
two-column layout and mobile stack; it does not introduce a universal card layout.
Both equipment images have real transparency and use `object-fit: contain`
without a blend mode. Brand logos sit above their corresponding titles at
different optical widths. Commercial details are grouped separately from the
short descriptions: the coffee quote remains personalized, and installation and
maintenance are confirmed in that offer.

Local hover/focus feedback uses a separate inner product wrapper, coordinated
with the action arrow, underline and subtle surface-tone change over 320ms.
It remains independent of the short entrance and adds no scroll reveal. Products
remain stable at rest; touch needs no hover, and reduced motion removes movement.

## Navigation and existing destinations

Five direct links expose office coffee, water/filtration, events, store and the
existing About section on home. There are no separate About or Contact routes in
the current project: the existing destinations remain the factual `/#despre`
section, real contact details and the shared contact form. Filtration, maintenance,
roasting and blends remain accessible through section links and the footer.

The native mobile menu closes before opening either the offer form or cart.
The cart handoff focuses the header cart button before opening the existing
drawer, allowing focus to return to a visible control. Its provider, state and
storage key are unchanged. At 1280px the full navigation replaces the mobile menu.

The footer places identity, phone and email in the left five columns, with two
compact navigation groups in the right seven columns. Legal text and links are
reused without rewriting their content. Company fields are still empty and legal
pages remain drafts in `legal.ts`; no merchant identity has been fabricated.
The existing cookie-policy link is retained; there was no cookie-settings manager.

## Commercial contracts preserved

- `CatalogProvider` and `CartProvider` remain mounted once in the public layout.
- Product IDs, variants, grinding, quantities, stock, prices and persistence are unchanged.
- Stock checkout, mixed/made-to-order carts, acknowledgements and payment APIs are unchanged.
- `/api/contact` retains its payload, validation and idempotent retry behavior.
- Event details stay in the accepted message field; guest count uses the existing team field.
- Water remains 31 EUR + VAT/month/apparatus for 36 months, total 1,116 EUR + VAT/apparatus.
- Coffee equipment, installation, maintenance and supply costs remain subject to a personalized quote.

## References consulted

These informed the distinction between equipment, context, services and shopping.
No competitor assets, copy or commercial promises were imported.

- [Borg & Overstrom](https://borgandoverstrom.com/en-eu)
- [Franke Workplaces](https://www.franke.com/gb/en/coffee-systems/industries/workplace.html)
- [Bridge Coffee Roasters](https://bridgecoffeeroasters.co.uk/)
- [Coffee Circle Offices](https://www.coffeecircle.com/en/e/b2b-offices-info)
- [Coffee on Cue](https://www.coffeeoncue.com.au/coffee-cart-hire)

## Local validation

The branded campaign revision passed production build (including TypeScript) and
43 affected browser cases for home, offers, events, contextual forms and smooth
scrolling. The home was checked at nine widths from 320 to 1920px, retaining both
campaigns, all three products, working cart actions, events and footer without
horizontal overflow or browser errors. Rendered campaign captures at 390 and
1440px are under `artifacts/home-media-refresh/campaign/`; all images are loaded
and unfiltered. The 4:3 coffee crop still excludes the water bottles.

The preceding editorial home rows and Cormorant heading update passed production build,
TypeScript checking and 67 targeted browser cases covering the opening, service
offers, events, disclosures, modal, smooth scrolling and contextual enquiries.
Computed-font checks across seven public routes at 390 and 1440px confirm
Cormorant headings, DM Sans body text, Romanian glyph loading and no horizontal
overflow or browser errors. Font evidence is in `artifacts/heading-font/`.
Both home buttons retain the correct interest and WhatsApp text
and restore focus after closing. At nine widths (320, 390, 768, 900, 901, 1024,
1280, 1440 and 1920px), the final home has two visible service summaries, three
catalog products, one event section, working cart actions, and no overflowing
summary text or browser errors. Current summary captures are
`artifacts/home-media-refresh/after/home-solutions-390.png` and
`home-solutions-1440.png`.

On 28 October, production build and the full selected 120-case browser suite
passed for the home/shop/media changes. After restoring the home events below
the shop, the build and 38 affected home, offer and event cases passed again.
The final home was checked at 320, 390, 768, 1024, 1280, 1440 and 1920px:
all three live coffee cards, working add-to-cart, one event section, visible
footer contacts and no horizontal overflow or browser errors. Six public pages
were captured at 390 and 1440px with all images loaded and no image filters.
Evidence is in `artifacts/home-media-refresh/home-audit.json` and its `after/`
directory. Browser coverage is Chrome with emulated mobile viewports.

The 27 October service-body refinement passed production build and 64 targeted
Playwright cases covering both pages, service enquiries/WhatsApp selections,
catalog loading/retry, cart/checkout UI, FAQ height/reversal, modal focus and
hero/section choreography. Existing-system installation, maintenance and filter
interests remain selectable in the shared offer form. No real requests or orders
were submitted. At 320, 390, 768, 1024, 1440 and 1920px both pages have no
horizontal overflow, broken content images or browser errors. Hero pixel crops
match the pre-change captures at 390 and 1440px. The comparison is
`artifacts/service-body-refresh/review.html`; measurements are in
`artifacts/service-body-refresh/layout-audit.json`. Tests use Chromium, with
emulated mobile widths; physical devices, other engines, browser zoom and RTL
were not verified in this pass.

The preceding production build and TypeScript passed. Its selected Playwright suites passed
124 tests: smooth wheel/native touch, overlay locks, anchors/history/focus,
the panoramic opening, resize, no-JavaScript rendering, offer geometry,
commercial details, hover/focus, navigation, office pages,
event forms, contact retry, specialist services, catalog loading/failure,
cart layout/unavailable items and shop/checkout UI. The current refinement adds
header/dialog alignment, Tab wrapping, contextual modal labels and canonical
payloads, measured/reversible disclosures, photographic alignment and product
catalog readiness/retry checks. Frame sampling verifies the service hero masks
and title lines, the real product stagger, section sequences and modal fade.
They include menu-to-cart handoff and focus/scroll restoration with and without
reduced motion. Back/Forward restores the normal-flow page without replaying
its entrance. Initial fragment URLs settle at their CSS scroll offset.
Six mocked contact-provider unit tests passed in the preceding redesign; the
provider/API implementation is unchanged by this refinement. No real order,
payment or lead was submitted. This does not claim a run of every historical
visual or database integration suite.

During the preceding redesign the five main pages were checked at 320, 390,
768, 1024, 1280, 1440 and 1920px:
no horizontal overflow, clipped main text/controls or browser runtime errors.
Computed shop product fonts, sizes, backgrounds and corner radii match the
original saved baseline at 390 and 1440px. Screenshots of all five pages at
390, 1440 and 1920px are saved under `artifacts/motion/`.
`artifacts/complete/qa.json` contains responsive measurements. These artifacts
are local and gitignored. The implementation has not been deployed.

The preceding comparison is `artifacts/service-choreography/review.html`, with
before/after service heroes and water-context compositions at 390px and 1440px,
plus four actual Chromium recordings of entrances, home scrolling and
interactions encoded as animated WebP. Current captures show no horizontal
overflow or browser runtime errors. The preceding navigation/modal comparison
remains in `artifacts/polish/review.html`.
Measured contrast examples are in `artifacts/polish/contrast.json`: body copy
5.47:1 on the water offer, 10.41:1 on graphite, primary action 8.68:1 and form
boundaries 3.46:1 against their field backgrounds. These are targeted checks,
not a claim of a complete accessibility audit or physical-device testing.
See [opening motion](opening-motion.md) for current choreography and
[presentation polish](presentation-polish.md) for the preceding interaction pass.
`artifacts/clarity/review.html` and the earlier offer/transfer reviews document
preceding directions, before the visible coffee product preview was restored.
