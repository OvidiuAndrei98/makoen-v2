# Makeon presentation design

The current presentation uses warm white (`#faf9f6`), light neutral (`#f1f0eb`),
warm graphite (`#25231f`), DM Sans and the existing brand gold for primary actions.
The support band and offer introduction use graphite; the water offer uses the
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
| Home support | Text only | Compact graphite `HomeSupport` band with equipment selection, installation/maintenance, coffee supply and existing specialist links. No repeated brand logos or cards. |
| Home events | `events/bar-mobil-makeon.webp`, 1500 x 2000; `events/rulota-exterior.webp`, 2000 x 1500 | Stand first, trailer second. Original proportions share a desktop height in a 9:16 grid, capped at 1280px, with aligned captions/actions. Full format blocks stack on mobile. |
| Coffee service | Dedicated crop of the existing office illustration; original espresso-machine cutout | 40% introduction / 60% contextual image, followed by one equipment/offer frame, three real catalog products and compact services. Specifications and FAQs open on demand. |
| Water service | Original dispenser cutout and existing office illustration | Wide three-zone title/equipment/price composition; mobile puts the price/conditions/action before the product. A large contextual image and all five inclusions form the next composition. Compact filtration, additional services and FAQ follow. |
| Filtration | `filtration/four-filters.webp` | Existing illustration, qualified as one depicted configuration, with compatibility checked for the chosen equipment. |
| Events introduction | `events/rulota-makeon.webp`, 1600 x 1200 | Actual nighttime setup, large photograph beside live text; text precedes it on mobile. |
| Events formats | Existing bar and exterior trailer photographs | Same aligned photographic pair as home, with separate enquiry actions using the original service identifiers. No additional crop, zoom or parallax. The trailer wheel is already cropped in the original file. |
| Product selection | Existing catalog and `CoffeeProductCard` | Same live data and add-to-cart action as the store; no duplicate static catalog. |

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

Production build and TypeScript passed. The selected Playwright suites passed
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

The current comparison is `artifacts/service-choreography/review.html`, with
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
