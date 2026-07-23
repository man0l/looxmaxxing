import { Image, ImageStyle, StyleProp } from 'react-native';

const WORDMARK = require('../../assets/images/brand-wordmark.png');
const MONOGRAM = require('../../assets/images/brand-monogram.png');

const RATIOS = { wordmark: 1200 / 238, monogram: 708 / 453 };

type BrandMarkProps = {
  variant?: 'wordmark' | 'monogram';
  height?: number;
  style?: StyleProp<ImageStyle>;
};

export function BrandMark({ variant = 'wordmark', height = 18, style }: BrandMarkProps) {
  return (
    <Image
      source={variant === 'wordmark' ? WORDMARK : MONOGRAM}
      style={[{ height, width: height * RATIOS[variant], alignSelf: 'center' }, style]}
      resizeMode="contain"
      accessibilityRole="image"
      accessibilityLabel="axend"
    />
  );
}
