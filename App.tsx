import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
} from '@expo-google-fonts/nunito-sans';
import { ToastProvider } from './src/store/ToastContext';
import { OnboardingProvider, useOnboarding } from './src/store/OnboardingContext';
import { SubscriptionProvider, useSubscription } from './src/store/SubscriptionContext';
import { PracticeProvider } from './src/store/PracticeContext';
import { StreakProvider } from './src/store/StreakContext';
import { ScanProvider, useScans } from './src/store/ScanContext';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { TabNavigator } from './src/navigation/TabNavigator';
import { PaywallScreen } from './src/screens/PaywallScreen';
import { registerAppLifecycleReset } from './src/services/dataDeletion';
import { hydrateRenderCache } from './src/services/renderCache';
import { loadJson, saveJson, STORAGE_KEYS } from './src/services/storage';

function Root() {
  const [onboarded, setOnboarded] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const { paywallVisible, openPaywall, subscribed, ready: entitlementReady } = useSubscription();
  const { frontPhoto } = useOnboarding();
  const { runScan, hasRealScan } = useScans();
  const firstScanTriggered = useRef(false);

  useEffect(() => {
    return registerAppLifecycleReset(() => {
      firstScanTriggered.current = false;
      setOnboarded(false);
    });
  }, []);

  useEffect(() => {
    Promise.all([
      hydrateRenderCache(),
      loadJson<{ onboarded: boolean }>(STORAGE_KEYS.onboarded),
    ]).then(([, saved]) => {
      if (saved?.onboarded) setOnboarded(true);
      setStorageReady(true);
    });
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    saveJson(STORAGE_KEYS.onboarded, { onboarded });
  }, [onboarded, storageReady]);

  useEffect(() => {
    if (
      subscribed &&
      onboarded &&
      !hasRealScan &&
      !firstScanTriggered.current &&
      frontPhoto
    ) {
      firstScanTriggered.current = true;
      runScan({ frontUri: frontPhoto }).catch(() => {});
    }
  }, [subscribed, onboarded, hasRealScan, frontPhoto, runScan]);

  // Wait for onboarded flag + entitlement hydrate so Pro users never flash the
  // locked Results unlock banner before RevenueCat (or local cache) resolves.
  if (!storageReady || (onboarded && !entitlementReady)) return null;

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {onboarded ? (
        <TabNavigator />
      ) : (
        <OnboardingNavigator
          onComplete={() => {
            setOnboarded(true);
            if (!subscribed) openPaywall();
          }}
        />
      )}
      {paywallVisible && (
        <View style={StyleSheet.absoluteFill}>
          <PaywallScreen />
        </View>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    NunitoSans_400Regular,
    NunitoSans_500Medium,
    NunitoSans_600SemiBold,
    NunitoSans_700Bold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ToastProvider>
          <OnboardingProvider>
            <SubscriptionProvider>
              <PracticeProvider>
                <StreakProvider>
                  <ScanProvider>
                    <Root />
                  </ScanProvider>
                </StreakProvider>
              </PracticeProvider>
            </SubscriptionProvider>
          </OnboardingProvider>
        </ToastProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
