import { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { components } from '../theme';
import { CelestialOrnament } from './CelestialOrnament';
import { PressableScale } from './PressableScale';

export type CardRole = 'quiet' | 'hero' | 'inset' | 'premium';

interface Props {
  children?: ReactNode;
  role?: CardRole;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  showOrnament?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'link' | 'none';
}

const ROLE_STYLE: Record<CardRole, ViewStyle> = {
  quiet: {
    backgroundColor: components.card.backgroundColor,
    borderRadius: components.card.borderRadius,
    padding: components.card.padding,
    borderWidth: components.card.borderWidth,
    borderColor: components.card.borderColor,
  },
  hero: {
    backgroundColor: components.cardHero.backgroundColor,
    borderRadius: components.cardHero.borderRadius,
    padding: components.cardHero.padding,
    borderWidth: components.cardHero.borderWidth,
    borderColor: components.cardHero.borderColor,
  },
  inset: {
    backgroundColor: components.cardInset.backgroundColor,
    borderRadius: components.cardInset.borderRadius,
    padding: components.cardInset.padding,
    borderWidth: components.cardInset.borderWidth,
    borderColor: components.cardInset.borderColor,
  },
  premium: {
    backgroundColor: components.bannerPremium.backgroundColor,
    borderRadius: components.bannerPremium.borderRadius,
    padding: components.bannerPremium.padding,
    overflow: 'hidden',
  },
};

export function Card({
  children,
  role = 'quiet',
  onPress,
  style,
  showOrnament,
  disabled,
  accessibilityLabel,
  accessibilityRole,
}: Props) {
  const ornament = showOrnament ?? role === 'premium';
  const surfaceStyle: StyleProp<ViewStyle> = [ROLE_STYLE[role], style];

  const body = (
    <>
      {children}
      {ornament ? (
        <CelestialOrnament
          size={40}
          variant={role === 'premium' ? 'onBronze' : 'onSurface'}
          style={{ position: 'absolute', top: 8, right: 12 }}
        />
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        disabled={disabled}
        style={surfaceStyle}
        accessibilityRole={accessibilityRole ?? 'button'}
        accessibilityLabel={accessibilityLabel}
      >
        {body}
      </PressableScale>
    );
  }

  return <View style={surfaceStyle}>{body}</View>;
}
