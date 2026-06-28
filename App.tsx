import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/store/ToastContext';
import { OnboardingProvider, useOnboarding } from './src/store/OnboardingContext';
import { SubscriptionProvider, useSubscription } from './src/store/SubscriptionContext';
import { PracticeProvider } from './src/store/PracticeContext';
import { StreakProvider } from './src/store/StreakContext';
import { ScanProvider, useScans } from './src/store/ScanContext';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { TabNavigator } from './src/navigation/TabNavigator';
import { PaywallScreen } from './src/screens/PaywallScreen';
import { hydrateRenderCache } from './src/services/renderCache';

function Root() {
  const [onboarded, setOnboarded] = useState(false);
  const { paywallVisible, openPaywall, subscribed } = useSubscription();
  const { frontPhoto, profilePhoto } = useOnboarding();
  const { runScan, hasRealScan } = useScans();
  const firstScanTriggered = useRef(false);

  useEffect(() => {
    hydrateRenderCache();
  }, []);

  useEffect(() => {
    if (
      subscribed &&
      onboarded &&
      !hasRealScan &&
      !firstScanTriggered.current &&
      frontPhoto &&
      profilePhoto
    ) {
      firstScanTriggered.current = true;
      runScan({ frontUri: frontPhoto, profileUri: profilePhoto }).catch(() => {});
    }
  }, [subscribed, onboarded, hasRealScan, frontPhoto, profilePhoto, runScan]);

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {onboarded ? (
        <TabNavigator />
      ) : (
        <OnboardingNavigator
          onComplete={() => {
            setOnboarded(true);
            openPaywall();
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
  return (
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
  );
}