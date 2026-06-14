import Svg, { Circle, Path } from 'react-native-svg';

interface NavIconProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

const base = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function ResultsIcon({ size = 24, color, strokeWidth = 1.7 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4.5 19 L19.5 19" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M8 19 L8 13" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M12 19 L12 7.5" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M16 19 L16 11" stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}

export function PracticeIcon({ size = 24, color, strokeWidth = 1.7 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 12 L16 12" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M6 9 L6 15" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M8 8 L8 16" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M16 8 L16 16" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M18 9 L18 15" stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}

export function AvatarsIcon({ size = 24, color, strokeWidth = 1.7 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5 7 a2 2 0 0 1 2 -2 h10 a2 2 0 0 1 2 2 v10 a2 2 0 0 1 -2 2 h-10 a2 2 0 0 1 -2 -2 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
      <Circle cx={12} cy={10} r={2.4} stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M7.8 17.5 C8.3 14.6 15.7 14.6 16.2 17.5" stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}

export function RatingsIcon({ size = 24, color, strokeWidth = 1.7 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4.5 L14.3 9.2 L19.5 9.9 L15.7 13.5 L16.6 18.6 L12 16.2 L7.4 18.6 L8.3 13.5 L4.5 9.9 L9.7 9.2 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
    </Svg>
  );
}

export function ProfileIcon({ size = 24, color, strokeWidth = 1.7 }: NavIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8.5} r={3.2} stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path
        d="M5.5 19.5 C5.5 15.4 8.5 13.5 12 13.5 C15.5 13.5 18.5 15.4 18.5 19.5"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
    </Svg>
  );
}
