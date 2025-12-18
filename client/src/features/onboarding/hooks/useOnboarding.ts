import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '@/lib/apiClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { DEV_MODE } from '@/lib/config/dev';
import type { OnboardingTour as OnboardingTourModel } from '@shared/schema';

export interface UserProfile {
  userType: 'snowbird' | 'remote-worker' | 'property-owner' | 'frequent-traveler';
  primaryState: string;
  secondaryState?: string;
  netWorthRange: 'under-1m' | '1m-5m' | '5m-10m' | 'over-10m';
  riskTolerance: 'conservative' | 'medium' | 'aggressive';
  currentChallenges: string[];
  goals: string[];
  techSavviness: 'beginner' | 'intermediate' | 'advanced';
}

export function useOnboarding() {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();

  // Check if user needs onboarding
  const { data: existingTour, isLoading: isTourLoading } = useQuery<OnboardingTourModel | null>({
    queryKey: ['/api/onboarding/tour'],
    enabled: isAuthenticated,
  });

  // Start tour mutation
  const startTourMutation = useMutation({
    mutationFn: async (userProfile: UserProfile) => {
      return onboardingApi.startTour(userProfile, "initial");
    },
    onSuccess: () => {
      setIsProfileSetupOpen(false);
      setIsOnboardingOpen(true);
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/tour'] });
      toast({
        title: "Configuration Started",
        description: "We'll configure Dwellpath for your residency profile with personalized recommendations",
      });
    },
    onError: (error) => {
      toast({
        title: "Configuration Error",
        description: "An error occurred while starting configuration. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Determine if onboarding should be shown
  useEffect(() => {
    // Dev mode: force onboarding to show
    if (DEV_MODE) {
      setShouldShowOnboarding(true);
      return;
    }

    if (isAuthenticated && !isTourLoading && !existingTour) {
      // Check if user is new (you could add a flag to the user model)
      const userCreatedDate = user?.createdAt ? new Date(user.createdAt) : new Date();
      const isNewUser = Date.now() - userCreatedDate.getTime() < 24 * 60 * 60 * 1000; // Within 24 hours
      
      if (isNewUser) {
        setShouldShowOnboarding(true);
        // Auto-show profile setup for new users
        setIsProfileSetupOpen(true);
      }
    } else if (existingTour && !existingTour.isCompleted) {
      // Resume existing incomplete tour
      setShouldShowOnboarding(true);
    }
  }, [isAuthenticated, isTourLoading, existingTour, user]);

  const startOnboarding = () => {
    setIsProfileSetupOpen(true);
  };

  const resumeOnboarding = () => {
    if (existingTour && !existingTour.isCompleted) {
      setIsOnboardingOpen(true);
    } else {
      setIsProfileSetupOpen(true);
    }
  };

  const completeProfileSetup = (userProfile: UserProfile) => {
    startTourMutation.mutate(userProfile);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    setIsProfileSetupOpen(false);
    setShouldShowOnboarding(false);
  };

  const skipOnboarding = () => {
    closeOnboarding();
      toast({
        title: "Configuration Skipped",
        description: "You can restart the configuration process anytime from settings",
      });
  };

  return {
    // State
    isOnboardingOpen,
    isProfileSetupOpen,
    shouldShowOnboarding,
    existingTour,
    isLoading: isTourLoading || startTourMutation.isPending,
    
    // Actions
    startOnboarding,
    resumeOnboarding,
    completeProfileSetup,
    closeOnboarding,
    skipOnboarding,
    
    // Setters
    setIsOnboardingOpen,
    setIsProfileSetupOpen,
  };
}