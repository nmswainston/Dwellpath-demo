import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { onboardingApi } from '@/lib/apiClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Lightbulb, 
  Target, 
  AlertTriangle,
  CheckCircle,
  Sparkles,
  MapPin
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  stepNumber: number;
  stepType: string;
  title: string;
  description: string;
  content: any;
  targetElement?: string;
  isCompleted: boolean;
  completedAt?: string;
}

interface OnboardingTour {
  id: string;
  tourType: string;
  totalSteps: number;
  currentStep: number;
  isCompleted: boolean;
  personalizedRecommendations: any[];
  userProfile: any;
}

interface Recommendation {
  id: string;
  type: 'feature' | 'strategy' | 'warning' | 'tip';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  estimatedValue?: string;
  timeToImplement?: string;
  relatedFeatures: string[];
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile?: any;
}

export function OnboardingTour({ isOpen, onClose, userProfile }: OnboardingTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [tourData, setTourData] = useState<OnboardingTour | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing tour or start new one
  const { data: existingTour } = useQuery({
    queryKey: ['/api/onboarding/tour'],
    enabled: isOpen,
  });

  const { data: steps } = useQuery({
    queryKey: ['/api/onboarding/tour/steps', tourData?.id],
    enabled: !!tourData?.id,
    queryFn: () => onboardingApi.getSteps(tourData!.id),
  });

  // Start new tour mutation
  const startTourMutation = useMutation({
    mutationFn: async (profile: any) => {
      return onboardingApi.startTour(profile, "initial");
    },
    onSuccess: (data: any) => {
      setTourData(data.tour);
      setCurrentStepIndex(0);
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/tour'] });
    },
    onError: (error) => {
      toast({
        title: "Error starting tour",
        description: "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Complete step mutation
  const completeStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      return onboardingApi.completeStep(stepId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/onboarding/tour'] });
    },
  });

  // Initialize tour when opened
  useEffect(() => {
    if (isOpen && !existingTour && userProfile) {
      startTourMutation.mutate(userProfile);
    } else if (existingTour) {
      setTourData(existingTour);
      setCurrentStepIndex(existingTour.currentStep || 0);
    }
  }, [isOpen, existingTour, userProfile]);

  const currentStep = steps && Array.isArray(steps) ? steps[currentStepIndex] : undefined;
  const progressPercentage = tourData ? ((currentStepIndex + 1) / tourData.totalSteps) * 100 : 0;

  const handleNext = () => {
    if (currentStep && !currentStep.isCompleted) {
      completeStepMutation.mutate(currentStep.id);
    }
    
    if (currentStepIndex < (Array.isArray(steps) ? steps.length : 0) - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Tour completed
      toast({
        title: "Configuration Complete",
        description: "Your residency profile is configured and ready for tracking.",
      });
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    onClose();
      toast({
        title: "Tour Skipped",
        description: "You can restart the configuration tour anytime from settings.",
      });
  };

  const getStepIcon = (stepType: string) => {
    const iconSize = "h-9 w-9"; // 36px (between 32-40px)
    const iconClasses = `${iconSize} text-brand-text-light dark:text-[#F5F3E7]`;
    const containerClasses = "relative flex items-center justify-center rounded-full";
    const backgroundClasses = "absolute inset-0 rounded-full bg-[rgba(245,243,231,0.08)]";
    const glowClasses = "absolute inset-0 rounded-full shadow-[0_0_6px_rgba(245,243,231,0.12)] dark:shadow-[0_0_10px_rgba(245,243,231,0.18)]";
    
    const IconWrapper = ({ children }: { children: ReactNode }) => (
      <div className={cn(containerClasses, "onboarding-icon-wrap")}>
        <div className={backgroundClasses} />
        <div className={glowClasses} />
        <div className="relative z-10 flex items-center justify-center">
          {children}
        </div>
      </div>
    );

    switch (stepType) {
      case 'welcome': 
        return (
          <IconWrapper>
            <Sparkles className={iconClasses} strokeWidth={1.5} />
          </IconWrapper>
        );
      case 'profile_setup': 
        return (
          <IconWrapper>
            <Target className={iconClasses} strokeWidth={1.5} />
          </IconWrapper>
        );
      case 'feature_intro': 
        return (
          <IconWrapper>
            <MapPin className={iconClasses} strokeWidth={1.5} />
          </IconWrapper>
        );
      case 'recommendation': 
        return (
          <IconWrapper>
            <Lightbulb className={iconClasses} strokeWidth={1.5} />
          </IconWrapper>
        );
      case 'completion': 
        return (
          <IconWrapper>
            <CheckCircle className={iconClasses} strokeWidth={1.5} />
          </IconWrapper>
        );
      default: 
        return (
          <IconWrapper>
            <ChevronRight className={iconClasses} strokeWidth={1.5} />
          </IconWrapper>
        );
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'feature': return <Sparkles className="h-4 w-4" />;
      case 'strategy': return <Target className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'tip': return <Lightbulb className="h-4 w-4" />;
      default: return <ChevronRight className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-brand-bg-light/50 text-brand-text-light dark:bg-brand-bg-dark/50 dark:text-brand-text-dark';
      case 'medium': return 'bg-brand-bg-light/30 text-brand-text-light dark:bg-brand-bg-dark/30 dark:text-brand-text-dark';
      case 'low': return 'bg-brand-bg-light text-brand-text-light dark:bg-brand-bg-dark dark:text-brand-text-dark';
      default: return 'bg-brand-bg-light text-brand-text-light dark:bg-brand-bg-dark dark:text-brand-text-dark';
    }
  };

  const renderStepContent = (step: OnboardingStep) => {
    switch (step.stepType) {
      case 'welcome':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto mb-4 w-16 h-16 bg-brand-bg-light/50 dark:bg-brand-bg-dark/50 rounded-full flex items-center justify-center"
              >
                <Sparkles className="h-8 w-8 text-brand-text-light dark:text-brand-text-dark" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2">{step.content?.message}</h3>
              <div className="space-y-2">
                {step.content?.keyPoints?.map((point: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center space-x-2 text-sm text-brand-text-light/70 dark:text-brand-text-dark/70"
                  >
                    <CheckCircle className="h-4 w-4 text-brand-primary" />
                    <span>{point}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'recommendation':
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Personalized Recommendations</h3>
              <p className="text-sm text-brand-text-light/70 dark:text-brand-text-dark/70">
                Based on your residency profile, here are tailored insights for your situation
              </p>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {step.content?.recommendations?.map((rec: Recommendation, index: number) => (
                <motion.div
                  key={rec.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-l-4 border-l-brand-bg-dark">
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getRecommendationIcon(rec.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="text-sm font-semibold">{rec.title}</h4>
                            <Badge className={getPriorityColor(rec.priority)}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-brand-text-light/70 dark:text-brand-text-dark/70 mb-2">
                            {rec.description}
                          </p>
                          {rec.estimatedValue && (
                            <p className="text-xs font-medium text-brand-primary dark:text-brand-accent">
                              💰 {rec.estimatedValue}
                            </p>
                          )}
                          {rec.actionItems && rec.actionItems.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium mb-1">Next steps:</p>
                              <ul className="text-xs space-y-1">
                                {rec.actionItems.slice(0, 2).map((item, idx) => (
                                  <li key={idx} className="flex items-center space-x-1">
                                    <span className="w-1 h-1 bg-brand-bg-dark/50 rounded-full"></span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'feature_intro':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-brand-text-light/70 dark:text-brand-text-dark/70 mb-4">
                {step.description}
              </p>
            </div>
            {step.content?.features && (
              <div className="space-y-2">
                {step.content.features.map((feature: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-brand-bg-light/30 dark:bg-brand-bg-dark/30"
                  >
                    <MapPin className="h-4 w-4 text-brand-text-light dark:text-brand-text-dark" />
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>
            )}
            {step.content?.setupTasks && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Quick setup tasks:</p>
                {step.content.setupTasks.map((task: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-2 p-2 rounded-lg bg-brand-bg-light/30 dark:bg-brand-bg-dark/30"
                  >
                    <CheckCircle className="h-4 w-4 text-brand-text-light dark:text-brand-text-dark" />
                    <span className="text-sm">{task}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      case 'completion':
        return (
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-brand-bg-light dark:bg-brand-bg-dark rounded-full flex items-center justify-center"
            >
              <CheckCircle className="h-8 w-8 text-brand-primary dark:text-brand-accent" />
            </motion.div>
            <h3 className="text-lg font-semibold">Configuration Complete</h3>
            <p className="text-sm text-brand-text-light/70 dark:text-brand-text-dark/70">
              Your residency profile is configured. Begin tracking your residency with clarity and confidence.
            </p>
            {step.content?.nextSteps && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Recommended next steps:</p>
                {step.content.nextSteps.map((step: string, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-sm text-brand-text-light/70 dark:text-brand-text-dark/70"
                  >
                    {index + 1}. {step}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
            <p className="text-sm text-brand-text-light/70 dark:text-brand-text-dark/70">
              {step.description}
            </p>
          </div>
        );
    }
  };

  if (!isOpen || !currentStep) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overlay-backdrop"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden border bg-card border-border"
        >
          {/* Step Indicator - Top of Modal */}
          <div className="px-4 pt-4 pb-0 mb-2">
            <span className="text-sm font-semibold text-[#F5F3E7]/50 font-body tracking-wide">
              Step {currentStepIndex + 1} of {tourData?.totalSteps}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 pt-6 border-b dark:border-border">
            <div className="flex items-center space-x-3">
              {getStepIcon(currentStep.stepType)}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4">
            <Progress value={progressPercentage} className="mb-4" />
            
            <motion.div
              key={currentStepIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-[300px]"
            >
              {renderStepContent(currentStep)}
            </motion.div>
          </div>

          <div className="flex items-center justify-between p-4 border-t dark:border-border bg-brand-bg-light/30 dark:bg-brand-bg-dark/30">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-brand-text-light/60 hover:text-brand-text-light dark:text-brand-text-dark/60 dark:hover:text-brand-text-dark"
            >
              Skip tour
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStepIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                onClick={handleNext}
                size="sm"
                disabled={completeStepMutation.isPending}
              >
                {currentStepIndex === (Array.isArray(steps) ? steps.length : 0) - 1 ? 'Complete' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}