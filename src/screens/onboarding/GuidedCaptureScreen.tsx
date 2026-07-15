import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Platform } from 'react-native';
import { CameraView, type CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { isE2E } from '../../config/e2e';
import { resolveDevTestPhotoUri } from '../../services/photoUri';
import { useLightingOk } from '../../hooks/useLightingOk';
import { colors, spacing, radii, typography } from '../../theme';
import { OnboardingProgressBar } from '../../components/OnboardingProgressBar';
import { CameraIcon, GalleryIcon, HeadSilhouette, RetakeIcon } from '../../components/icons/OnboardingIcons';

const FRONT_GOOD_EXAMPLE = require('../../../assets/images/onboarding-flow-image1-optimized.png');
const FRONT_BAD_EXAMPLE = require('../../../assets/images/capture-bad-example-optimized.png');
const PROFILE_GOOD_EXAMPLE = require('../../../assets/images/onboarding-profile-example-optimized.png');
const PROFILE_BAD_EXAMPLE = require('../../../assets/images/profile-bad-example-optimized.png');


type CaptureStep = 'front' | 'profile';

interface Props {
  step: CaptureStep;
  onCapture: (uri: string) => void;
  stepLabel?: string;
  onboardingStep?: number;
}

export function GuidedCaptureScreen({
  step,
  onCapture,
  stepLabel,
  onboardingStep,
}: Props) {
  const isFront = step === 'front';
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [busy, setBusy] = useState(false);
  const granted = permission?.granted ?? false;
  // Live ambient-light sensor. Returns true/false once a reading is available,
  // or null when no sensor exists (web, no light sensor, etc.) — in that case
  // we just don't render the chip.
  const lightingLive = useLightingOk(granted);

  const handleCapture = async () => {
    if (!granted) {
      requestPermission();
      return;
    }
    if (!cameraRef.current || busy) return;
    setBusy(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      if (photo?.uri) onCapture(photo.uri);
    } finally {
      setBusy(false);
    }
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) onCapture(result.assets[0].uri);
  };

  const toggleFacing = () => setFacing((f) => (f === 'front' ? 'back' : 'front'));

  const handleE2ePhoto = async () => {
    const uri = await resolveDevTestPhotoUri(isFront ? 'front' : 'profile');
    onCapture(uri);
  };

  const showE2eCapture = (isE2E && Platform.OS === 'web') || __DEV__;
  const goodExample = isFront ? FRONT_GOOD_EXAMPLE : PROFILE_GOOD_EXAMPLE;
  const badExample = isFront ? FRONT_BAD_EXAMPLE : PROFILE_BAD_EXAMPLE;

  return (
    <View style={styles.container}>
      {onboardingStep != null && <OnboardingProgressBar current={onboardingStep} />}
      {!onboardingStep && stepLabel ? <Text style={styles.step}>{stepLabel}</Text> : null}
      <Text style={styles.title}>{isFront ? 'Front photo first' : 'Now your profile'}</Text>
      <Text style={styles.subtitle}>
        {isFront
          ? 'Face the camera, fill the oval, even lighting.'
          : 'Turn to your side — keep your face in the oval.'}
      </Text>

      <View style={styles.examplesRow}>
        <View style={styles.exampleItem}>
          <Image source={goodExample} style={styles.exampleImg} resizeMode="cover" />
          <View style={styles.exampleLabelGood}>
            <Text style={styles.exampleLabelGoodText}>✓ Like this</Text>
          </View>
        </View>
        <View style={styles.exampleItem}>
          <Image source={badExample} style={styles.exampleImg} resizeMode="cover" />
          <View style={styles.exampleLabelBad}>
            <Text style={styles.exampleLabelBadText}>✕ Too dark</Text>
          </View>
        </View>
      </View>

      <View style={styles.viewport}>
        {granted ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing} />
        ) : (
          <View style={styles.permissionPrompt}>
            <HeadSilhouette size={56} color={colors.textTertiary} />
            <Text style={styles.permissionText}>
              {permission ? 'Allow camera access to take your photo.' : 'Preparing camera…'}
            </Text>
            {permission && !permission.granted && (
              <Pressable style={styles.permissionBtn} onPress={requestPermission}>
                <Text style={styles.permissionBtnText}>Allow camera</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.oval} pointerEvents="none" />

        <View style={styles.angleToggle} pointerEvents="none">
          <Text style={[styles.angleLabel, isFront && styles.angleLabelActive]}>● Front</Text>
          <Text style={[styles.angleLabel, !isFront && styles.angleLabelActive]}>○ Profile</Text>
        </View>

        {granted && lightingLive === true && (
          <View style={styles.lightingChip} pointerEvents="none">
            <Text style={styles.lightingChipText}>✓ Lighting looks good</Text>
          </View>
        )}
        {granted && lightingLive === false && (
          <View style={[styles.lightingChip, styles.lightingChipWarn]} pointerEvents="none">
            <Text style={[styles.lightingChipText, styles.lightingChipWarnText]}>
              ✕ Too dark — find brighter light
            </Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <Pressable onPress={handleGallery} style={styles.sideBtn}>
          <GalleryIcon size={24} color={colors.textSecondary} />
        </Pressable>
        <Pressable
          onPress={handleCapture}
          style={[styles.captureBtn, busy && styles.captureBtnBusy]}
          disabled={busy}
        >
          <CameraIcon size={28} color={colors.onPrimary} />
        </Pressable>
        <Pressable onPress={toggleFacing} style={styles.sideBtn} disabled={!granted}>
          <RetakeIcon size={24} color={granted ? colors.textSecondary : colors.textTertiary} />
        </Pressable>
      </View>

      {showE2eCapture && (
        <Pressable testID="e2e-use-test-photo" style={styles.e2eBtn} onPress={handleE2ePhoto}>
          <Text style={styles.e2eBtnText}>Use test photo</Text>
        </Pressable>
      )}

      <Text style={styles.privacy}>
        Photos are processed to generate your scores. Delete them anytime in Profile.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: spacing.xl,
    paddingTop: 56,
    paddingBottom: spacing.lg,
  },
  step: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  title: {
    ...typography.display,
    fontSize: 22,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  examplesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  exampleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    padding: 6,
  },
  exampleImg: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
  },
  exampleLabelGood: {
    backgroundColor: colors.tertiary,
    borderRadius: radii.full,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  exampleLabelGoodText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.onTertiary,
  },
  exampleLabelBad: {
    backgroundColor: colors.accent,
    borderRadius: radii.full,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  exampleLabelBadText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onAccent,
  },
  viewport: {
    flex: 1,
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionPrompt: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  permissionText: {
    ...typography.bodySm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  permissionBtn: {
    marginTop: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  permissionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onPrimary,
  },
  oval: {
    position: 'absolute',
    width: '64%',
    height: '74%',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.tertiary,
    borderRadius: 999,
    opacity: 0.75,
  },
  angleToggle: {
    position: 'absolute',
    top: spacing.md,
    flexDirection: 'row',
    gap: 14,
    backgroundColor: 'rgba(21, 16, 11, 0.55)',
    borderRadius: radii.full,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  angleLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  angleLabelActive: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  lightingChip: {
    position: 'absolute',
    bottom: spacing.md,
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
  lightingChipWarn: {
    backgroundColor: colors.accent,
  },
  lightingChipWarnText: {
    color: colors.onAccent,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
    marginTop: spacing.lg,
  },
  captureBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtnBusy: {
    opacity: 0.6,
  },
  sideBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  e2eBtn: {
    alignSelf: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  e2eBtnText: {
    ...typography.label,
    color: colors.primary,
  },
  privacy: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 15,
  },
});
