import React, { createContext, useContext, useReducer } from 'react';
import {
  type OnboardingState,
  type OnboardingAction,
  onboardingReducer,
  INITIAL_ONBOARDING,
} from '../types/onboarding';

const OnboardingContext = createContext<OnboardingState>(INITIAL_ONBOARDING);
const OnboardingDispatchContext = createContext<React.Dispatch<OnboardingAction>>(() => {});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, INITIAL_ONBOARDING);
  return (
    <OnboardingContext.Provider value={state}>
      <OnboardingDispatchContext.Provider value={dispatch}>
        {children}
      </OnboardingDispatchContext.Provider>
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}

export function useOnboardingDispatch() {
  return useContext(OnboardingDispatchContext);
}
