import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { Card } from '../components/Card';
import { colors, spacing, typography } from '../theme';

interface Props {
  onClose: () => void;
}

const SECTIONS = [
  {
    title: 'What we evaluate',
    body: 'Your scan looks at seven structural traits — jawline, cheekbones, skin, hair, masculine presence, smile, and eye area. We read proportion and structure from your two photos. We never judge identity, ethnicity, or worth.',
  },
  {
    title: 'What a percentile means',
    body: '"Top 39%" means you score higher than most men on that trait, compared to a large reference set. It is a relative position, not a verdict — and every trait comes with a plan to move it.',
  },
  {
    title: 'Why lighting and angles matter',
    body: 'Even lighting and a straight-on front plus a clean profile let the model read the same structure every time. That is why capture is guided and lighting is checked — it keeps your scores consistent scan to scan, so changes reflect you, not the photo.',
  },
  {
    title: 'How to move your scores',
    body: 'Each trait maps to one workout or routine. Work the plan, keep your streak, and re-rate when you want to check progress. Structure changes slowly — the percentile is there to show momentum, not to grade you.',
  },
];

export function MethodologyScreen({ onClose }: Props) {
  return (
    <ScreenShell>
      <View style={styles.header}>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.container} bounces={false}>
        <Text style={styles.title}>How scoring works</Text>
        <Text style={styles.intro}>
          Built to be honest and repeatable — here is exactly what the score is, and what it isn’t.
        </Text>

        {SECTIONS.map((section) => (
          <Card key={section.title} role="quiet" style={styles.card}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardBody}>{section.body}</Text>
          </Card>
        ))}
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
  },
  back: {
    ...typography.label,
    color: colors.primary,
  },
  container: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 40,
    gap: spacing.md,
  },
  title: {
    ...typography.display,
    fontSize: 26,
    color: colors.textPrimary,
  },
  intro: {
    ...typography.bodyMd,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  card: {
    gap: spacing.xs,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  cardBody: {
    ...typography.bodyMd,
    color: colors.textSecondary,
  },
});
