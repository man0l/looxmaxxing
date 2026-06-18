import { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';
import { useOnboarding, useOnboardingDispatch } from '../store/OnboardingContext';
import { AgeGateScreen } from '../screens/onboarding/AgeGateScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { ConcernSelectionScreen } from '../screens/onboarding/ConcernSelectionScreen';
import { DepthQuestionScreen } from '../screens/onboarding/DepthQuestionScreen';
import { ExpectationsScreen } from '../screens/onboarding/ExpectationsScreen';
import { GuidedCaptureScreen } from '../screens/onboarding/GuidedCaptureScreen';

type Step = 'age' | 'welcome' | 'concerns' | 'depth' | 'expectations' | 'capture';

interface Props {
  onComplete: () => void;
}

export function OnboardingNavigator({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('age');
  const state = useOnboarding();
  const dispatch = useOnboardingDispatch();
  const insets = useSafeAreaInsets();

  const goTo = useCallback((next: Step) => setStep(next), []);

  const renderStep = () => {
    if (step === 'age') {
      return (
        <AgeGateScreen
          selected={state.ageRange}
          onSelect={(age) => {
            dispatch({ type: 'SET_AGE', payload: age });
            if (age === 'under17') return;
          }}
          onContinue={() => {
            if (state.ageRange && state.ageRange !== 'under17') goTo('welcome');
          }}
          onUnder17={() => {}}
        />
      );
    }

    if (step === 'welcome') {
      return <WelcomeScreen onStart={() => goTo('concerns')} />;
    }

    if (step === 'concerns') {
      return (
        <ConcernSelectionScreen
          selected={state.concerns}
          onToggle={(id) => dispatch({ type: 'TOGGLE_CONCERN', payload: id })}
          onContinue={() => goTo('depth')}
        />
      );
    }

    if (step === 'depth') {
      const topConcern = state.concerns[0] || 'jawline';
      return (
        <DepthQuestionScreen
          concernId={topConcern}
          selected={state.depthAnswer}
          onSelect={(a) => dispatch({ type: 'SET_DEPTH', payload: a })}
          onContinue={() => goTo('expectations')}
          onSkip={() => goTo('expectations')}
        />
      );
    }

    if (step === 'expectations') {
      return <ExpectationsScreen onGotIt={() => goTo('capture')} />;
    }

    if (step === 'capture') {
      const captureStep = state.frontPhoto ? 'profile' : 'front';
      return (
        <GuidedCaptureScreen
          step={captureStep}
          onCapture={(uri) => {
            if (captureStep === 'front') {
              dispatch({ type: 'SET_FRONT_PHOTO', payload: uri });
            } else {
              dispatch({ type: 'SET_PROFILE_PHOTO', payload: uri });
              onComplete();
            }
          }}
        />
      );
    }

    return null;
  };

  return <View style={[styles.root, { paddingBottom: insets.bottom }]}>{renderStep()}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
