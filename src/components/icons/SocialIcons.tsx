import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface IconProps {
  size?: number;
  color: string;
}

const stroke = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function InstagramIcon({ size = 26, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3.5} y={3.5} width={17} height={17} rx={5} stroke={color} strokeWidth={1.7} {...stroke} />
      <Circle cx={12} cy={12} r={4} stroke={color} strokeWidth={1.7} {...stroke} />
      <Circle cx={16.6} cy={7.4} r={1} fill={color} />
    </Svg>
  );
}

export function XIcon({ size = 26, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 4 L19 20" stroke={color} strokeWidth={1.9} {...stroke} />
      <Path d="M19 4 L5 20" stroke={color} strokeWidth={1.9} {...stroke} />
    </Svg>
  );
}

export function WhatsAppIcon({ size = 26, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 20 L5.3 16.2 A7.5 7.5 0 1 1 8 18.8 L4 20 Z"
        stroke={color}
        strokeWidth={1.7}
        {...stroke}
      />
      <Path
        d="M9.2 8.6 c-0.3 0 -0.6 0.1 -0.8 0.4 c-0.3 0.3 -0.8 0.8 -0.8 1.9 c0 1.1 0.8 2.2 0.9 2.4 c0.1 0.2 1.6 2.5 3.9 3.4 c1.9 0.8 2.3 0.6 2.7 0.6 c0.4 0 1.3 -0.5 1.5 -1.1 c0.2 -0.5 0.2 -1 0.1 -1.1 c-0.1 -0.1 -0.3 -0.2 -0.6 -0.4 c-0.3 -0.2 -1.3 -0.7 -1.5 -0.7 c-0.2 -0.1 -0.4 -0.1 -0.5 0.1 c-0.2 0.3 -0.6 0.7 -0.7 0.9 c-0.1 0.1 -0.3 0.2 -0.5 0.1 c-0.3 -0.1 -1 -0.4 -1.8 -1.1 c-0.7 -0.6 -1.1 -1.3 -1.2 -1.6 c-0.1 -0.2 0 -0.4 0.1 -0.5 c0.1 -0.1 0.3 -0.3 0.4 -0.5 c0.1 -0.2 0.2 -0.3 0.3 -0.5 c0.1 -0.2 0 -0.4 0 -0.5 c-0.1 -0.2 -0.5 -1.2 -0.7 -1.6 c-0.2 -0.4 -0.4 -0.4 -0.5 -0.4 Z"
        fill={color}
      />
    </Svg>
  );
}

export function TikTokIcon({ size = 26, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M13.5 4 v9.2 a3 3 0 1 1 -2.6 -2.97"
        stroke={color}
        strokeWidth={1.7}
        {...stroke}
      />
      <Path
        d="M13.5 4.4 c0.5 2 2 3.4 4 3.7"
        stroke={color}
        strokeWidth={1.7}
        {...stroke}
      />
    </Svg>
  );
}

export function MoreIcon({ size = 26, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={6} cy={12} r={1.5} fill={color} />
      <Circle cx={12} cy={12} r={1.5} fill={color} />
      <Circle cx={18} cy={12} r={1.5} fill={color} />
    </Svg>
  );
}
