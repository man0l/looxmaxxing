import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { colors, spacing, radii, typography } from '../../theme';

const TESTIMONIALS = [
  {
    stars: 5,
    title: 'This app changed my life',
    body: "I've been using LooxMaxxing for 3 months now and the transformation is insane. My jawline is so much more defined and my face looks way more structured. The daily routines are actually manageable and the AI keeps track of everything. Best investment I've made in myself.",
    handle: '@billyboy44',
  },
  {
    stars: 5,
    title: 'My jawline actually changed',
    body: "I was skeptical about a jawline 'workout' but stuck with it for 8 weeks. Went from Top 60% to Top 34% on my re-scan — the exercises take maybe 5 minutes a day. Genuinely surprised it worked.",
    handle: '@marcus_t',
  },
];

interface Props {
  onContinue: () => void;
}

export function RatingScreen({ onContinue }: Props) {
  const { width } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const cardWidth = width - spacing.xl * 2;

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / cardWidth);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Give us a rating</Text>
        <Text style={styles.subtitle}>
          See what other people say about us — then help the next guy find LooxMaxxing.
        </Text>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={onScrollEnd}
          decelerationRate="fast"
          style={styles.carousel}
        >
          {TESTIMONIALS.map((testimonial) => (
            <View key={testimonial.handle} style={[styles.card, { width: cardWidth }]}>
              <Text style={styles.stars}>{'★'.repeat(testimonial.stars)}</Text>
              <Text style={styles.cardTitle}>{testimonial.title}</Text>
              <Text style={styles.cardBody}>{testimonial.body}</Text>
              <Text style={styles.handle}>{testimonial.handle}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dots}>
          {TESTIMONIALS.map((testimonial, i) => (
            <View
              key={testimonial.handle}
              style={[styles.dot, i === activeIndex && styles.dotActive]}
            />
          ))}
        </View>
      </View>

      <Pressable onPress={onContinue} style={styles.cta}>
        <Text style={styles.ctaText}>Continue</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.display,
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  subtitle: {
    ...typography.bodySm,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
    lineHeight: 20,
    paddingHorizontal: spacing.xl,
  },
  carousel: {
    flexGrow: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
    marginHorizontal: spacing.xl,
  },
  stars: {
    fontSize: 20,
    color: '#F5B731',
    letterSpacing: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardBody: {
    ...typography.bodySm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  handle: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.tertiary,
    width: 18,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radii.full,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
  },
  ctaText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.onPrimary,
  },
});
