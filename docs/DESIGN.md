---
version: "alpha"
name: Celestial Ember
description: >
  Warm candlelit dark UI extracted from a mystical/astrology mobile concept.
  Amber-brown tonal surfaces, bronze monetization moments, periwinkle-blue
  interaction, parchment-cream data visualization, ember-orange urgency.
colors:
  primary: "#3D6BE6"          # Periwinkle Blue — interaction, chat, social
  on-primary: "#FFFFFF"
  secondary: "#C99E6F"        # Burnished Bronze — premium/monetization surfaces
  on-secondary: "#2A1D10"
  tertiary: "#EFE6D8"         # Parchment Cream — data viz, selected states
  on-tertiary: "#1C150D"
  accent: "#F25430"           # Ember Orange — urgency, deltas, badges
  on-accent: "#FFFFFF"
  danger: "#E5483D"           # Notification badge red
  background: "#15100B"       # Warm near-black (never pure #000)
  background-gradient-end: "#0E0B07"
  surface: "#241B12"          # Card surface — one tonal step up
  surface-raised: "#2E2418"   # Pills, chips, raised elements
  surface-inset: "#1A140D"    # Input fields, recessed wells
  border: "#3A2F21"           # 1px hairline card borders
  text-primary: "#FFFFFF"
  text-secondary: "#9A9285"   # Warm ash gray
  text-tertiary: "#6E6657"    # Timestamps, placeholders
typography:
  display:
    fontFamily: SF Pro Rounded
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -0.01em
  h2:
    fontFamily: SF Pro Rounded
    fontSize: 18px
    fontWeight: 600
    lineHeight: 1.25
  h3:
    fontFamily: SF Pro Rounded
    fontSize: 16px
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: SF Pro Rounded
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.45
  body-sm:
    fontFamily: SF Pro Rounded
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: SF Pro Rounded
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.2
  stat:
    fontFamily: SF Pro Rounded
    fontSize: 17px
    fontWeight: 700
    lineHeight: 1.1
  caption:
    fontFamily: SF Pro Rounded
    fontSize: 11px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: 0.01em
rounded:
  sm: 10px
  md: 16px
  lg: 22px
  xl: 28px
  full: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 20px
  2xl: 28px
components:
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  banner-premium:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.on-secondary}"
    typography: "{typography.h2}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  card-action-blue:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  badge-urgency:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.stat}"
    rounded: "{rounded.sm}"
    padding: "{spacing.sm}"
  pill-segment:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 10px
  pill-segment-selected:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 10px
  chat-bubble-incoming:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  chat-bubble-outgoing:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  input-inset:
    backgroundColor: "{colors.surface-inset}"
    textColor: "{colors.text-tertiary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  nav-bar:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-secondary}"
    typography: "{typography.caption}"
    height: 76px
  nav-center-raised:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    size: 56px
---

## Overview

A candlelit, mystical premium aesthetic — "celestial lounge." The UI should
feel like a dim, warm room: deep amber-brown darkness instead of cold neutral
black, with light arriving as parchment, bronze, and a single cool blue.
Audience expects intimacy and ritual, not clinical dashboards. The emotional
register is calm confidence with moments of indulgence (bronze) and urgency
(ember orange). Decorative celestial line-art (sun rays, moon phases,
constellations) appears as low-opacity engravings inside feature banners —
ornament lives *inside* surfaces, never floating on the background.

**Imagery philosophy:** every face shown in the UI becomes a comparison
anchor, so human imagery is tightly rationed. Stylized monoline illustration
carries emotion and guidance; real photography appears only to demonstrate
*process* (capture do/don't examples); the user's own photo is the only
"hero" photograph in the product. No mascots — motion expresses competence
(scan sweeps, data reveals), never personality.

## Colors

- **Primary (#3D6BE6) "Periwinkle Blue":** the interaction color — chat
  bubbles from the counterpart, social/referral cards, the raised center nav
  action, and the "emotional" data series. The one cool note in a warm room;
  it reads as *alive/interactive* precisely because everything else is warm.
- **Secondary (#C99E6F) "Burnished Bronze":** monetization and premium
  moments only — Get Premium, Ask a Consultant. Bronze = money. Pair with
  near-black text (#2A1D10) and darker copper line-art ornament at ~20% opacity.
- **Tertiary (#EFE6D8) "Parchment Cream":** data and selection — chart bars,
  ring gauges, the selected segment pill. Cream on dark is the data-ink.
- **Accent (#F25430) "Ember Orange":** urgency and deltas only — discount
  badges (75%, +15%), progress segments. Small areas, high heat. Never a
  background for content.
- **Background (#15100B → #0E0B07):** warm near-black with a subtle vertical
  gradient. Never pure #000000 — the warmth is the identity.
- **Surfaces (#241B12 / #2E2418 / #1A140D):** three tonal steps — card,
  raised, inset. Hierarchy is built from these steps plus 1px #3A2F21 borders.
- **Text (#FFFFFF / #9A9285 / #6E6657):** white for content, warm ash for
  supporting copy, deep ash for timestamps and placeholders.

## Typography

- **One family, rounded:** SF Pro Rounded (fallback: Nunito Sans, then
  system rounded). The rounded terminals carry the soft, approachable mood;
  do not introduce a second family.
- **Display (28/600)** for the profile name and screen heroes; **H2 (18/600)**
  for card titles like "Get Premium"; **H3 (16/600)** for chat-adjacent
  headers.
- **Body (15/400)** for messages and paragraphs at 1.45 line height —
  long-form explanatory copy (forecasts, advice) must stay comfortable.
- **Stat (17/700)** for numerals in badges and counters; numbers are always
  heavier than their labels.
- **Label (13/500)** for pills and nav; **Caption (11/400)** for timestamps.
- Two weights maximum per screen (400 + 600/700). No uppercase tracking —
  this system whispers, it doesn't shout.

## Layout

Single-column mobile layout, 390px reference width. Screen gutter 20px.
Cards stack with 12px gaps; content inside cards padded 16px (feature
banners 20px). Vertical rhythm on a 4px base scale (4/8/12/16/20/28).
Bottom navigation: 5 items, 76px tall, with the center item raised as a
56px circular button breaking the bar's top edge. Status areas (counters,
notification bell) float as 36px circular chips in the top corners.
Charts and gauges live inside standard cards, never edge-to-edge.

## Elevation & Depth

Depth comes from **tonal layering, not shadows.** The dark warm background
sits lowest; cards are one tonal step lighter; pills and chips one step
above that; inputs recess one step below card level. Every surface carries
a 1px border (#3A2F21) — the border does the separating work shadows would.
The only permitted glow is a soft, large-radius ambient halo behind the
raised center nav button and the avatar ring (blur ≥ 24px, opacity ≤ 25%).
Feature banners gain richness through inset low-opacity line-art, not
elevation.

## Shapes

Soft and continuous — nothing sharp anywhere. Cards and banners use 22px
radius; bubbles, inputs, and media chips 16px; small badges 10px; pills,
nav buttons, and avatars fully rounded. Chat bubbles anchor to their
sender: three corners at 16px, the corner nearest the sender tightened to
6px. Progress bars are built from rounded segments (full-radius capsules),
not continuous fills. Ring gauges are thick donuts (stroke ≈ 22% of
diameter) with rounded line caps.

## Components

- **card** — default container: surface tone, 22px radius, 16px padding,
  1px border.
- **banner-premium** — bronze monetization banner: H2 title, caption
  subtitle, celestial line-art ornament at low opacity; whole banner is the
  tap target. Maximum one per screen.
- **card-action-blue** — referral/social action card; may host a child
  progress module and an urgency badge in its top-right.
- **badge-urgency** — ember orange chip with bold stat numeral and optional
  "+delta" suffix; 10px radius.
- **pill-segment / pill-segment-selected** — segmented control as floating
  pills; selected state inverts to parchment cream with dark text. No
  underlines or borders for selection.
- **chat-bubble-incoming / chat-bubble-outgoing** — incoming is primary
  blue, outgoing is raised surface; both 15px body, caption timestamp
  outside the bubble. Voice notes render as a waveform inside an incoming
  bubble with a circular play control.
- **input-inset** — recessed dark well, placeholder in text-tertiary,
  trailing icon button allowed.
- **nav-bar / nav-center-raised** — icon + 11px caption per item; active
  item white, inactive text-secondary; center action is a 56px blue circle
  with ambient glow, overlapping the bar.
- **Charts** — grouped bar charts use exactly the three series colors
  (primary blue, secondary bronze-tan, tertiary cream) with dot legend;
  ring gauges show a centered percentage in stat typography.
- **illustration-monoline** — the single illustration style: thin cream
  (#EFE6D8) strokes at 1.2–1.5px, no fills, features abstracted; bronze
  (#C99E6F) constellation dots with 0.6px hairline connectors at ≤ 45%
  opacity. Used for hero moments and trait glyphs. One style only — never
  mix with cartoon, 3D, or photoreal illustration.
- **scan-motif** — the signature motion element: a 2px primary-blue line
  sweeping across a monoline face contour, easing with brief pauses at
  scored features (eyes, jaw). Ship as Lottie/animated SVG; respect
  reduced-motion. One animated hero per flow, maximum.
- **silhouette-population** — featureless head-and-shoulder silhouettes for
  representing other users or populations in data contexts; fill matches
  the adjacent data series (cream in-range, raised-surface tone out of
  range). Never give silhouettes facial features.
- **capture-example** — paired do/don't photo thumbnails inside inset
  wells: same single neutral, average-looking model in both frames, cream
  "Like this" chip on the good frame, ember-orange dismiss chip on the bad
  frame. The only sanctioned use of real photography besides the user's
  own image.
- **user-photo** — the user's own captured image, shown as a circular or
  22px-radius thumbnail with a 1px border; it is the hero image on
  results and paywall surfaces and the source for avatar renders.

## Do's and Don'ts

- **Do** keep one bronze monetization banner per screen, maximum — bronze
  loses its premium signal when repeated.
- **Do** reserve blue for things the user can act on or that respond to the
  user; if it's blue, it's interactive (or it's the blue data series).
- **Do** reserve cream for data-ink and selected states; reserve orange for
  numeric urgency (discounts, deltas, live progress) at badge scale only.
- **Do** build hierarchy with the three surface steps + 1px borders;
  maintain WCAG AA (4.5:1) for all text on its surface.
- **Don't** use pure black backgrounds, cold grays, or hard drop shadows —
  warmth and tonal layering are the system's identity.
- **Don't** place celestial ornament on the page background; ornament lives
  inside banners and headers at ≤ 25% opacity.
- **Don't** mix corner radii within one stack of sibling cards, and never
  introduce sharp (< 10px) corners.
- **Don't** use more than two font weights per screen, a second font
  family, or uppercase letter-spaced labels.
- **Don't** let orange exceed badge/segment scale — it is heat, not a theme
  color.
- **Do** keep all illustration in the single monoline style; trait glyphs,
  hero contours, and ornament share one stroke weight and palette.
- **Do** use featureless silhouettes whenever depicting other people or
  populations; the user's own photo is the only hero photograph.
- **Don't** show real or AI-generated human faces on results, paywall, or
  score-adjacent surfaces — there they set comparison anchors against the
  user's own numbers, and fake "user" faces destroy trust in every score.
  Two sanctioned exceptions: one aspirational hero portrait on the welcome
  surface only (warm bronze/cream duotone grade, rim-lit jawline, on
  #15100B — never flat black-and-white), and the paired capture do/don't
  examples.
- **Don't** use mascots or character animation; limit motion to one scan
  or data-reveal moment per flow, and honor prefers-reduced-motion.
