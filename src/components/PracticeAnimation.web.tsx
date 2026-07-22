import { StyleSheet, View } from 'react-native';
import { DotLottieReact, setWasmUrl } from '@lottiefiles/dotlottie-react';
import { colors, radii, spacing } from '../theme';

// Serve the renderer's wasm from our own origin instead of the jsDelivr CDN
// default — keeps practice animations working offline/local-first and avoids
// a third-party network dependency for a core UI element.
setWasmUrl('/dotlottie-player.wasm');

const ANIMATIONS: Record<string, Record<string, unknown>> = {
  'tongue-to-roof-hold': require('../../assets/lottie/practice/tongue-to-roof-hold.json'),
  'chin-pull-back': require('../../assets/lottie/practice/chin-pull-back.json'),
  'lying-neck-lift': require('../../assets/lottie/practice/lying-neck-lift.json'),
  'cheek-suck-in': require('../../assets/lottie/practice/cheek-suck-in.json'),
  'fingertip-smile-press': require('../../assets/lottie/practice/fingertip-smile-press.json'),
  'closed-lip-cheek-lift': require('../../assets/lottie/practice/closed-lip-cheek-lift.json'),
  'wall-arm-slide': require('../../assets/lottie/practice/wall-arm-slide.json'),
  'shoulder-blade-squeeze': require('../../assets/lottie/practice/shoulder-blade-squeeze.json'),
  'eye-smile': require('../../assets/lottie/practice/eye-smile.json'),
};

interface Props {
  slug: string;
}

export function PracticeAnimation({ slug }: Props) {
  const source = ANIMATIONS[slug];
  if (!source) return null;

  return (
    <View style={styles.wrapper}>
      <DotLottieReact data={source} autoplay loop style={styles.animation} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceInset,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  animation: {
    width: '100%',
    height: '100%',
  },
});
