export type PlanType = 'workout' | 'routine';

export interface WorkoutStep {
  name: string;
  detail: string;
  duration: string;
}

export interface PlanItem {
  traitId: string;
  title: string;
  type: PlanType;
  blurb: string;
  steps?: WorkoutStep[];
  amTasks?: string[];
  pmTasks?: string[];
}

export const workoutSessionId = (traitId: string) => `${traitId}:session`;
export const routineTaskId = (traitId: string, period: 'am' | 'pm', index: number) =>
  `${traitId}:${period}:${index}`;

export const PRACTICE_PLAN: PlanItem[] = [
  {
    traitId: 'jawline',
    title: 'Jawline workout',
    type: 'workout',
    blurb: 'A short daily session to tone the muscles along your jaw and neckline.',
    steps: [
      { name: 'Mewing hold', detail: 'Rest your whole tongue on the roof of your mouth, teeth lightly together. Hold and breathe through your nose.', duration: '2 min' },
      { name: 'Chin tucks', detail: 'Pull your chin straight back to make a "double chin", hold, release. Keep your gaze level.', duration: '10 reps' },
      { name: 'Jaw clenches', detail: 'Bite down firmly, hold the squeeze, then relax fully.', duration: '12 reps' },
      { name: 'Neck curls', detail: 'Lying down, tuck your chin and lift your head a few inches. Slow and controlled.', duration: '10 reps' },
    ],
  },
  {
    traitId: 'cheekbones',
    title: 'Cheekbones workout',
    type: 'workout',
    blurb: 'Targeted face exercises to lift and define the mid-face.',
    steps: [
      { name: 'Cheek lifts', detail: 'Smile without showing teeth, then lift your cheeks toward your eyes. Hold at the top.', duration: '12 reps' },
      { name: 'Buccinator pulls', detail: 'Suck your cheeks in against your teeth, hold, release.', duration: '10 reps' },
      { name: 'Smile press', detail: 'Press fingertips lightly on the cheekbones and smile against the resistance.', duration: '2 min' },
    ],
  },
  {
    traitId: 'masculinity',
    title: 'Posture workout',
    type: 'workout',
    blurb: 'Posture sets your jaw, neck and presence. A few resets a day go a long way.',
    steps: [
      { name: 'Chin retraction', detail: 'Stand tall, draw your head back over your shoulders. Hold.', duration: '10 reps' },
      { name: 'Wall angels', detail: 'Back to a wall, slide your arms up and down keeping contact.', duration: '10 reps' },
      { name: 'Scapular squeezes', detail: 'Pull your shoulder blades together and down. Hold.', duration: '12 reps' },
      { name: 'Hip flexor stretch', detail: 'Half-kneel and press the hips forward to open the front of the hip.', duration: '30s / side' },
    ],
  },
  {
    traitId: 'smile',
    title: 'Smile workout',
    type: 'workout',
    blurb: 'Build an easy, confident smile and the muscles that support it.',
    steps: [
      { name: 'Wide smile holds', detail: 'Smile as wide as is comfortable, hold, release slowly.', duration: '12 reps' },
      { name: 'Lip stretches', detail: 'Pucker, then stretch into a smile. Move between the two.', duration: '10 reps' },
      { name: 'Cheek raises', detail: 'Smile with your eyes — raise the cheeks and soften the gaze.', duration: '2 min' },
    ],
  },
  {
    traitId: 'skin',
    title: 'Skin routine',
    type: 'routine',
    blurb: 'Consistency beats intensity. Keep it simple morning and night.',
    amTasks: ['Cleanse with a gentle face wash', 'Apply a light moisturizer', 'Finish with SPF 30+'],
    pmTasks: ['Cleanse off the day', 'Apply your treatment (retinoid or exfoliant)', 'Moisturize'],
  },
  {
    traitId: 'hair',
    title: 'Hair routine',
    type: 'routine',
    blurb: 'Healthy scalp, healthy hair. Small daily habits compound.',
    amTasks: ['1-minute scalp massage', 'Style with a lightweight product'],
    pmTasks: ['Wash or rinse (alternate days)', 'Apply scalp serum to damp roots'],
  },
  {
    traitId: 'eyes',
    title: 'Eyes routine',
    type: 'routine',
    blurb: 'The eye area shows rest and care first. Protect and hydrate it.',
    amTasks: ['10-second cold compress to de-puff', 'Eye cream, then SPF around the orbital bone'],
    pmTasks: ['Apply eye cream', 'Set a wind-down time to protect sleep'],
  },
];

export function getPlanItem(traitId: string): PlanItem | undefined {
  return PRACTICE_PLAN.find((p) => p.traitId === traitId);
}

export function taskIdsForItem(item: PlanItem): string[] {
  if (item.type === 'workout') return [workoutSessionId(item.traitId)];
  const am = (item.amTasks ?? []).map((_, i) => routineTaskId(item.traitId, 'am', i));
  const pm = (item.pmTasks ?? []).map((_, i) => routineTaskId(item.traitId, 'pm', i));
  return [...am, ...pm];
}
