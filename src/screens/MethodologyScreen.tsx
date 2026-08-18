import { Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenShell } from '../components/ScreenShell';
import { Card } from '../components/Card';
import { BackHeader, NestedScreen } from '../components/BackHeader';
import { colors, spacing, typography } from '../theme';

interface Props {
  onClose: () => void;
}

const SECTIONS = [
  {
    title: 'What we evaluate',
    body: 'Your scan looks at seven structural traits — jawline, cheekbones, skin, hair, presence and posture, smile, and eye area. We read proportion and structure from your two photos. We never judge identity, ethnicity, or worth.',
  },
  {
    title: 'What the score means',
    body: 'Each area gets a 0-10 score describing what the photos show for that feature — a 6.1 jawline means moderate definition, nothing more. It is your own starting point, not a ranking against other people, and every area comes with a plan to move it.',
  },
  {
    title: 'Why lighting and angles matter',
    body: 'Even lighting and a straight-on front plus a clean profile let the model read the same structure every time. That is why capture is guided and lighting is checked — it keeps your scores consistent scan to scan, so changes reflect you, not the photo.',
  },
  {
    title: 'How to move your scores',
    body: 'Each area maps to one workout or routine. Work the plan, keep your streak, and re-scan when you want to check progress. Change comes slowly — the score is there to show your own momentum, not to grade you.',
  },
  {
    title: 'What this is not',
    body: 'Axend is a cosmetic self-improvement tool, not a medical or diagnostic service. Scores reflect aesthetic convention, not health, and they are estimates — lighting, angle, and expression all move them. Results vary from person to person, and nothing here is a guarantee of a particular outcome. For anything concerning your skin, hair, or health, talk to a qualified professional.',
  },
];

export function MethodologyScreen({ onClose }: Props) {
  return (
    <NestedScreen onClose={onClose}>
      <ScreenShell>
        <BackHeader onClose={onClose} />
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
    </NestedScreen>
  );
}

const styles = StyleSheet.create({
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
