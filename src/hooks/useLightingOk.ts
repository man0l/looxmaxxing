import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { requireOptionalNativeModule } from 'expo';
import { LightSensor } from 'expo-sensors';

// Android reads the ambient light sensor (lux); iOS reads the front-camera
// exposure (EV) since it has no usable real-time ambient-light API.
const GOOD_LUX = 30;
const GOOD_EV = 3.5;
const IOS_POLL_MS = 700;

const CameraBrightness = requireOptionalNativeModule<{
  getBrightnessEV(): Promise<number | null>;
}>('CameraBrightness');

/**
 * Live lighting check for the capture screen. Returns true/false once a
 * reading is available, or null when no mechanism exists (e.g. web) so the
 * caller can fall back to a default.
 */
export function useLightingOk(active: boolean): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (!active) return;
    let mounted = true;

    if (Platform.OS === 'android') {
      let sub: { remove: () => void } | undefined;
      LightSensor.isAvailableAsync().then((available) => {
        if (!available || !mounted) return;
        LightSensor.setUpdateInterval(500);
        sub = LightSensor.addListener(({ illuminance }) => {
          if (typeof illuminance === 'number') setOk(illuminance >= GOOD_LUX);
        });
      });
      return () => {
        mounted = false;
        sub?.remove();
      };
    }

    if (CameraBrightness) {
      const poll = async () => {
        try {
          const ev = await CameraBrightness.getBrightnessEV();
          if (mounted && typeof ev === 'number') setOk(ev >= GOOD_EV);
        } catch {
          // ignore transient reads
        }
      };
      poll();
      const id = setInterval(poll, IOS_POLL_MS);
      return () => {
        mounted = false;
        clearInterval(id);
      };
    }

    return () => {
      mounted = false;
    };
  }, [active]);

  return ok;
}
