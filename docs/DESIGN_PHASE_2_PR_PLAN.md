# Design Phase 2 — Signature data

**Branch:** `feat/design-phase-2-signature-data`  
**Base:** `master` (Phase 1 merged)  
**Goal:** Results and gauges feel like the product’s signature object — not a flat score list.

## In scope

1. **Thick animated `RingGauge`** — stroke ~20% of diameter, cream draw-in, soft radial wash + ambient halo; reduce-motion skips animation.
2. **Results hero** — overall ring + “Top X% of men” + optional delta + user photo; streak demoted to compact chip; share stays top-right.
3. **Staggered trait reveal** — featured then rest, with matching ring delay.

## Out of scope (Phase 3+)

Scan motif Lottie, Day Complete ceremony, streak-as-fire, Practice micro-delight, paywall metal treatment.

## Success criteria

- [x] Rings read as thick donuts (DESIGN.md ~22% stroke)
- [x] Draw-in on Results / Trait detail; static when obscured (paywall blur)
- [x] Results has one visual peak (overall hero) before concern cards
- [x] tsc + lint clean
