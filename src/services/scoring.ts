import { TRAITS, type TraitScore } from '../types/traits';

const MOCK_PERCENTILES: Record<string, number> = {
  jawline: 61,
  cheekbones: 47,
  skin: 38,
  hair: 72,
  masculinity: 55,
  smile: 64,
  eyes: 51,
};

export function getScores(): TraitScore[] {
  return TRAITS.map((t) => ({ traitId: t.id, percentile: MOCK_PERCENTILES[t.id] ?? 50 }));
}

export function orderByConcerns(scores: TraitScore[], concerns: string[]): TraitScore[] {
  const concernSet = new Set(concerns);
  return [
    ...scores.filter((s) => concernSet.has(s.traitId)),
    ...scores.filter((s) => !concernSet.has(s.traitId)),
  ];
}

/** Fixed share-card order — structure first, never concern-personalized. */
export const SHARE_TRAIT_ORDER = [
  'jawline',
  'cheekbones',
  'masculinity',
  'skin',
  'hair',
  'smile',
  'eyes',
] as const;

export function orderForShare(scores: TraitScore[]): TraitScore[] {
  const byId = new Map(scores.map((s) => [s.traitId, s]));
  const ordered: TraitScore[] = [];
  for (const id of SHARE_TRAIT_ORDER) {
    const s = byId.get(id);
    if (s) ordered.push(s);
  }
  for (const s of scores) {
    if (!ordered.some((o) => o.traitId === s.traitId)) ordered.push(s);
  }
  return ordered;
}

export function scoreLabel(percentile: number): string {
  return (percentile / 10).toFixed(1);
}

/**
 * Primary user-facing metric: the trait's own 0-10 score.
 *
 * This replaced a "Top X% of men" ranking label. App Review rejected 1.0 under
 * guideline 1.1.1 for content "likely to humiliate" — ranking a user's face
 * against other people is what triggered it. Scores are presented as a personal
 * baseline to track over time, never as a position relative to anyone else.
 * Nothing in the UI may reintroduce an interpersonal comparison.
 */
export function scoreOutOfTen(percentile: number): string {
  return `${scoreLabel(percentile)} / 10`;
}

/** Descriptive, self-referential band. Never a rank, never a verdict. */
export function bandLabel(percentile: number): string {
  if (percentile < 40) return 'Focus area';
  if (percentile < 60) return 'Developing';
  if (percentile < 80) return 'Solid';
  return 'Strong';
}

export function improveScores(prev: TraitScore[]): TraitScore[] {
  return prev.map((s, i) => ({
    traitId: s.traitId,
    percentile: Math.min(98, s.percentile + 3 + ((i * 2 + s.percentile) % 5)),
  }));
}

export function deltaLabel(beforePercentile: number, afterPercentile: number): string {
  const diff = (afterPercentile - beforePercentile) / 10;
  if (diff === 0) return 'No change';
  return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}`;
}
