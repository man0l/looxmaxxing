# Practice Animation Assets — Roster, Prompts & Pipeline

Plan for the 3-scene Lottie animations that visually explain the non-obvious
Practice exercises. Text-only steps like "Mewing hold" mean nothing to an end
user; each animation below turns one confusing movement into a three-scene
visual (setup → action → hold/release).

Companion change: the jargon exercise names in `src/types/practice.ts` were
renamed to plain language (see the rename table below).

## Style decision

Keyframes are generated with **gpt-image-2** in a **soft duotone illustration**
style: warm bronze (#C99E6F) and parchment cream (#EFE6D8) shading on the app
background (#15100B), with periwinkle blue (#3D6BE6) reserved for motion
arrows and guidance cues.

This is a deliberate, scoped deviation from the strict `illustration-monoline`
rule in `docs/DESIGN.md` — tutorial anatomy (tongue placement, muscle
engagement) needs shading that 1.2px strokes can't carry. It stays inside the
system's guardrails by matching the sanctioned welcome-hero "warm bronze/cream
duotone" grade, using one stylized generic figure (no photoreal, no
identity — never a comparison anchor), and keeping blue as the only cool
accent. Practice detail screens are not score-adjacent surfaces.

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

- **Model:** gpt-image-2, 1024×1024. Crop to 4:3 in-app if the player needs it.
- **Consistency:** generate Scene 1 first, then generate Scenes 2–3 in
  **image-edit mode with Scene 1 as the input reference** ("same character,
  same style, same framing — change only: …"). Every prompt below carries the
  full style block so text-only generation also works as a fallback.
- **Character rule:** one stylized adult male figure reused across all nine
  animations — simplified, generic features.
- **Review checklist per set:** same character, same framing across the three
  scenes, correct anatomy, brand palette only, no text baked into the image.

### Shared STYLE block — prepend verbatim to every prompt

> Soft duotone digital illustration in warm bronze (#C99E6F) and parchment
> cream (#EFE6D8) tones on a solid deep warm-brown background (#15100B). One
> stylized adult male figure with simplified, generic facial features — smooth
> sculptural shapes, soft airbrushed shading, gentle rim light on contours.
> Calm, premium, candlelit mood. Flat uncluttered background, subject centered
> with generous margin. No text, no labels, no watermark, no photorealism, no
> harsh outlines.

## Prompts — 3 scenes per animation

`[STYLE]` = the shared style block above.

### 1. Tongue-to-roof hold — profile cutaway

- **S1:** `[STYLE] Side-profile head in medical-illustration cutaway style: the mouth interior is visible through a softly faded cheek. The tongue rests LOW on the floor of the mouth, lips closed, jaw relaxed. Neutral resting expression.`
- **S2:** `[STYLE] Same side-profile cutaway head, same framing. Now the entire tongue is pressed FLAT against the roof of the mouth from tip to back, filling the palate. Teeth lightly together, lips closed. A thin periwinkle-blue (#3D6BE6) arrow curves upward from the tongue toward the palate.`
- **S3:** `[STYLE] Same side-profile head, cutaway fading back to a normal solid profile: tongue held on the palate, lips sealed, serene expression. Two soft periwinkle-blue airflow wisps at the nostril indicate slow nasal breathing. A faint cream glow along the jawline and under-chin suggests gentle engagement.`

### 2. Chin pull-back — profile

- **S1:** `[STYLE] Side-profile of head and shoulders standing tall. The head drifts slightly FORWARD of the shoulders (forward-head posture). A subtle vertical dashed cream line rises from the shoulder, showing the head is ahead of it. Neutral expression, gaze level.`
- **S2:** `[STYLE] Same side-profile, same framing. The chin glides STRAIGHT BACK horizontally — creating a slight intentional double-chin crease — gaze still level, not tilting up or down. A horizontal periwinkle-blue (#3D6BE6) arrow points backward at chin height.`
- **S3:** `[STYLE] Same side-profile, head now aligned: ear stacked directly over the shoulder on the vertical dashed cream line. Tall, composed posture, soft cream glow along the back of the neck indicating the hold.`

### 3. Lying neck lift — side view on mat

- **S1:** `[STYLE] Full-body side view of the figure lying flat on his back on a low exercise mat, arms relaxed at his sides, head resting on the mat, knees softly bent. Horizontal composition, viewed from directly beside him.`
- **S2:** `[STYLE] Same lying side view, same framing. The chin is tucked toward the chest and the head lifts only a few inches off the mat — shoulders stay down. A small periwinkle-blue (#3D6BE6) arc arrow traces the short lifting path of the head. Front-of-neck softly highlighted in cream.`
- **S3:** `[STYLE] Same lying side view. The head lowers back toward the mat in a slow controlled motion, chin still tucked, a periwinkle-blue arc arrow now pointing back down along the same short path. Calm, unstrained expression.`

### 4. Cheek suck-in — front face

- **S1:** `[STYLE] Front-facing head and shoulders, completely neutral relaxed face, lips gently closed, cheeks at rest.`
- **S2:** `[STYLE] Same front-facing head, same framing. Cheeks drawn INWARD against the teeth, visibly hollowed, lips slightly pursed forward. Two short periwinkle-blue (#3D6BE6) arrows point inward, one at each hollowed cheek.`
- **S3:** `[STYLE] Same front-facing head releasing back to neutral: cheeks soft and relaxed again, a faint cream glow on both cheeks indicating the just-worked muscles, expression calm with a hint of ease.`

### 5. Fingertip smile press — front face + hands

- **S1:** `[STYLE] Front-facing head with both hands raised: the fingertips of the index and middle fingers rest LIGHTLY on the highest point of each cheekbone, just below the outer eye corners. Face neutral, elbows out of frame or softly cropped.`
- **S2:** `[STYLE] Same front-facing pose, same framing. The figure smiles, cheeks pushing UP against the resting fingertips which gently resist. Two small periwinkle-blue (#3D6BE6) arrows point upward from the cheeks toward the fingertips, showing the direction of effort.`
- **S3:** `[STYLE] Same front-facing pose holding the smile against the fingertips: sustained gentle press, cheeks lifted, soft cream glow around both cheekbones indicating the isometric hold. Composed, unstrained expression.`

### 6. Closed-lip cheek lift — front face

- **S1:** `[STYLE] Front-facing head, lips closed, expression fully neutral, cheeks at rest.`
- **S2:** `[STYLE] Same front-facing head, same framing. A closed-lip smile forms and the cheeks lift UPWARD toward the eyes. Two short periwinkle-blue (#3D6BE6) arrows point up along each cheek toward the lower eyelids.`
- **S3:** `[STYLE] Same front-facing head at the top of the lift: cheeks raised high, lower eyelids softly pushed up into a slight pleasant squint, lips still closed. Cream glow across the upper cheeks marks the hold.`

### 7. Wall arm slide — three-quarter view at wall

- **S1:** `[STYLE] Three-quarter rear view of the figure standing with his back flat against a plain wall: head, upper back and hips touching it. Arms bent in a goalpost "W" shape, elbows and the backs of the hands also touching the wall. Small cream dots mark each wall-contact point (head, upper back, elbows, hands, hips).`
- **S2:** `[STYLE] Same pose at the wall, same framing. The arms slide UPWARD along the wall from the "W" toward a straight overhead "Y", elbows and hands keeping wall contact. Two periwinkle-blue (#3D6BE6) arrows trace the upward path of the hands along the wall.`
- **S3:** `[STYLE] Same pose at the wall, arms sliding back DOWN from the "Y" to the "W", contact points still marked with cream dots, periwinkle-blue arrows now pointing downward along the same path. Controlled, unhurried feel.`

### 8. Shoulder-blade squeeze — back view

- **S1:** `[STYLE] Direct back view of the figure's bare upper back and shoulders, standing tall, arms relaxed at the sides, shoulders slightly rounded forward, shoulder blades apart and at rest.`
- **S2:** `[STYLE] Same back view, same framing. The shoulder blades draw TOGETHER and slightly DOWN toward the spine; the muscles between them are softly highlighted in cream. Two periwinkle-blue (#3D6BE6) arrows converge inward-and-downward toward the spine, one from each shoulder blade.`
- **S3:** `[STYLE] Same back view holding the squeeze: shoulder blades pinned together and down, chest subtly open, warm cream glow pooled between the blades marking the hold, arms and shoulders reading soft and controlled.`

### 9. Eye smile — front face close-up

- **S1:** `[STYLE] Front-facing close-up of the face wearing a polite mouth-only smile: lips curved but the eyes uninvolved, flat and neutral — the smile does not reach the eyes.`
- **S2:** `[STYLE] Same front-facing close-up, same framing. The cheeks raise toward the eyes and a gentle squint begins to form at the lower eyelids. Two very short periwinkle-blue (#3D6BE6) arrows point up from the cheeks toward the outer eye corners.`
- **S3:** `[STYLE] Same front-facing close-up in a full genuine eye-smile: cheeks high, eyes warmly narrowed with a soft crease hinted at the outer corners, whole face radiant. A faint warm cream glow around the eyes.`

## Keyframes → Lottie pipeline

1. Generate the 27 PNGs using the Scene-1-as-reference workflow, review
   against the checklist above.
2. Convert each 3-scene set to Lottie, in order of preference:
   - **Vector rebuild (best):** trace the keyframes in After Effects/Figma and
     interpolate between poses → Bodymovin export. Smallest files, true
     vector Lottie.
   - **Image-layer Lottie (fast):** embed the 3 PNGs (downscaled to ~512px,
     base64) as Lottie image layers with a crossfade + subtle scale ease
     between scenes (~1.5s per scene, looping). Ship-able immediately,
     heavier files.
3. **File locations:**
   - Lottie: `assets/lottie/practice/<animation-slug>.json`
   - Keyframe sources: `assets/images/practice-keyframes/<slug>-s1.png` … `-s3.png`
4. **UI wiring (follow-up task, not this change):** add an optional
   `animation?: string` field to `WorkoutStep` in `src/types/practice.ts`,
   render a `lottie-react-native` player in the step rows of
   `WorkoutDetailScreen.tsx` (the chin pull-back animation is shared by the
   Jawline and Posture plans), and honor reduced-motion per `docs/DESIGN.md`.
