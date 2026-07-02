export type AgeRange = 'under17' | '18-24' | '25-34' | '35-44' | '45+';

export interface Concern {
  id: string;
  label: string;
  icon: string;
}

export const CONCERNS: Concern[] = [
  { id: 'jawline', label: 'Sharper jawline', icon: 'triangle' },
  { id: 'cheekbones', label: 'Defined cheekbones', icon: 'sparkles' },
  { id: 'skin', label: 'Better skin', icon: 'droplet' },
  { id: 'hair', label: 'Fuller-looking hair', icon: 'scissors' },
  { id: 'masculinity', label: 'Masculine presence', icon: 'barbell' },
  { id: 'smile', label: 'Attractive smile', icon: 'smile' },
  { id: 'eyes', label: 'Eye area', icon: 'eye' },
];

export type ObstacleAnswer =
  | 'no_direction'
  | 'no_routine'
  | 'didnt_work'
  | 'just_discovered';

export type GoalTimeline =
  | '2_weeks'
  | '1_month'
  | '3_months'
  | 'just_know';

export type GoalLevel = 'mtn' | 'htn' | 'chadlite' | 'chad';

export type DepthAnswer = 'recently' | 'a_while' | 'years';

export interface OnboardingState {
  ageRange: AgeRange | null;
  concerns: string[];
  obstacle: ObstacleAnswer | null;
  goalTimeline: GoalTimeline | null;
  goalLevel: GoalLevel | null;
  depthAnswer: DepthAnswer | null;
  frontPhoto: string | null;
  profilePhoto: string | null;
}

export const INITIAL_ONBOARDING: OnboardingState = {
  ageRange: null,
  concerns: [],
  obstacle: null,
  goalTimeline: null,
  goalLevel: null,
  depthAnswer: null,
  frontPhoto: null,
  profilePhoto: null,
};

export type OnboardingAction =
  | { type: 'SET_AGE'; payload: AgeRange }
  | { type: 'TOGGLE_CONCERN'; payload: string }
  | { type: 'SET_OBSTACLE'; payload: ObstacleAnswer }
  | { type: 'SET_GOAL_TIMELINE'; payload: GoalTimeline }
  | { type: 'SET_GOAL_LEVEL'; payload: GoalLevel }
  | { type: 'SET_DEPTH'; payload: DepthAnswer }
  | { type: 'SET_FRONT_PHOTO'; payload: string }
  | { type: 'SET_PROFILE_PHOTO'; payload: string }
  | { type: 'CLEAR_PHOTOS' }
  | { type: 'RESET' }
  | { type: 'HYDRATE'; payload: OnboardingState };

export function onboardingReducer(
  state: OnboardingState,
  action: OnboardingAction,
): OnboardingState {
  switch (action.type) {
    case 'SET_AGE':
      return { ...state, ageRange: action.payload };
    case 'TOGGLE_CONCERN': {
      const exists = state.concerns.includes(action.payload);
      if (exists) {
        return { ...state, concerns: state.concerns.filter((c) => c !== action.payload) };
      }
      if (state.concerns.length >= 3) return state;
      return { ...state, concerns: [...state.concerns, action.payload] };
    }
    case 'SET_OBSTACLE':
      return { ...state, obstacle: action.payload };
    case 'SET_GOAL_TIMELINE':
      return { ...state, goalTimeline: action.payload };
    case 'SET_GOAL_LEVEL':
      return { ...state, goalLevel: action.payload };
    case 'SET_DEPTH':
      return { ...state, depthAnswer: action.payload };
    case 'SET_FRONT_PHOTO':
      return { ...state, frontPhoto: action.payload };
    case 'SET_PROFILE_PHOTO':
      return { ...state, profilePhoto: action.payload };
    case 'CLEAR_PHOTOS':
      return { ...state, frontPhoto: null, profilePhoto: null };
    case 'RESET':
      return INITIAL_ONBOARDING;
    case 'HYDRATE':
      return action.payload;
  }
}
