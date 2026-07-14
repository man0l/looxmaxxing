import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';
import {
  type OnboardingState,
  type OnboardingAction,
  onboardingReducer,
  INITIAL_ONBOARDING,
} from '../types/onboarding';
import { clearRenderCache } from '../services/renderCache';
import { loadJson, saveJson, STORAGE_KEYS } from '../services/storage';

const OnboardingContext = createContext<OnboardingState>(INITIAL_ONBOARDING);
const OnboardingDispatchContext = createContext<React.Dispatch<OnboardingAction>>(() => {});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(onboardingReducer, INITIAL_ONBOARDING);
  const [hydrated, setHydrated] = React.useState(false);

  const dispatchWithEffects = useCallback((action: OnboardingAction) => {
    if (action.type === 'CLEAR_PHOTOS') {
      void clearRenderCache();
    }
    dispatch(action);
  }, []);

  useEffect(() => {
    loadJson<OnboardingState>(STORAGE_KEYS.onboarding).then((saved) => {
      if (saved) dispatch({ type: 'HYDRATE', payload: saved });
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveJson(STORAGE_KEYS.onboarding, state);
  }, [state, hydrated]);

  return (
    <OnboardingContext.Provider value={state}>
      <OnboardingDispatchContext.Provider value={dispatchWithEffects}>
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