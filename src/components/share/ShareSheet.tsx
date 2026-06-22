import { useRef, useState, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, PanResponder, ScrollView } from 'react-native';
import { captureCard, shareCard, type ShareTarget } from '../../services/share';
import {
  InstagramIcon,
  XIcon,
  WhatsAppIcon,
  TikTokIcon,
  MoreIcon,
} from '../icons/SocialIcons';
import { useToast } from '../../store/ToastContext';
import { colors, spacing, radii, typography } from '../../theme';

interface Props {
  message: string;
  children: ReactNode;
  onClose: () => void;
}

const TARGETS: { target: ShareTarget; label: string; Icon: typeof XIcon }[] = [
  { target: 'instagram', label: 'Stories', Icon: InstagramIcon },
  { target: 'x', label: 'X', Icon: XIcon },
  { target: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon },
  { target: 'tiktok', label: 'TikTok', Icon: TikTokIcon },
  { target: 'more', label: 'More', Icon: MoreIcon },
];

const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 0.8;

export function ShareSheet({ message, children, onClose }: Props) {
  const cardRef = useRef<View | null>(null);
  const [busy, setBusy] = useState(false);
  const { showToast } = useToast();
  const translateY = useRef(new Animated.Value(0)).current;

  const dismiss = () => {
    Animated.timing(translateY, {
      toValue: 600,
      duration: 180,
      useNativeDriver: false,
    }).start(onClose);
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > CLOSE_DISTANCE || g.vy > CLOSE_VELOCITY) {
          dismiss();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 4,
          }).start();
        }
      },
    }),
  ).current;

  const onShare = async (target: ShareTarget) => {
    if (busy) return;
    setBusy(true);
    try {
      const uri = await captureCard(cardRef);
      if (!uri) {
        showToast('Couldn’t prepare the image. Please try again.');
        return;
      }
      const outcome = await shareCard(target, uri, message);
      if (outcome === 'failed') {
        showToast('Couldn’t open that app.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.header} {...pan.panHandlers}>
          <View style={styles.grabber} />
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <Text style={styles.closeX}>✕</Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.previewScroll}
          contentContainerStyle={styles.previewWrap}
          showsVerticalScrollIndicator={false}
        >
          <View
            collapsable={false}
            ref={(node) => {
              cardRef.current = node;
            }}
          >
            {children}
          </View>
        </ScrollView>

        <View style={styles.iconRow}>
          {TARGETS.map(({ target, label, Icon }) => (
            <Pressable
              key={target}
              style={styles.iconButton}
              onPress={() => onShare(target)}
              disabled={busy}
            >
              <View style={styles.iconWell}>
                <Icon size={26} color={colors.tertiary} />
              </View>
              <Text style={styles.iconLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 6, 4, 0.78)',
  },
  sheet: {
    maxHeight: '92%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.sm,
    paddingBottom: 32,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  header: {
    alignSelf: 'stretch',
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 32,
    height: 32,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    ...typography.label,
    fontSize: 15,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  previewScroll: {
    alignSelf: 'stretch',
    flexShrink: 1,
  },
  previewWrap: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
  },
  iconButton: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  iconWell: {
    width: 54,
    height: 54,
    borderRadius: radii.full,
    backgroundColor: colors.surfaceInset,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
