import type { ReactElement } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface IconProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

const base = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function JawlineGlyph({ size = 18, color, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6 4 C6 11 7.5 16 12.5 18.5 C16 20 19 17.5 19 13.5"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
      <Path d="M19 13.5 L19 9" stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}

export function CheekbonesGlyph({ size = 18, color, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4.5 C12.6 8.8 15.2 11.4 19.5 12 C15.2 12.6 12.6 15.2 12 19.5 C11.4 15.2 8.8 12.6 4.5 12 C8.8 11.4 11.4 8.8 12 4.5 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
    </Svg>
  );
}

export function SkinGlyph({ size = 18, color, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 4 C12 4 6.5 10.8 6.5 14.8 C6.5 18 9 20.5 12 20.5 C15 20.5 17.5 18 17.5 14.8 C17.5 10.8 12 4 12 4 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
    </Svg>
  );
}

export function HairGlyph({ size = 18, color, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 18 C6 10 8.5 6 13 5" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M10.5 18 C10.5 12 12.5 8.5 16 7.5" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M15 18 C15 13.5 16.5 11 19 10.5" stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}

export function MasculinityGlyph({ size = 18, color, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={6} r={2.5} stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M12 9.5 L12 19.5" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M6.5 13 L17.5 13" stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}

export function SmileGlyph({ size = 18, color, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M5.5 11 C7 16.5 17 16.5 18.5 11"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
      <Path d="M5.5 11 L4.5 9.5" stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M18.5 11 L19.5 9.5" stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}

export function EyesGlyph({ size = 18, color, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 12 C8 6.8 16 6.8 20 12 C16 17.2 8 17.2 4 12 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
      <Circle cx={12} cy={12} r={2.4} stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}

const CONCERN_GLYPHS: Record<string, (props: IconProps) => ReactElement> = {
  jawline: JawlineGlyph,
  cheekbones: CheekbonesGlyph,
  skin: SkinGlyph,
  hair: HairGlyph,
  masculinity: MasculinityGlyph,
  smile: SmileGlyph,
  eyes: EyesGlyph,
};

export function ConcernGlyph({ id, ...props }: IconProps & { id: string }) {
  const Glyph = CONCERN_GLYPHS[id];
  return Glyph ? <Glyph {...props} /> : null;
}

export function GalleryIcon({ size = 22, color, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 7 a3 3 0 0 1 3 -3 h10 a3 3 0 0 1 3 3 v10 a3 3 0 0 1 -3 3 h-10 a3 3 0 0 1 -3 -3 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
      <Circle cx={9} cy={9.5} r={1.6} stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path d="M5 17.5 L10.5 12 L14 15.5 L16 13.5 L19 16.5" stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}

export function CameraIcon({ size = 26, color, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 9.5 a2 2 0 0 1 2 -2 h2 l1.6 -2.5 h4.8 L16 7.5 h2 a2 2 0 0 1 2 2 v7 a2 2 0 0 1 -2 2 h-12 a2 2 0 0 1 -2 -2 Z"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
      <Circle cx={12} cy={13} r={3.2} stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}

export function RetakeIcon({ size = 22, color, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M18.5 9.5 A7 7 0 1 0 19 13.5"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
      <Path d="M19 4.5 L19 9.5 L14 9.5" stroke={color} strokeWidth={strokeWidth} {...base} />
    </Svg>
  );
}

export function HeadSilhouette({ size = 56, color, strokeWidth = 1.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4} stroke={color} strokeWidth={strokeWidth} {...base} />
      <Path
        d="M4.5 20.5 C4.5 16.5 8 14.5 12 14.5 C16 14.5 19.5 16.5 19.5 20.5"
        stroke={color}
        strokeWidth={strokeWidth}
        {...base}
      />
    </Svg>
  );
}
