export interface Trait {
  id: string;
  label: string;
  plan: string;
  teaseNoun: string;
}

export const TRAITS: Trait[] = [
  { id: 'jawline', label: 'Jawline', plan: 'Jawline workout', teaseNoun: 'jawline' },
  { id: 'cheekbones', label: 'Cheekbones', plan: 'Cheekbones workout', teaseNoun: 'cheekbones' },
  { id: 'skin', label: 'Skin', plan: 'Skin routine', teaseNoun: 'skin' },
  { id: 'hair', label: 'Hair', plan: 'Hair routine', teaseNoun: 'hair' },
  { id: 'masculinity', label: 'Masculinity', plan: 'Posture workout', teaseNoun: 'presence' },
  { id: 'smile', label: 'Smile', plan: 'Smile workout', teaseNoun: 'smile' },
  { id: 'eyes', label: 'Eyes', plan: 'Eyes routine', teaseNoun: 'eye area' },
];

export interface TraitScore {
  traitId: string;
  percentile: number;
}

export type PlanId = 'weekly' | 'annual';
