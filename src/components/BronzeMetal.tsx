import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { radii } from '../theme';
import { CelestialOrnament } from './CelestialOrnament';

/** Burnished bronze metal — monetization surfaces only (DESIGN.md secondary). */
export const BRONZE_GRADIENT = ['#E2C49A', '#C99E6F', '#8A6438'] as const;

interface Props {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  ornament?: boolean;
  borderRadius?: number;
}

export function BronzeMetal({
  children,
  style,
  contentStyle,
  ornament = true,
  borderRadius = radii.lg,
}: Props) {
  return (
    <View style={[{ borderRadius, overflow: 'hidden' }, style]}>
      <LinearGradient
        colors={[...BRONZE_GRADIENT]}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Soft sheen highlight */}
      <LinearGradient
        colors={['rgba(255,255,255,0.22)', 'rgba(255,255,255,0)', 'rgba(0,0,0,0.12)']}
        locations={[0, 0.4, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {ornament ? (
        <CelestialOrnament
          size={48}
          variant="onBronze"
          opacity={0.2}
          style={styles.ornament}
        />
      ) : null}
      <View style={[{ padding: 16 }, contentStyle]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  ornament: {
    position: 'absolute',
    top: 8,
    right: 10,
  },
});
