import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  DietaryRestriction,
  LanguageCode,
  PersonalizationProfile,
  TravelStyle,
} from '@wanderai/shared';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type PreferencesState = PersonalizationProfile & {
  onboardingComplete: boolean;
  setPreferredLanguage: (language: LanguageCode) => void;
  toggleDietaryRestriction: (restriction: DietaryRestriction) => void;
  setTravelStyle: (style: TravelStyle) => void;
  setTastePreference: (
    key: 'spicyPreference' | 'sweetPreference' | 'savoryPreference',
    value: number,
  ) => void;
  completeOnboarding: () => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      preferredLanguage: 'en',
      dietaryRestrictions: [],
      travelStyle: 'local',
      spicyPreference: 3,
      sweetPreference: 3,
      savoryPreference: 3,
      onboardingComplete: false,
      setPreferredLanguage: (language) => set({ preferredLanguage: language }),
      toggleDietaryRestriction: (restriction) =>
        set((state) => ({
          dietaryRestrictions: state.dietaryRestrictions.includes(restriction)
            ? state.dietaryRestrictions.filter((value) => value !== restriction)
            : [...state.dietaryRestrictions, restriction],
        })),
      setTravelStyle: (style) => set({ travelStyle: style }),
      setTastePreference: (key, value) => set({ [key]: value }),
      completeOnboarding: () => set({ onboardingComplete: true }),
    }),
    {
      name: 'wanderai-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
