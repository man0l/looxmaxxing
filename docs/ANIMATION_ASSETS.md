# Practice Animation Assets — Roster, Prompts & Pipeline

Plan for the 3-scene Lottie animations that visually explain the non-obvious
Practice exercises. Text-only steps like "Mewing hold" mean nothing to an end
user; each animation below turns one confusing movement into a three-scene
visual (setup → action → hold/release).

Companion change: the jargon exercise names in `src/types/practice.ts` were
renamed to plain language (see the rename table below).

## Style decision (locked)

Keyframes are generated with **gpt-image-2** in a **flat textured risograph**
style: simple rounded flat shapes in warm bronze (#C99E6F) and parchment cream
(#EFE6D8) with a soft paper-grain print texture, warm-brown (#2E2418) accent
shapes, on the app background (#15100B). Periwinkle blue (#3D6BE6) is reserved
for motion arrows and guidance cues, matching the app's "blue = guidance"
rule. No gradients, no outlines, no photorealism.

This style was chosen by the owner over three alternatives that were sampled
(realistic duotone — rejected as uncanny; monoline line-art; clay 3D; flat
warm vector; abstract paper-cut). It is a scoped deviation from the strict
`illustration-monoline` rule in `docs/DESIGN.md`, kept inside the system's
guardrails: brand palette only, one stylized recurring figure (no photoreal,
no identity — never a comparison anchor), blue as the only cool accent.
Practice detail screens are not score-adjacent surfaces.

**Character (locked):** one recurring stylized figure across ALL animations —
a **clean-shaven young man with short dark curly hair, NO beard, no facial
hair**, simplified features. His canonical portrait is the committed
character reference:

> `assets/images/practice-keyframes/character-reference.png`

Every scene is generated FROM this reference (or from that animation's own
scene 1) via gpt-image-2 image-edit mode — never from a text prompt alone —
so the same person appears in every exercise.

## Animation roster — 9 animations covering 10 steps

| # | Animation slug | Covers step(s) | Plan | Why it needs an animation |
|---|----------------|----------------|------|---------------------------|
| 1 | `tongue-to-roof-hold` | Tongue-to-roof hold (mewing) | Jawline | Invisible internal action; needs a cutaway view |
| 2 | `chin-pull-back` | Chin pull-backs + Standing chin pull-backs (same movement) | Jawline + Posture | Direction is counter-intuitive ("make a double chin") |
| 3 | `lying-neck-lift` | Lying neck lifts | Jawline | Body position and range unclear from text |
| 4 | `cheek-suck-in` | Cheek suck-ins | Cheekbones | Internal cheek action |
| 5 | `fingertip-smile-press` | Fingertip smile press | Cheekbones | Finger placement + resistance concept |
| 6 | `closed-lip-cheek-lift` | Cheek lifts | Cheekbones | "Lift cheeks toward eyes" is abstract |
| 7 | `wall-arm-slide` | Wall arm slides | Posture | Multi-contact-point setup |
| 8 | `shoulder-blade-squeeze` | Shoulder-blade squeezes | Posture | Movement invisible from the user's own viewpoint |
| 9 | `eye-smile` | Eye-smile raises | Smile | "Smile with your eyes" is abstract |

**Excluded (self-explanatory, no animation):** Jaw clenches, Wide smile
holds, Lip stretches, Hip flexor stretch, and every skin/hair/eyes routine
task (cleanse, moisturize, SPF, scalp massage, cold compress, eye cream).

## Rename table (applied to `src/types/practice.ts`)

| Old (jargon) | New (plain language) |
|--------------|----------------------|
| Mewing hold | Tongue-to-roof hold |
| Chin tucks | Chin pull-backs |
| Neck curls | Lying neck lifts |
| Buccinator pulls | Cheek suck-ins |
| Smile press | Fingertip smile press |
| Chin retraction | Standing chin pull-backs |
| Wall angels | Wall arm slides |
| Scapular squeezes | Shoulder-blade squeezes |
| Cheek raises | Eye-smile raises |

## Image generation workflow

- **Model:** gpt-image-2, 1024×1024 (crop to 4:3 in-app if the player needs it).
- **Every call is an image edit** (`/v1/images/edits`), never a plain text
  generation:
  1. **Scene 1** of each animation = edit with
     `character-reference.png` as the input image and that animation's S1
     prompt. This carries the character and style into the new pose/framing.
  2. **Scenes 2 and 3** = edits with that animation's **own generated S1**
     as the input image and the S2/S3 prompt. This locks framing and pose
     continuity within the set.
- **Beard guard:** the model tends to add facial hair on profile views —
  every prompt pins "clean-shaven, NO beard, no facial hair". Reject any
  output that grows a beard and re-roll.
- **Review checklist per set:** same clean-shaven character as the reference,
  same framing across the three scenes, movement reads at a glance, brand
  palette only, grain texture present, no text baked into the image.

### Shared blocks

**[STYLE]** — include in every scene-1 prompt:

> Flat minimal illustration with a subtle risograph print feel: simple
> rounded shapes in flat warm bronze (#C99E6F) and parchment cream (#EFE6D8)
> with a soft paper-grain texture inside the shapes, slight ink-print
> imperfection at edges, warm-brown (#2E2418) accent shapes, on a solid deep
> warm-brown background (#15100B). Cozy, editorial, hand-printed warmth, no
> gradients, no outlines. No text, no labels, no watermark. Subject centered
> with generous margin.

**[CHARACTER]** — include in every scene-1 prompt:

> Use the SAME character and the SAME flat risograph illustration style as
> the reference image: the same clean-shaven young man with short dark curly
> hair, NO beard, no facial hair, simplified features, same paper-grain
> texture, same warm bronze and parchment-cream palette, same deep warm-brown
> background.

**[KEEP]** — opens every scene-2 and scene-3 prompt:

> Keep the exact same clean-shaven character (NO beard, no facial hair),
> same flat risograph style, paper-grain texture, color palette, framing and
> background as the reference image.

## Prompts — 3 scenes per animation

### 1. Tongue-to-roof hold — profile cutaway (verified)

- **S1** (edit from character-reference): `[CHARACTER] [STYLE] Now show him in SIDE PROFILE facing left, head and shoulders, calm closed eyes, lips closed. His cheek area has a simple flat cutaway view of the mouth interior: the tongue rests LOW on the floor of the mouth as a soft bronze rounded shape, with empty dark space above it under the curved roof of the mouth (palate).`
- **S2** (edit from S1): `[KEEP] Including the flat cutaway view of the mouth. Change only the tongue position: the tongue is now RAISED UP and pressed flat against the curved roof of the mouth (palate), its whole upper surface touching from just behind the front teeth to the back. Below the raised tongue there is now a clearly visible EMPTY dark gap where it used to rest. Three short thick periwinkle-blue (#3D6BE6) arrows point straight upward from the empty gap toward the raised tongue. Lips stay closed.`
- **S3** (edit from S1): `[KEEP] Change: the cutaway view is gone - now a normal solid side profile with lips sealed and a serene expression. Two soft periwinkle-blue (#3D6BE6) wavy airflow wisps at the nostril indicate slow nasal breathing. A subtle parchment-cream highlight along the jawline suggests gentle engagement.`

### 2. Chin pull-back — profile

- **S1** (edit from character-reference): `[CHARACTER] [STYLE] Now show him in SIDE PROFILE facing left, head and shoulders, wearing a simple bronze crew-neck shirt, standing tall. His head drifts slightly FORWARD of his shoulders (forward-head posture). A subtle vertical dashed parchment-cream line rises from the shoulder, showing the head is ahead of it. Neutral expression, gaze level, calm closed eyes.`
- **S2** (edit from S1): `[KEEP] Change only the head position: the chin glides STRAIGHT BACK horizontally - creating a slight intentional double-chin crease - gaze still level, not tilting up or down. A thick horizontal periwinkle-blue (#3D6BE6) arrow points backward at chin height. The dashed cream line stays in place.`
- **S3** (edit from S1): `[KEEP] Change only the head position: the head is now fully aligned - the ear stacked directly over the shoulder on the vertical dashed cream line. Tall, composed posture, no arrow, a soft parchment-cream highlight along the back of the neck indicating the hold.`

### 3. Lying neck lift — side view on mat

- **S1** (edit from character-reference): `[CHARACTER] [STYLE] Now show him as a FULL-BODY side view, lying flat on his back on a low warm-brown exercise mat, wearing a simple bronze t-shirt, arms relaxed at his sides, head resting on the mat, knees softly bent. Horizontal composition, viewed from directly beside him.`
- **S2** (edit from S1): `[KEEP] Change only the head: the chin is tucked toward the chest and the head lifts only a few inches off the mat - shoulders stay down on the mat. A small periwinkle-blue (#3D6BE6) arc arrow traces the short lifting path of the head. The front of the neck gets a subtle parchment-cream highlight.`
- **S3** (edit from S1): `[KEEP] Change only the head: the head is lowering back toward the mat in a slow controlled motion, chin still tucked, hovering just above the mat, with a periwinkle-blue (#3D6BE6) arc arrow pointing back down along the same short path. Calm, unstrained expression.`

### 4. Cheek suck-in — front face

Note: the committed `character-reference.png` already depicts this
animation's scene 2 (cheeks hollowed + inward arrows). Reuse it directly as
S2, or re-roll it with the S2 prompt below if a fresh take is needed.

- **S1** (edit from character-reference): `[KEEP] Change only the face: the cheeks are fully RELAXED back to neutral - no hollowing, no pursed lips, mouth softly closed, completely calm resting face. Remove the blue arrows.`
- **S2** (edit from S1): `[KEEP] Change only the face: the cheeks are sucked INWARD against the teeth so both cheeks are visibly hollowed, lips slightly pursed forward. One short thick periwinkle-blue (#3D6BE6) arrow on each side points inward toward the hollow of each cheek.`
- **S3** (edit from S1): `[KEEP] Change only the face: the cheeks are releasing back to a soft neutral, with a faint parchment-cream glow on both cheeks indicating the just-worked muscles, expression calm with a hint of ease. No arrows.`

### 5. Fingertip smile press — front face + hands

- **S1** (edit from character-reference): `[CHARACTER] [STYLE] Front-facing head with both hands raised: the fingertips of the index and middle fingers rest LIGHTLY on the highest point of each cheekbone, just below the outer eye corners. Face neutral, calm closed eyes, forearms simple flat bronze shapes rising from the bottom of the frame.`
- **S2** (edit from S1): `[KEEP] Change only the expression: he smiles, cheeks pushing UP against the resting fingertips which gently resist. One small periwinkle-blue (#3D6BE6) arrow on each cheek points upward from the cheek toward the fingertips, showing the direction of effort.`
- **S3** (edit from S1): `[KEEP] Change only the expression: he holds the smile against the fingertips - sustained gentle press, cheeks lifted, a soft parchment-cream glow around both cheekbones indicating the isometric hold. No arrows. Composed, unstrained expression.`

### 6. Closed-lip cheek lift — front face

- **S1** (edit from character-reference): `[KEEP] Change only the face: completely neutral resting expression, lips closed, cheeks at rest, no hollowing, no arrows.`
- **S2** (edit from S1): `[KEEP] Change only the face: a closed-lip smile forms and the cheeks lift UPWARD toward the eyes. One short periwinkle-blue (#3D6BE6) arrow on each cheek points up toward the lower eyelid.`
- **S3** (edit from S1): `[KEEP] Change only the face: the lift is held at the top - cheeks raised high, lower eyelids softly pushed up into a slight pleasant squint, lips still closed. A parchment-cream glow across the upper cheeks marks the hold. No arrows.`

### 7. Wall arm slide — three-quarter view at wall

- **S1** (edit from character-reference): `[CHARACTER] [STYLE] Now show him as a FULL-BODY three-quarter rear view, wearing a simple bronze t-shirt and warm-brown shorts, standing with his back flat against a plain slightly-lighter warm-brown wall: head, upper back and hips touching it. Arms bent in a goalpost "W" shape, elbows and the backs of the hands also touching the wall. Small parchment-cream dots mark each wall-contact point (head, upper back, elbows, hands, hips).`
- **S2** (edit from S1): `[KEEP] Change only the arms: they slide UPWARD along the wall from the "W" toward a straight overhead "Y", elbows and hands keeping wall contact, contact dots still visible. One periwinkle-blue (#3D6BE6) arrow beside each hand traces the upward path along the wall.`
- **S3** (edit from S1): `[KEEP] Change only the arms: they slide back DOWN from the overhead "Y" to the "W" goalpost shape, contact dots still visible, with the periwinkle-blue (#3D6BE6) arrows now pointing downward along the same path. Controlled, unhurried feel.`

### 8. Shoulder-blade squeeze — back view

- **S1** (edit from character-reference): `[CHARACTER] [STYLE] Now show him as a DIRECT BACK VIEW of the bare upper back, shoulders and back of the head, standing tall, arms relaxed at the sides, shoulders slightly rounded forward, shoulder blades apart and at rest, drawn as soft flat bronze shapes on the cream back.`
- **S2** (edit from S1): `[KEEP] Change only the shoulders: the shoulder blades draw TOGETHER and slightly DOWN toward the spine; the area between them gets a parchment-cream highlight. One thick periwinkle-blue (#3D6BE6) arrow from each shoulder blade converges inward-and-downward toward the spine.`
- **S3** (edit from S1): `[KEEP] Change only the shoulders: the squeeze is held - shoulder blades pinned together and down, chest subtly open, a warm parchment-cream glow pooled between the blades marking the hold. No arrows. Arms soft and controlled.`

### 9. Eye smile — front face close-up

- **S1** (edit from character-reference): `[CHARACTER] [STYLE] Front-facing CLOSE-UP of the face wearing a polite mouth-only smile: lips curved but the eyes open, flat and uninvolved - the smile does not reach the eyes.`
- **S2** (edit from S1): `[KEEP] Change only the face: the cheeks raise toward the eyes and a gentle squint begins to form at the lower eyelids. One very short periwinkle-blue (#3D6BE6) arrow on each cheek points up toward the outer eye corner.`
- **S3** (edit from S1): `[KEEP] Change only the face: a full genuine eye-smile - cheeks high, eyes warmly narrowed with a soft crease hinted at the outer corners, whole face radiant. A faint parchment-cream glow around the eyes. No arrows.`

## Keyframes → Lottie pipeline

1. Generate the 27 PNGs using the edit-reference workflow above, review
   against the checklist (character match, no beard, movement legibility).
2. Convert each 3-scene set to Lottie, in order of preference:
   - **Vector rebuild (best):** trace the flat shapes in After Effects/Figma
     and interpolate between poses → Bodymovin export; re-apply the paper
     grain as a single static texture overlay layer so the shape layers stay
     pure vector. Smallest files.
   - **Image-layer Lottie (fast):** embed the 3 PNGs (downscaled to ~512px,
     base64) as Lottie image layers with a crossfade + subtle scale ease
     between scenes (~1.5s per scene, looping). Ship-able immediately,
     heavier files.
3. **File locations:**
   - Character reference: `assets/images/practice-keyframes/character-reference.png`
   - Keyframe sources: `assets/images/practice-keyframes/<slug>-s1.png` … `-s3.png`
   - Lottie: `assets/lottie/practice/<animation-slug>.json`
4. **UI wiring (follow-up task, not this change):** add an optional
   `animation?: string` field to `WorkoutStep` in `src/types/practice.ts`,
   render a `lottie-react-native` player in the step rows of
   `WorkoutDetailScreen.tsx` (the chin pull-back animation is shared by the
   Jawline and Posture plans), and honor reduced-motion per `docs/DESIGN.md`.
