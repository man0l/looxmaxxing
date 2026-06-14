import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { OnboardingProvider } from './src/store/OnboardingContext';
import { SubscriptionProvider, useSubscription } from './src/store/SubscriptionContext';
import { PracticeProvider } from './src/store/PracticeContext';
import { StreakProvider } from './src/store/StreakContext';
import { ScanProvider } from './src/store/ScanContext';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { TabNavigator } from './src/navigation/TabNavigator';
import { PaywallScreen } from './src/screens/PaywallScreen';

function Root() {
  const [onboarded, setOnboarded] = useState(false);
  const { paywallVisible, openPaywall } = useSubscription();

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
  );
}
