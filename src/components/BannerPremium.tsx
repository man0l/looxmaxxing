import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { Card } from './Card';

interface Props {
  children?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function BannerPremium({ children, onPress, style, accessibilityLabel }: Props) {
  return (
    <Card
      role="premium"
      onPress={onPress}
      style={style}
      accessibilityLabel={accessibilityLabel}
      showOrnament
    >
      {children}
    </Card>
  );
}
