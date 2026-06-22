import Svg, { Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

const base = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function ShareIcon({ size = 20, color, strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3 L12 14" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M8.5 6.5 L12 3 L15.5 6.5" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path
        d="M8 9 H7 a2 2 0 0 0 -2 2 v7 a2 2 0 0 0 2 2 h10 a2 2 0 0 0 2 -2 v-7 a2 2 0 0 0 -2 -2 h-1"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
    </Svg>
  );
}

export function CompareIcon({ size = 20, color, strokeWidth = 1.7 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 9 L17 9" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M14 6 L17 9 L14 12" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M19 15 L7 15" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M10 12 L7 15 L10 18" stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}
