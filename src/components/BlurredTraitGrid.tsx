import { View, Text, StyleSheet, Platform } from 'react-native';
import { TRAITS } from '../types/traits';
import { getScores, orderByConcerns } from '../services/scoring';
import { colors, spacing, radii, typography } from '../theme';
import { RingGauge } from './RingGauge';

interface Props {
  concerns: string[];
}

const traitLabel = (id: string) => TRAITS.find((t) => t.id === id)?.label ?? id;

export function BlurredTraitGrid({ concerns }: Props) {
  const ordered = orderByConcerns(getScores(), concerns);
  const featured = ordered.slice(0, 2);
  const rest = ordered.slice(2);

  return (
    <View style={styles.card}>
      <View style={styles.featuredRow}>
        {featured.map((s) => (
          <View key={s.traitId} style={styles.featuredItem}>
            <RingGauge percentile={s.percentile} size={88} obscured animate={false} />
            <Text style={styles.featuredLabel}>{traitLabel(s.traitId)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.restRow}>
        {rest.map((s) => (
          <View key={s.traitId} style={styles.restItem}>
            <RingGauge percentile={s.percentile} size={48} obscured animate={false} />
            <Text style={styles.restLabel}>{traitLabel(s.traitId)}</Text>
          </View>
        ))}
      </View>
      <View style={styles.frostOverlay} pointerEvents="none" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.lg,
  },
  featuredRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: spacing.lg,
  },
  featuredItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  featuredLabel: {
    ...typography.label,
    color: colors.textPrimary,
  },
  restRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  restItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  restLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  frostOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: radii.lg,
    backgroundColor: Platform.select({
      android: `${colors.surface}D9`,
      default: `${colors.surface}99`,
    }),
  },
});
