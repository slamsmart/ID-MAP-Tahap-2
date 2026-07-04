---
target: ID-MAP-Final/src/app/page.tsx
total_score: 23
p0_count: 0
p1_count: 3
timestamp: 2026-06-24T04-48-49Z
slug: id-map-final-src-app-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Skeleton/loading states exist, but homepage async states do not always explain what is loading. |
| 2 | Match System / Real World | 3 | Mission language is clear, with some technical terms like MRV, SRN, CO2e needing context. |
| 3 | User Control and Freedom | 2 | Carousel auto-advances without pause control, mobile menu lacks Escape/focus-trap handling. |
| 4 | Consistency and Standards | 2 | Landing UI mixes pill SaaS nav, cyber-glow hero, glass stats, 3D tilt cards, and dashboard product styling. |
| 5 | Error Prevention | 2 | Core CTA flows are simple, but donation/admin areas rely on validation conventions that are not standardized. |
| 6 | Recognition Rather Than Recall | 3 | Main links and CTAs are labeled, but dense role/service terms require scanning and prior understanding. |
| 7 | Flexibility and Efficiency of Use | 2 | Dashboard navigation is complete, but little evidence of power-user shortcuts, bulk patterns, or reduced-motion-by-default for frequent interactions. |
| 8 | Aesthetic and Minimalist Design | 2 | Strong first impression, but glow orbs, grid floor, gradient text, glass cards, tilt, shine, and floating motion compete. |
| 9 | Error Recovery | 2 | Error pages/components exist, but homepage and async landing sections provide little recovery guidance. |
| 10 | Help and Documentation | 2 | FAQ exists globally, but contextual help is sparse around technical claims and high-stakes donation/compliance terms. |
| **Total** | | **23/40** | **Acceptable, solid foundation but needs design-system tightening** |

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2 | Labels exist in many places, but custom carousel, mobile drawer, color/contrast-on-image, and focus management need hardening. |
| 2 | Performance | 2 | Hero uses optimized rAF for parallax, but repeated blur, tilt, glow, shine, hover scale, and auto-carousel add GPU/CPU load. |
| 3 | Responsive Design | 3 | Mobile first fold works, though hero image/card stack and floating chat can crowd lower viewport. |
| 4 | Theming | 1 | Colors are mostly Tailwind literals and hex values, not a cohesive token/OKLCH system. |
| 5 | Anti-Patterns | 1 | Gradient text, decorative glassmorphism, glow orbs, and repeated 3D card treatments read as AI-polish patterns. |
| **Total** | | **9/20** | **Poor technically, not because it is broken, but because the system is visually and mechanically over-styled** |

## Anti-Patterns Verdict

Pass/fail: partial fail. The homepage does not look careless, but it does show recognizable AI-era UI tells: saturated dark-green hero, gradient accent headline, glow orbs, blurred glass chips, 3D tilt photo frame, floating stat cards, and shine/hover effects repeated across sections.

Deterministic scan: attempted with `detect.mjs`, but the bundled detector reported `Error: bundled detector not found.` Manual code scan found the same class of issues in `HeroSection.tsx`, `ThreeRolesSection.tsx`, `OurServicesSection.tsx`, `PokmaswasCampaignSection.tsx`, `Navbar.tsx`, `TiltCard.tsx`, and `globals.css`.

Visual evidence: desktop and mobile screenshots were captured from `http://localhost:3002`. No browser overlay was available because detector injection depends on the missing bundled detector.

## Overall Impression

ID-MAP has a strong mission signal and the first viewport communicates "coastal ecosystem platform" quickly. The biggest opportunity is restraint: keep the real mangrove imagery and credible data story, but remove the competing visual languages so the interface feels like a trusted environmental data platform, not a demo reel of frontend effects.

## What's Working

1. The homepage has a clear first action: `Mulai Berkontribusi` is visible, high contrast, and correctly prioritized.
2. Real coastal imagery gives the brand immediate specificity; the UI is not relying only on abstract gradients.
3. The code already respects some performance/a11y basics: rAF is used for pointer motion, reduced-motion media queries exist, and many icons are marked `aria-hidden`.

## Priority Issues

### [P1] Visual system is overloaded by decorative effects

Why it matters: Users need to trust ecological data, donations, MRV, and ESG claims. Excess glow, glass, gradient, tilt, shine, and floating cards make the platform feel less institutional and less grounded.

Fix: Remove gradient text and glow orbs from the hero, reduce glass cards, keep one motion motif max, and let real imagery plus calm typography carry the brand.

Suggested command: `impeccable quieter`

### [P1] Motion is too frequent for a product platform

Why it matters: The Emil design-engineering frame is clear here: details compound, but repeated decorative movement also compounds into fatigue. Homepage hero parallax, tilt cards, floating cards, glow pulse, scroll reveal, shine, image zoom, progress growth, and auto-carousel all compete.

Fix: Keep motion only where it confirms action or explains state. Add subtle `:active` feedback to pressables, replace broad `transition-all`, pause or remove auto-carousel, and make hover tilt rare.

Suggested command: `impeccable optimize`

### [P1] Theming is not systematized

Why it matters: The project repeats `#0f3d2e`, `#06140f`, `bg-white`, `text-black`, emerald/tint utilities, and hard-coded shadows across landing, maps, dashboard, and generated SVG. This makes consistency fragile and future redesign expensive.

Fix: Create tokens for surface, ink, brand, accent, border, focus, success/warning/error, and overlay. Prefer OKLCH tokens in CSS variables and map Tailwind usage to those tokens.

Suggested command: `impeccable extract`

### [P2] Carousel and mobile drawer need accessibility hardening

Why it matters: Keyboard-only and screen-reader users need predictable control. The services carousel auto-advances with a timer but no pause button, and the mobile nav opens visually without focus management or Escape handling.

Fix: Add carousel pause/play, visible current slide text, keyboard controls, and `prefers-reduced-motion` pause. Give the mobile drawer focus trapping, Escape close, and restore focus to the trigger.

Suggested command: `impeccable harden`

### [P2] Long Indonesian/English labels risk overflow and scanning fatigue

Why it matters: Labels like "Jelajahi Peta Restorasi Lingkungan" and technical service titles are meaningful but long. On small screens they stack well in hero CTAs, but nav and cards can become dense.

Fix: Shorten display labels where possible, move explanation into secondary text, and test English variants at mobile/tablet widths.

Suggested command: `impeccable clarify`

## Emil Design Engineering Review

| Before | After | Why |
| --- | --- | --- |
| `transition-all` on primary CTA, campaign cards, sidebar items, carousel buttons | Transition exact properties: `transform`, `box-shadow`, `background-color`, `border-color` | `transition-all` can animate accidental properties and makes interactions feel less intentional. |
| Gradient text on the hero accent | Solid accent color, or white headline with one accent word in brand green | Gradient text is decorative and one of the strongest AI-polish tells. |
| Multiple persistent decorative motions in first viewport | One restrained entrance or none; keep press feedback on buttons | Users will see homepage and dashboard often. Frequent motion should feel fast, not performative. |
| TiltCard used across hero, role cards, services, and campaigns | Reserve tilt for one memorable object, remove from repeated cards | A special interaction stops feeling special when every card behaves the same way. |
| Auto-advancing services carousel every 3.5s | User-controlled carousel with pause/play and optional reduced-motion pause | Auto movement steals attention and creates control/accessibility risk. |
| Glass + blur + glow on badges/cards/chat-like floating UI | Solid tinted surfaces with clear borders and fewer shadows | Trust-oriented product UI benefits from tangible, quiet surfaces. |
| Buttons mostly have hover, some active states only | Add consistent `active:scale-[0.98]` and focus-visible rings to pressables | Buttons should feel responsive immediately without relying on large hover choreography. |

## Persona Red Flags

Jordan, first-timer: The first action is clear, but terms like MRV, SRN, CO2e, ESG, carbon value, and Pokmaswas appear without inline explanation. Jordan may understand the mission but hesitate before choosing a role.

Sam, accessibility-dependent user: The mobile drawer and services carousel need stronger keyboard/focus semantics. Image overlays and white text over photos should be contrast-tested, especially where the background image changes through CMS/admin content.

Casey, distracted mobile user: Mobile hero CTA is strong, but the large second hero image and floating chat button crowd the lower viewport. Casey may need faster access to donation/map actions without scrolling through heavy visual modules.

## Minor Observations

1. The nav pill on desktop feels visually detached from the dark ecological hero.
2. `rounded-3xl`/`rounded-2xl` appears frequently; product UI would benefit from a tighter radius scale.
3. Custom scrollbar styling in `globals.css` is low-value and can diverge from platform expectations.
4. `bg-white` and `text-black` are used heavily despite the skill guidance to tint neutrals.
5. The dashboard sidebar uses a colored left active indicator bar, a banned pattern in the Impeccable skill when used as accent stripe. Replace with full-row selected state or icon/marker treatment.

## Questions to Consider

1. Should ID-MAP feel more like a government-grade environmental data platform, a public donation campaign, or a climate-tech SaaS product?
2. Which visual motif deserves to stay: real coastal imagery, 3D tilt, glass stats, or motion-rich carousel?
3. What should a user remember after 5 seconds: mangrove restoration, transparent donation, or verified carbon/ESG workflows?
