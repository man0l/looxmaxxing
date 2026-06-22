import { TRAITS } from './traits';

export interface AvatarPreview {
  traitId: string;
  headline: string;
  blurb: string;
  styles: string[];
  plan: string;
}

const PLAN = (traitId: string) => TRAITS.find((t) => t.id === traitId)?.plan ?? 'plan';

export const AVATAR_PREVIEWS: AvatarPreview[] = [
  {
    traitId: 'jawline',
    headline: 'A sharper jawline',
    blurb: 'See a leaner, more defined jaw and neckline as your plan takes hold.',
    styles: ['Defined', 'Chiselled', 'Lean'],
    plan: PLAN('jawline'),
  },
  {
    traitId: 'cheekbones',
    headline: 'Lifted cheekbones',
    blurb: 'Preview a more sculpted mid-face with higher, fuller cheekbones.',
    styles: ['Sculpted', 'Lifted', 'Hollowed'],
    plan: PLAN('cheekbones'),
  },
  {
    traitId: 'skin',
    headline: 'Clearer skin',
    blurb: 'Picture an even tone and smoother texture once the routine sticks.',
    styles: ['Even tone', 'Smooth', 'Glow'],
    plan: PLAN('skin'),
  },
  {
    traitId: 'hair',
    headline: 'A fresh cut',
    blurb: 'Try on a few looks that suit your face shape.',
    styles: ['Fade', 'Buzz cut', 'Crew cut'],
    plan: PLAN('hair'),
  },
  {
    traitId: 'masculinity',
    headline: 'Stronger presence',
    blurb: 'See how upright posture changes the way your face and frame read.',
    styles: ['Upright', 'Broader frame'],
    plan: PLAN('masculinity'),
  },
  {
    traitId: 'smile',
    headline: 'A confident smile',
    blurb: 'Preview a brighter, more relaxed smile.',
    styles: ['Brighter', 'Relaxed', 'Aligned'],
    plan: PLAN('smile'),
  },
  {
    traitId: 'eyes',
    headline: 'Brighter eyes',
    blurb: 'Picture a more rested, defined eye area.',
    styles: ['Rested', 'Defined', 'Open'],
    plan: PLAN('eyes'),
  },
];

export const getAvatarPreview = (traitId: string): AvatarPreview | undefined =>
  AVATAR_PREVIEWS.find((a) => a.traitId === traitId);
