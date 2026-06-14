@AGENTS.md

# LooxMaxxing — Claude Code Guidelines

## App overview

LooxMaxxing is an iOS face rating & self-improvement app built with **Expo (React Native + TypeScript)**. The full PRD lives at `docs/PRD.md` and the design system ("Celestial Ember") at `docs/DESIGN.md`. Read both before writing any UI code.

## Before writing code

1. Read `docs/DESIGN.md` for the exact design tokens (colors, typography, spacing, radii, components). Every color, font size, border radius, and padding value is specified there — do not guess.
2. Read `docs/PRD.md` for the feature spec, funnel flow, and screen-by-screen requirements.
3. Check Expo docs at `https://docs.expo.dev/versions/v56.0.0/` for API availability before choosing packages.

## Design system — Celestial Ember

This is a **warm candlelit dark UI**. Critical rules:

- **Background:** `#15100B` (never pure `#000000`)
- **Surfaces:** three tonal steps — `#241B12` (card), `#2E2418` (raised), `#1A140D` (inset)
- **Primary blue `#3D6BE6`:** interaction only — if it's blue, it's interactive
- **Bronze `#C99E6F`:** monetization/premium only, max one per screen
- **Parchment cream `#EFE6D8`:** data ink and selected states
- **Ember orange `#F25430`:** urgency badges only, never large areas
- **Font:** SF Pro Rounded (one family, weights 400 + 600/700 max two per screen)
- **Corners:** soft everywhere — cards 22px, inputs 16px, badges 10px, pills full round
- **No shadows** — depth via tonal steps + 1px `#3A2F21` borders
- **No pure black, no cold grays, no hard drop shadows**

## Implementation rules

- **TypeScript only.** No `.js` files.
- **No comments in code** unless explicitly asked.
- **Use the theme tokens** from `src/theme/` — never hardcode colors, spacing, or font values.
- **Component names** must match the design system: `Card`, `BannerPremium`, `PillSegment`, `BadgeUrgency`, `InputInset`, `NavBar`, etc.
- **Never build excluded features:** no community feed, no push notifications, no free scan tier.
- **Respect guardrails:** age 17+ gate, user-selected concerns only, percentile framing, no verdict/shame copy.
- **iOS first** — test and optimize for iOS before Android.

## Lint and typecheck

Run these after making changes:
```
npx tsc --noEmit
npx expo lint
```

## Project structure

```
src/
├── components/     # Reusable UI (Card, RingGauge, BadgeUrgency, etc.)
├── screens/        # Onboarding, Results, Practice, Avatars, Ratings, Profile
├── navigation/     # 5-tab navigator config
├── theme/          # Design tokens exported as constants
├── hooks/          # Custom hooks
├── services/       # API, subscription, camera
├── store/          # State management
└── types/          # TypeScript interfaces
```

## Feature build order (follow this)

1. **Theme setup** — export all design tokens from `src/theme/`
2. **Navigation** — 5 fixed tabs + floating capture FAB
3. **Onboarding** — age gate → welcome → concerns → depth question → expectation framing → guided capture → paywall
4. **Results** — trait grid with ring gauges, percentile framing, re-scan countdown
5. **Paywall** — blurred results with personalized tease, weekly/annual plans
6. **Profile** — streak heatmap, methodology, settings
7. **Practice** — workouts + daily routines mapped to traits
8. **Streaks** — contribution graph, milestone states, share cards
9. **Ratings** — personal history, before/after comparison
10. **Avatars** — "Preview your potential" trait-linked renders

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |
