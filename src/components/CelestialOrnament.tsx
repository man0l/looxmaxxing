import { type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme';

type Variant = 'onBronze' | 'onSurface';

interface Props {
  size?: number;
  style?: StyleProp<ViewStyle>;
  opacity?: number;
  variant?: Variant;
}

export function CelestialOrnament({
  size = 44,
  style,
  opacity = 0.22,
  variant = 'onBronze',
}: Props) {
  const base =
    variant === 'onBronze'
      ? colors.onSecondary
      : colors.tertiary;
  const stroke = hexToRgba(base, opacity);
  const fill = hexToRgba(base, opacity * 0.9);

  return (
    <Svg
      width={size}
      height={Math.round(size * 0.68)}
      style={style}
      pointerEvents="none"
    >
      <Path
        d="M4 7 Q12 3 20 8"
        stroke={stroke}
        strokeWidth={1.2}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M6 14 Q14 11 18 16"
        stroke={stroke}
        strokeWidth={0.9}
        fill="none"
        strokeLinecap="round"
        strokeOpacity={0.7}
      />
      <Path
        d="M2 20 Q10 18 14 23"
        stroke={stroke}
        strokeWidth={0.8}
        fill="none"
        strokeLinecap="round"
        strokeOpacity={0.6}
      />
      <Circle cx="24" cy="5" r={1.3} fill={fill} />
      <Circle cx="30" cy="11" r={1.0} fill={fill} />
      <Circle cx="35" cy="6" r={0.8} fill={fill} />
      <Path
        d="M28 17 Q34 13 38 18"
        stroke={stroke}
        strokeWidth={1.05}
        fill="none"
        strokeLinecap="round"
      />
      <Circle cx="8" cy="18" r={1.2} fill={fill} />
      <Circle cx="14" cy="22" r={0.7} fill={fill} />
      <Circle cx="40" cy="14" r={0.9} fill={fill} />
    </Svg>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
