# Makeon presentation: composition and choreography

The presentation uses three separate motion owners. Providers, commercial data,
real controls and routes remain outside their animation lifecycles.

| Level | Owner | Scope |
| --- | --- | --- |
| Main scenes | `useHomeOpeningMotion` | Home entrance and one native-scroll timeline |
| Service entrances | `usePresentationEntrance` | Coffee, water and event hero media, title lines and action groups |
| Section sequences | `useSiteChoreography` | Home continuations, service modules, the real catalog preview and event photographs |
| Interactions | Existing dialog/cart hooks and `AnimatedDisclosure` | Overlay lifecycle, focus, scroll locks and measured expandable content |

`BusinessShell` calls `useSiteChoreography` once on its root ref. The hook scopes
its work to `main`, excludes `.home-opening` and `[data-presentation]`, and never
targets the header, contact dialog or cart. `site-choreography.css` contains only
local masks and separator geometry; it does not hide content before JavaScript.

## Home: one scroll timeline and a CSS sticky stage

`CombinedHero` retains one semantic H1, live introduction, enquiry action, event
link and the real `OfficeOffers`. Words do not travel between headings. The text
stays anchored while the photograph and offer area share one moving edge.

The enhanced scene requires all of the following:

- At least 1280px width and 960px height.
- No reduced-motion preference.
- Both offer interiors fitting their allotted surfaces.

The root adds `.is-scroll-scene` only when the fit check passes. CSS reserves the
stage height plus `75svh`; `.opening-stage` uses `position: sticky` below the
86px header. **ScrollTrigger does not pin or reparent the DOM and creates no
`.pin-spacer`.** The scene's scroll range is `Math.round(innerHeight * .75)`.
ScrollTrigger observes the native window and scrubs one timeline:

| Progress | Coordinated behavior |
| --- | --- |
| 0–.64 | The photograph changes from the panorama to 55% width; the adjoining 45% offer area is uncovered from the same edge |
| .18–.58 | Coffee leads and water follows as complete offer groups, with a .10 offset |
| .25–.71 | The separate product scroll layers settle from 56px below, with a .08 offset |
| .71–1 | The complete composition remains stable for reading and using both offers |

The photograph is one image plane. Its pan changes the crop without stretching
the image or pretending that equipment inside it is an independent cutout.
The real cutouts in the offer panel keep their original proportions.

The entrance uses separate layers: `.opening-photo-enter` settles from scale
1.025, `.opening-title-line` rises inside its line masks, and the description and
`.opening-copy-follow` finish the introduction. The full entrance lasts about
800ms on desktop and 650ms on mobile. The scroll timeline owns the atmosphere's
clip, `.opening-photo-pan`, offer groups and `.opening-product-scroll`; it does
not compete with the entrance over the same element/property.

The entrance is prepared paused and marked as played only in its first actual
RAF. React Strict Mode can therefore revert an initial setup without consuming
the entrance. Starting to scroll finishes it; restored positions and fragment
entries skip it. The controls remain real, mounted and usable.

### Fallbacks and navigation

Reduced motion, JavaScript-disabled rendering and layouts that fail the scene
gate show the complete composition directly, without extra scroll distance.
The static desktop panel uses the existing 55/45 layout from 1280×900. Shorter
or intermediate layouts put the offers below the introduction in two columns;
at 540px and below they stack. Up to 1000px the image leads and the live copy
follows on a light surface.

The enhanced root publishes `data-opening-start`, `data-opening-end` and
`data-opening-progress`. `SmoothScroll` resolves `#solutii` inside an enhanced
offer area to that measured end. A fresh fragment is aligned after fonts settle;
ordinary Back restoration is not replaced with a new forced alignment. Keyboard
focus entering an offer before the reveal completes advances to the readable
end. The same real links, IDs and semantic headings serve every layout.

## Service heroes

`usePresentationEntrance` uses `[data-presentation="coffee"|"water"|"events"]`
and explicit child layers, rather than broad selectors shared with section
animation. It uses the boolean conditions from `gsap.matchMedia`; native media
queries elsewhere are checked through `.matches`.

| Layer | Desktop | Mobile, up to 800px |
| --- | --- | --- |
| Coffee photograph | Lateral clip reveal, 800ms | 560ms |
| Water neutral field | Vertical clip reveal, 800ms | 560ms |
| Water product | 44px to rest over 720ms | 28px over 520ms |
| Title lines | 36px within masks, 640ms with .065 stagger | 24px, 450ms with .045 stagger |
| Copy | 16px to rest, 450ms | 10px, 350ms |
| Price/conditions/CTA group | 14px to rest, 460ms, starting at .20 | 10px, 360ms, starting at .16 |

All phases overlap inside the approximately 800ms desktop or 560ms mobile
entrance, using `power3.out`. Water's price, conditions and CTA are one group;
the price itself is never counted up or split into animated digits. The crop
rests after the entrance. Service heroes have no pinning, zoom loop or parallax.

Initialization does not wait for image decoding or fonts before exposing useful
content. A paused timeline starts on RAF, and its visited key is recorded then,
not during setup. Scroll, focus, activating a real control or a persisted
`pageshow` completes the entrance. A previously visited hero, fragment entry or
restored scroll position remains at its final state. Reduced motion and no-JS
markup are directly visible.

`data-presentation-state` reports `running` or `complete` for local diagnostics.
No GSAP or scrolling instance is exposed on `window`.

## Section choreography

Sections declare their composition through reusable attributes:

| Attribute | Responsibility |
| --- | --- |
| `data-choreography` | `section`, `band`, `catalog`, `event-pair` or nested `event-card` |
| `data-choreo-media` | A reserved image/product frame revealed by a vertical mask |
| `data-choreo-heading` | The inner heading layer inside `.choreography-heading-mask` |
| `data-choreo-line` | A separator growing from its left edge |
| `data-choreo-item` | A complete information group, separate from interactive child layers |
| `data-choreo-cards` | The existing catalog card container |
| `data-choreo-caption` | A complete event caption and its real action |

An ordinary desktop sequence leads with its media for 660ms. The heading follows
inside a 520ms mask, the separator grows for 500ms, and information settles over
440ms with 60ms offsets. Phases overlap to finish in roughly 550–800ms. Mobile
uses a 500ms media reveal and shorter, smaller information movement, generally
within 400–650ms. The graphite home band keeps its surface present throughout;
its title, line and factual information form one composition.

The existing three `CoffeeProductCard` components enter with a 70ms offset
(60ms on mobile). A late catalog response adds motion only to the new cards;
it does not conceal or restart a heading that was already read. Product
selection, prices, availability handling and add-to-cart still belong to the
original catalog/provider components.

Desktop event photographs reveal over 780ms with a 100ms offset, followed by
their captions. On mobile, each complete `event-card` owns its own viewport
entry, so the second photograph does not consume its entrance while far below
the first. No DOM reparenting, image zoom or parallax changes the final crop or
the alignment of the photographic pair.

### Entry, interruption and cleanup

- A section starts around `top 88%`; late catalog cards use `top 90%`.
- Sections already in view are initialized too. Read/restored groups and direct
  anchor destinations stay complete.
- Sequences play once. Leaving the section, returning above its trigger or a
  large native-scroll jump completes them. Read sections do not hide on reverse.
- Focus or activating a control completes its own group immediately.
- The once-played state survives responsive context changes. Enabling motion
  does not conceal content already visible with reduced motion.
- Asynchronous scans run through `context.add`, preserving GSAP ownership.
  A child-list observer handles real catalog insertions, not per-frame style
  mutations.
- Layout changes schedule a debounced 120ms refresh. Disclosure height updates
  therefore do not force a ScrollTrigger refresh on every animation frame.
- Context cleanup reverts styles, cancels queued RAF/timers and disconnects
  mutation/resize observers and listeners. Late font work checks disposal.

`data-choreography-state` exposes `waiting`, `running` or `complete`. Default CSS
has no persistent zero-opacity state, and fallback markup remains readable.

## Audit findings and interaction corrections

The previous motion system had several concrete failure paths:

1. The home entrance marked its global played flag during effect setup. Strict
   Mode could revert that first timeline and then skip the second setup. Service
   entrances also used a class-name cache key; both owners now mark actual RAF
   playback, with an explicit pathname/presentation key for services.
2. Initialization waited for fonts and image decoding, allowing a late entrance
   after content had already been shown or passed.
3. The legacy home-event branch referenced removed `.home-event-reveal`,
   `.home-event-photo` and `.home-events-story` markup. The current photographic
   pair had no corresponding shared sequence. That branch also carried the
   unwanted parallax behavior.
4. A scroll-listener cleanup returned from an asynchronously invoked initializer
   was not the cleanup returned to the matchMedia lifecycle.

The new owners use verified attribute targets, immediate setup, RAF marking and
explicit local cleanup. There is no second smooth-scroll engine: the existing
Lenis controller still eases wheel input at duration 1.15 through one GSAP
ticker, while native window coordinates, native touch and keyboard behavior
remain. Overlays pause inertia; route/focus/history navigation cancels it.

The measured modal baseline closed in 201–213ms; the observed issue was not a
multi-second lifecycle stall. `power3.out` reduced the paper below .01 opacity
at about 129ms, leaving approximately 72ms of nearly invisible open tail.
The paper and shade now fade linearly for 200ms, aligned with native close and
unmount; the separate 16px exit movement keeps its own easing. At rest, the form
paper is fully opaque. Entry remains a 300ms paper movement/fade and a 200ms
shade fade. The cart's separate lateral entrance is 360ms.

`AnimatedDisclosure` retains measured 360ms opening and 240ms closing, reversible
from the current height, with a 200ms indicator. It does not compress text with
scaleY or use an arbitrary max-height. Hidden content is inert; groups remain
independent. Each service group has one CTA using the active service's original
interest, or its existing page default when no panel is open. Modal focus,
Escape, overflow restoration, field state and cart/provider state stay with
their respective existing components.

## Assets and commercial boundaries

The office context uses the existing
`public/images/makeon-office-hero-v2.webp` illustration, labeled as a Makeon
presentation illustration. It is not presented as verified customer photography.
The source is 1672×941, but the dedicated coffee crop contains only about
660×528 effective source pixels. The current coffee window is capped at
720×576. Increasing that window would enlarge the illustration further.

For a real, sharper replacement, supply a **coffee office photograph of at least
1600×1280 pixels**, showing the SwitchMORN espresso machine, counter and serving
area together, with enough space for the existing crop. This is the specific
remaining asset requirement. No missing equipment, office, client or photograph
has been fabricated. Equipment cutouts, authentic logos, product packaging and
existing event photographs keep their original colors and proportions.

`waterSubscription` remains the authority for 31 EUR + VAT/month/apparatus,
36 months and a 1,116 EUR + VAT total per apparatus. Its five inclusions remain
visible beside the office context. Coffee remains a personalized equipment,
consumption and service offer; installation, maintenance and costs are confirmed
in that offer. Interests, routes, anchors, form/catalog/cart APIs and providers
retain their existing roles.

## Review and recorded evidence

The current comparison is
[service choreography review](../artifacts/service-choreography/review.html).
It links uncropped before/after captures at 390×844 and 1440×1000, complete pages
and the actual WebP recordings for home scroll, coffee/water entrances and
section interactions. Captures compare composition; recordings demonstrate
motion. Earlier reviews document previous directions rather than the current
acceptance state.

The local [mobile event probe](../artifacts/service-choreography/motion-diagnostic.json)
recorded 22 intermediate clip values for the stand and 24 for the trailer. The
trailer remained waiting at 1465px below an 844px viewport until its own entry.
Both images stayed at scale 1, reverse kept the completed state, reduced motion
cleared the masks to `none`, and the probe recorded no page errors. The
[capture audit](../artifacts/service-choreography/after/audit.json) records the
actual viewport, reduced-motion setting, overflow and page errors for its images.

The final production build and TypeScript check passed. The current selected
Playwright suite passed **124/124 cases in Chrome** in approximately 3.5 minutes,
using desktop viewports and mobile emulation. This result describes that selected
suite; it does not claim every historical suite or testing on a physical device.
The six final page/viewport capture configurations recorded no horizontal
overflow or page errors.

The four production recordings were validated with no page errors:

| Recording | Captured frames | File duration |
| --- | --- | --- |
| `home-scroll.webp` | 21 | 4.846s |
| `coffee-entrance.webp` | 10 | 3.265s |
| `water-entrance.webp` | 12 | 2.331s |
| `sections-interactions.webp` | 35 | 7.617s |

These files include observation time and interactions; their durations are not
the entrance timings listed above. Verification is local and uses intercepted
test requests: no real customer lead, order, payment or deployment is part of
this review.
