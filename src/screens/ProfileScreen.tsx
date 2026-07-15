import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useOnboarding, useOnboardingDispatch } from '../store/OnboardingContext';
import { useScans } from '../store/ScanContext';
import { PRIVACY_POLICY_URL } from '../config/legal';
import { useSubscription } from '../store/SubscriptionContext';
import { useToast } from '../store/ToastContext';
import { deleteAllUserData } from '../services/deleteAllData';
import { presentCustomerCenter } from '../services/purchases';
import { MethodologyScreen } from './MethodologyScreen';
import { colors, spacing, radii, typography } from '../theme';

interface RowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  tone?: 'default' | 'action' | 'danger';
  disabled?: boolean;
  first?: boolean;
}

function Row({ label, value, onPress, tone = 'default', disabled, first }: RowProps) {
  const labelColor =
    tone === 'action' ? colors.primary : tone === 'danger' ? colors.danger : colors.textPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[styles.row, !first && styles.rowDivider, disabled && styles.rowDisabled]}
    >
      <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
      {value !== undefined ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : onPress && tone === 'default' ? (
        <Text style={styles.rowChevron}>›</Text>
      ) : null}
    </Pressable>
  );
}

export function ProfileScreen() {
  const { frontPhoto, profilePhoto } = useOnboarding();
  const dispatch = useOnboardingDispatch();
  const { scans } = useScans();
  const { subscribed, restore, openPaywall } = useSubscription();
  const { showToast } = useToast();
  const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

  const [showMethodology, setShowMethodology] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const hasPhotos = Boolean(
    frontPhoto || profilePhoto || scans.some((scan) => scan.photoUri),
  );

  if (showMethodology) {
    return <MethodologyScreen onClose={() => setShowMethodology(false)} />;
  }

  return (
    <View style={styles.root}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Text style={styles.header}>Profile</Text>

        <Text style={styles.sectionLabel}>Subscription</Text>
        <View style={styles.card}>
          <Row label="Status" value={subscribed ? 'Pro' : 'Free'} first />
          {subscribed && isNative && (
            <Row label="Manage subscription" tone="action" onPress={presentCustomerCenter} />
          )}
          {!subscribed && <Row label="Unlock your results" tone="action" onPress={openPaywall} />}
          <Row label="Restore purchases" tone="action" onPress={restore} />
        </View>

        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <Row label="How scoring works" onPress={() => setShowMethodology(true)} first />
        </View>

        <Text style={styles.sectionLabel}>Privacy</Text>
        <View style={styles.card}>
          <Row
            label={hasPhotos ? 'Delete my photos' : 'No photos stored'}
            tone={hasPhotos ? 'danger' : 'default'}
            onPress={hasPhotos ? () => setConfirmDelete(true) : undefined}
            disabled={!hasPhotos}
            first
          />
          <Row
            label="Delete all my data"
            tone="danger"
            onPress={() => setConfirmDeleteAll(true)}
          />
          <Row
            label="Privacy policy"
            tone="action"
            onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}
          />
        </View>
      </ScrollView>

      {confirmDelete && (
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={() => setConfirmDelete(false)} />
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Delete your photos?</Text>
            <Text style={styles.dialogBody}>
              Your front and profile photos will be removed from this device. Your scores stay, but
              you’ll need new photos to re-scan.
            </Text>
            <Pressable
              style={styles.dialogDelete}
              onPress={() => {
                dispatch({ type: 'CLEAR_PHOTOS' });
                setConfirmDelete(false);
              }}
            >
              <Text style={styles.dialogDeleteText}>Delete photos</Text>
            </Pressable>
            <Pressable style={styles.dialogCancel} onPress={() => setConfirmDelete(false)}>
              <Text style={styles.dialogCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}

      {confirmDeleteAll && (
        <View style={styles.overlay}>
          <Pressable
            style={styles.backdrop}
            onPress={() => !deletingAll && setConfirmDeleteAll(false)}
          />
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Delete all your data?</Text>
            <Text style={styles.dialogBody}>
              This removes your scores, scan history, streak, practice progress, photos, and your
              anonymous identifier from this device and our servers.
              {subscribed
                ? ' Your subscription stays active until you cancel it in App Store settings — use Restore purchases to re-link it after starting over.'
                : ''}
            </Text>
            <Pressable
              style={[styles.dialogDelete, deletingAll && styles.dialogDeleteDisabled]}
              disabled={deletingAll}
              onPress={() => {
                setDeletingAll(true);
                void deleteAllUserData().then(({ serverOk }) => {
                  setDeletingAll(false);
                  setConfirmDeleteAll(false);
                  if (serverOk) {
                    showToast('All data deleted.', 'success');
                  } else {
                    showToast(
                      'Local data cleared. Server cleanup failed — try again when online.',
                      'error',
                    );
                  }
                });
              }}
            >
              {deletingAll ? (
                <ActivityIndicator color={colors.onAccent} />
              ) : (
                <Text style={styles.dialogDeleteText}>Delete all data</Text>
              )}
            </Pressable>
            <Pressable
              style={styles.dialogCancel}
              disabled={deletingAll}
              onPress={() => setConfirmDeleteAll(false)}
            >
              <Text style={styles.dialogCancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: 110,
    gap: spacing.sm,
  },
  header: {
    ...typography.display,
    fontSize: 24,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowDisabled: {
    opacity: 0.5,
  },
  rowLabel: {
    ...typography.bodySm,
  },
  rowValue: {
    ...typography.label,
    color: colors.textSecondary,
  },
  rowChevron: {
    fontSize: 18,
    color: colors.textTertiary,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(8, 6, 4, 0.7)',
  },
  dialog: {
    width: '100%',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.xl,
  },
  dialogTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  dialogBody: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  dialogDelete: {
    backgroundColor: colors.danger,
    borderRadius: radii.full,
    paddingVertical: 13,
    alignItems: 'center',
    minHeight: 46,
    justifyContent: 'center',
  },
  dialogDeleteDisabled: {
    opacity: 0.7,
  },
  dialogDeleteText: {
    ...typography.label,
    color: colors.onAccent,
    fontWeight: '600',
  },
  dialogCancel: {
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  dialogCancelText: {
    ...typography.label,
    color: colors.textSecondary,
  },
});
