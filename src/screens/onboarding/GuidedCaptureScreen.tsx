import { View, Text, StyleSheet, Pressable, ScrollView, Image } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { colors, spacing, radii, typography } from '../../theme';
import {
  CameraIcon,
  GalleryIcon,
  HeadSilhouette,
  RetakeIcon,
} from '../../components/icons/OnboardingIcons';

const GOOD_EXAMPLE = require('../../../assets/images/onboarding-flow-image1-optimized.png');
const BAD_EXAMPLE = require('../../../assets/images/capture-bad-example-optimized.png');
const INSTRUCTION_VIDEO = require('../../../assets/images/onboarding-for-selfie-taking-asset.mp4');

type CaptureStep = 'front' | 'profile';

interface Props {
  step: CaptureStep;
  lightingOk: boolean;
  onCapture: () => void;
  onPickFromGallery: () => void;
  onRetake: () => void;
  onFlip: () => void;
  stepLabel?: string;
}

const GoodExample = () => (
  <View style={styles.exampleImgWrap}>
    <Image source={GOOD_EXAMPLE} style={styles.exampleImg} resizeMode="cover" />
  </View>
);

const BadExample = () => (
  <View style={styles.exampleImgWrap}>
    <Image source={BAD_EXAMPLE} style={styles.exampleImg} resizeMode="cover" />
  </View>
);

export function GuidedCaptureScreen({
  step,
  lightingOk,
  onCapture,
  onPickFromGallery,
  onRetake,
  onFlip,
  stepLabel = 'Step 5 of 6',
}: Props) {
  const isFront = step === 'front';
  const player = useVideoPlayer(INSTRUCTION_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      bounces={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.step}>{stepLabel}</Text>
      <Text style={styles.title}>
        {isFront ? 'Front photo first' : 'Now your profile'}
      </Text>
      <Text style={styles.subtitle}>
        {isFront
          ? "We'll look closely at your jawline and skin."
          : 'Side angle helps score jawline and cheekbones accurately.'}
      </Text>

      <View style={styles.examplesRow}>
        <View style={styles.exampleCard}>
          <GoodExample />
          <View style={styles.exampleLabelGood}>
            <Text style={styles.exampleLabelGoodText}>✓ Like this</Text>
          </View>
        </View>
        <View style={styles.exampleCard}>
          <BadExample />
          <View style={styles.exampleLabelBad}>
            <Text style={styles.exampleLabelBadText}>✕ Too dark</Text>
          </View>
        </View>
      </View>

      <View style={styles.instructionCard}>
        <VideoView
          player={player}
          style={styles.instructionVideo}
          contentFit="cover"
          nativeControls={false}
        />
        <View style={styles.instructionCaption}>
          <Text style={styles.instructionCaptionText}>Front, then turn to profile</Text>
        </View>
      </View>

      <View style={styles.viewport}>
        <View style={styles.alignmentOval}>
          <HeadSilhouette size={64} color={colors.textTertiary} />
        </View>
        {lightingOk && (
          <View style={styles.lightingChip}>
            <Text style={styles.lightingChipText}>✓ Lighting looks good</Text>
          </View>
        )}
      </View>

      <View style={styles.angleToggle}>
        <Text style={[styles.angleLabel, isFront && styles.angleLabelActive]}>
          ● Front
        </Text>
        <Text style={[styles.angleLabel, !isFront && styles.angleLabelActive]}>
          ○ Profile
        </Text>
      </View>

      <View style={styles.controls}>
        <Pressable onPress={onPickFromGallery} style={styles.sideBtn}>
          <GalleryIcon size={22} color={colors.textSecondary} />
        </Pressable>
        <Pressable onPress={onCapture} style={styles.captureBtn}>
          <CameraIcon size={28} color={colors.onPrimary} />
        </Pressable>
        <Pressable onPress={onRetake} style={styles.sideBtn}>
          <RetakeIcon size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <Text style={styles.privacy}>
        Photos are processed to generate your scores. Delete them anytime in
        Profile.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  step: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  title: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  examplesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.md,
  },
  exampleCard: {
    flex: 1,
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 10,
    alignItems: 'center',
  },
  exampleImgWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  exampleImg: {
    width: '100%',
    height: '100%',
  },
  exampleLabelGood: {
    marginTop: 6,
    backgroundColor: colors.tertiary,
    borderRadius: radii.full,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  exampleLabelGoodText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onTertiary,
  },
  exampleLabelBad: {
    marginTop: 6,
    backgroundColor: colors.accent,
    borderRadius: radii.full,
    paddingVertical: 3,
    paddingHorizontal: 10,
  },
  exampleLabelBadText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onAccent,
  },
  instructionCard: {
    borderRadius: radii.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructionVideo: {
    width: '100%',
    height: 170,
  },
  instructionCaption: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    backgroundColor: 'rgba(21, 16, 11, 0.72)',
    borderRadius: radii.full,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  instructionCaptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  viewport: {
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  alignmentOval: {
    width: 110,
    height: 145,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.textTertiary,
    borderRadius: 55 / 70 * 100,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.55,
  },
  lightingChip: {
    position: 'absolute',
    bottom: 10,
    backgroundColor: colors.tertiary,
    borderRadius: radii.full,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  lightingChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.onTertiary,
  },
  angleToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
    marginVertical: spacing.md,
  },
  angleLabel: {
    fontSize: 12,
    color: colors.textTertiary,
  },
  angleLabelActive: {
    color: colors.tertiary,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
  },
  captureBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideBtn: {
    padding: spacing.xs,
  },
  privacy: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 15,
  },
});
