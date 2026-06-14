import type { TraitScore } from './traits';

export interface Scan {
  id: string;
  date: string;
  scores: TraitScore[];
}
