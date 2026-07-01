import { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../theme';
import { useOnboarding, useOnboardingDispatch } from '../store/OnboardingContext';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { AgeGateScreen } from '../screens/onboarding/AgeGateScreen';
import { ConcernSelectionScreen } from '../screens/onboarding/ConcernSelectionScreen';
import { ObstacleScreen } from '../screens/onboarding/ObstacleScreen';
import { ExpectationsScreen } from '../screens/onboarding/ExpectationsScreen';
import { GoalTimelineScreen } from '../screens/onboarding/GoalTimelineScreen';
import { GoalLevelScreen } from '../screens/onboarding/GoalLevelScreen';
import { CommitmentScreen } from '../screens/onboarding/CommitmentScreen';
import { GuidedCaptureScreen } from '../screens/onboarding/GuidedCaptureScreen';
import { AnalyzingScreen } from '../screens/onboarding/AnalyzingScreen';
import { RatingScreen } from '../screens/onboarding/RatingScreen';
import { ShareMotivationScreen } from '../screens/onboarding/ShareMotivationScreen';

type Step =
  | 'welcome'
  | 'age'
  | 'concerns'
  | 'obstacle'
  | 'expectations'
  | 'goal_timeline'
  | 'goal_level'
  | 'commitment'
  | 'capture'
  | 'analyzing'
  | 'rating'
  | 'share';

interface Props {
  onComplete: () => void;
}

export function OnboardingNavigator({ onComplete }: Props) {
  const [step, setStep] = useState<Step>('welcome');
  const state = useOnboarding();
  const dispatch = useOnboardingDispatch();
  const insets = useSafeAreaInsets();

  const goTo = useCallback((next: Step) => setStep(next), []);

  const renderStep = () => {
    switch (step) {
      case 'welcome':
        return <WelcomeScreen onStart={() => goTo('age')} />;

      case 'age':
        return (
          <AgeGateScreen
            selected={state.ageRange}
            onSelect={(age) => {
              dispatch({ type: 'SET_AGE', payload: age });
              if (age === 'under17') return;
            }}
            onContinue={() => {
              if (state.ageRange && state.ageRange !== 'under17') goTo('concerns');
            }}
            onUnder17={() => {}}
          />
        );

      case 'concerns':
        return (
          <ConcernSelectionScreen
            selected={state.concerns}
            onToggle={(id) => dispatch({ type: 'TOGGLE_CONCERN', payload: id })}
            onContinue={() => goTo('obstacle')}
          />
        );

      case 'obstacle':
        return (
          <ObstacleScreen
            selected={state.obstacle}
            onSelect={(v) => dispatch({ type: 'SET_OBSTACLE', payload: v })}
            onContinue={() => goTo('expectations')}
          />
        );

      case 'expectations':
        return <ExpectationsScreen onGotIt={() => goTo('goal_timeline')} />;

      case 'goal_timeline':
        return (
          <GoalTimelineScreen
            selected={state.goalTimeline}
            onSelect={(v) => dispatch({ type: 'SET_GOAL_TIMELINE', payload: v })}
            onContinue={() => goTo('goal_level')}
          />
        );

      case 'goal_level':
        return (
          <GoalLevelScreen
            selected={state.goalLevel}
            onSelect={(v) => dispatch({ type: 'SET_GOAL_LEVEL', payload: v })}
            onContinue={() => goTo('commitment')}
          />
        );

      case 'commitment':
        return <CommitmentScreen onContinue={() => goTo('capture')} />;

      case 'capture': {
        const captureStep = state.frontPhoto ? 'profile' : 'front';
        return (
          <GuidedCaptureScreen
            step={captureStep}
            onCapture={(uri) => {
              if (captureStep === 'front') {
                dispatch({ type: 'SET_FRONT_PHOTO', payload: uri });
              } else {
                dispatch({ type: 'SET_PROFILE_PHOTO', payload: uri });
                goTo('analyzing');
              }
            }}
          />
        );
      }

      case 'analyzing':
        return <AnalyzingScreen onComplete={() => goTo('rating')} />;

      case 'rating':
        return <RatingScreen onContinue={() => goTo('share')} />;

      case 'share':
        return <ShareMotivationScreen onContinue={onComplete} />;

      default:
        return null;
    }
  };

  return <View style={[styles.root, { paddingBottom: insets.bottom }]}>{renderStep()}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
