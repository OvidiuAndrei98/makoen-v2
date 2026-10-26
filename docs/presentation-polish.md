# Navigation, offer dialog and presentation interactions

This document records the preceding neutral/graphite palette and interaction
refinement. The latest service compositions and panoramic home choreography are
documented in [opening motion](opening-motion.md). Modal, navigation and
disclosure behavior described here remains, with the later modal opacity exit
and button feedback refinements recorded there.

## Shared surfaces and controls

`business.css` declares the common Makeon tokens. `interface-polish.css` applies
shared interaction states, neutral surfaces and mobile header geometry. The
support band and offer introduction use graphite; the water offer uses a light
neutral. Original logos, product packaging and photographs retain their colors.

The mobile header is 76px high, with 46px menu controls, two centered 24px lines
and a 250ms burger/X transition. The full navigation starts at 1280px. Resizing
an open menu to desktop closes the native dialog and releases its scroll lock.
The menu top row remains aligned with the header while its links enter.
The existing menu-to-cart/offer handoffs remain sequential.

Selection is disabled only on controls and links used as buttons. Editorial
copy, contact details and form inputs remain selectable. Keyboard focus remains
visible; pointer-driven dialog autofocus avoids an unintended button frame.

## Offer dialog

`BusinessShell` owns a separate offer lifecycle; the cart retains its own hook.
The 1024px desktop paper has a full-height graphite third and a two-thirds form
area, each with 36px padding. Inputs and custom select triggers are 50px high.
Visible option labels are shortened without changing the canonical values.
The existing CustomSelect keyboard behavior and portal inside the native dialog
are retained. WhatsApp follows the current interest and team selection.

The heading follows water, coffee, events or the general enquiry context.
Tab and Shift+Tab wrap between the first and last available controls. The
current control list excludes disabled/hidden content and is recomputed for
the submitting/success states. Browser Ctrl/Alt/Meta+Tab shortcuts stay native.
The backdrop enters in 200ms and the paper in 300ms; exit completes in 200ms
before unmounting the form. Reduced motion settles directly. Closing preserves
the original page position and restores focus. Inputs stay mounted throughout
the exit; after a completed close, the form resets as before.

On mobile the introduction is shorter, contacts use compact rows, the form uses
one column, and the sticky 44px close control remains reachable while scrolling.

## Service groups and photographs

`AnimatedDisclosure` drives the actual occupied height, with 360ms opening,
240ms closing and retargeting from its current position during interruption.
The indicator uses the same 200ms plus/minus treatment for services and FAQs.
Each group permits one open panel and remains independent of the other groups.
Hidden links are inert. One enquiry action per service group follows the active
service's existing interest; its general fallback is retained. That action
appears after the panels on mobile.

Coffee's real `CoffeeProductCard` preview is visible again. Home and events
share the stand-first, trailer-second photographic layout, using the originals
at their full 3:4 and 4:3 ratios. The 9:16 desktop columns produce one image
height, with aligned headings and actions; the pair is capped at 1280px.
Mobile formats stack as complete blocks. The night event hero is retained.
No missing portion of the original cropped trailer wheel was synthesized.

## Catalog readiness correction

Verification exposed a pre-existing race on direct product navigation: the
server-rendered product's add button could be pressed before CatalogProvider
had loaded the product used by CartProvider. `CoffeeDetail` now disables the
action until that catalog is ready and contains the product. A loading message
and failure/retry state explain the delay; grinding and quantity selections
are preserved. Providers, IDs, prices, stock rules, payment flows and storage
keys are unchanged.

## Local evidence

`artifacts/polish/review.html` contains before/after captures for the header,
menu, modal, photographic pairs and service panels at 390px and 1440px.
Three actual Chromium frame recordings are encoded as animated WebP using the
existing Sharp dependency, opened on demand in the review. No video executable
was installed.

The final production build (including TypeScript) and all 110 selected
Playwright cases passed in Chrome. Coverage includes responsive navigation,
reduced motion, short screens, dialog contexts/focus/exit/retry, disclosure
height/reversal, event photo/caption alignment, catalog loading/failure and
product variants/quantity/removal/checkout UI. Mobile cases use browser
emulation; physical-device and other-browser testing were not performed.
Contact/order responses in browser tests are mocked; no real lead, order,
payment or deployment was made.
