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

export function topPercentLabel(percentile: number): string {
  return `Top ${Math.max(1, 100 - percentile)}%`;
}

export function scoreLabel(percentile: number): string {
  return (percentile / 10).toFixed(1);
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
