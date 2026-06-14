import { useRef, useState, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { captureCard, shareCard, type ShareTarget } from '../../services/share';
import {
  InstagramIcon,
  XIcon,
  WhatsAppIcon,
  TikTokIcon,
  MoreIcon,
} from '../icons/SocialIcons';
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

export function ShareSheet({ message, children, onClose }: Props) {
  const cardRef = useRef<View | null>(null);
  const [busy, setBusy] = useState(false);

  const onShare = async (target: ShareTarget) => {
    if (busy) return;
    setBusy(true);
    const uri = await captureCard(cardRef);
    await shareCard(target, uri ?? '', message);
    setBusy(false);
  };

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.previewWrap}>
          <View
            collapsable={false}
            ref={(node) => {
              cardRef.current = node;
            }}
          >
            {children}
          </View>
        </View>

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

        <Pressable onPress={onClose} style={styles.cancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
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
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.xl,
    paddingBottom: 32,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  previewWrap: {
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  cancel: {
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  cancelText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
