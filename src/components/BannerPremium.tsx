import { type ReactNode } from 'react';
import { type StyleProp, type ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { BronzeMetal } from './BronzeMetal';

interface Props {
  children?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/** Premium monetization banner — burnished bronze metal + ornament. */
export function BannerPremium({ children, onPress, style, accessibilityLabel }: Props) {
  const body = (
    <BronzeMetal style={style} contentStyle={{ padding: 20 }}>
      {children}
    </BronzeMetal>
  );

  if (onPress) {
    return (
      <PressableScale onPress={onPress} accessibilityLabel={accessibilityLabel} accessibilityRole="button">
        {body}
      </PressableScale>
    );
  }

  return body;
}
