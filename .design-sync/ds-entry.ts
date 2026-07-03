export { RingGauge } from '../src/components/RingGauge';
export { TraitGrid } from '../src/components/TraitGrid';
export { BlurredTraitGrid } from '../src/components/BlurredTraitGrid';
export { ScoreTimeline } from '../src/components/ScoreTimeline';
export type { TimelinePoint } from '../src/components/ScoreTimeline';
export { StreakHeatmap } from '../src/components/StreakHeatmap';
export { AvatarRender } from '../src/components/AvatarRender';
export { CaptureFab } from '../src/components/CaptureFab';
export { Toast } from '../src/components/Toast';
export type { ToastVariant, ToastData } from '../src/components/Toast';
export { StreakShareCard, ScoreShareCard } from '../src/components/share/ShareCards';
export { ShareSheet } from '../src/components/share/ShareSheet';

export { ShareIcon, CompareIcon } from '../src/components/icons/ActionIcons';
export {
  ResultsIcon,
  PracticeIcon,
  AvatarsIcon,
  RatingsIcon,
  ProfileIcon,
} from '../src/components/icons/NavIcons';
export {
  JawlineGlyph,
  CheekbonesGlyph,
  SkinGlyph,
  HairGlyph,
  MasculinityGlyph,
  SmileGlyph,
  EyesGlyph,
  ConcernGlyph,
  GalleryIcon,
  CameraIcon,
  RetakeIcon,
  HeadSilhouette,
} from '../src/components/icons/OnboardingIcons';
export {
  InstagramIcon,
  XIcon,
  WhatsAppIcon,
  TikTokIcon,
  MoreIcon,
} from '../src/components/icons/SocialIcons';

export { colors, typography, spacing, radii, components } from '../src/theme';
export type {
  ColorToken,
  TypographyToken,
  SpacingToken,
  RadiusToken,
  ComponentToken,
} from '../src/theme';

export { TRAITS } from '../src/types/traits';
export type { Trait, TraitScore, PlanId } from '../src/types/traits';
export {
  getScores,
  orderByConcerns,
  topPercentLabel,
  scoreLabel,
  improveScores,
  deltaLabel,
} from '../src/services/scoring';
export {
  MILESTONES,
  dateKey,
  seedHistory,
  levelFor,
  currentStreakDay,
  longestStreak,
  reachedMilestone,
  nextMilestone,
  buildHeatmap,
} from '../src/services/streak';

export { ToastProvider, useToast } from '../src/store/ToastContext';
export { SafeAreaProvider } from 'react-native-safe-area-context';
