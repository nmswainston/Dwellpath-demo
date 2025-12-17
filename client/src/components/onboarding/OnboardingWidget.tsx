import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { 
  Sparkles, 
  PlayCircle, 
  RotateCcw, 
  X,
  ChevronRight,
  Lightbulb
} from 'lucide-react';

export function OnboardingWidget() {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    shouldShowOnboarding,
    existingTour,
    startOnboarding,
    resumeOnboarding,
    skipOnboarding,
  } = useOnboarding();

  // Don't show if user doesn't need onboarding
  if (!shouldShowOnboarding) return null;

  const hasIncompleteTour = existingTour && !existingTour.isCompleted;
  const completedSteps = hasIncompleteTour ? existingTour.currentStep : 0;
  const totalSteps = hasIncompleteTour ? existingTour.totalSteps : 6;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 right-6 z-40 max-w-sm"
    >
      <AnimatePresence>
        {!isExpanded ? (
          <motion.div
            key="collapsed"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <Button
              onClick={() => setIsExpanded(true)}
              className="relative h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg"
              size="sm"
            >
              <Sparkles className="h-6 w-6 text-white" />
              
              {/* Pulsing ring animation */}
              <div className="absolute inset-0 rounded-full bg-blue-400 dark:bg-blue-300 animate-ping opacity-20"></div>
              
              {/* Progress indicator for incomplete tours */}
              {hasIncompleteTour && (
                <div className="absolute -top-1 -right-1">
                  <div className="h-6 w-6 rounded-full bg-white dark:bg-gray-800 border-2 border-blue-600 flex items-center justify-center">
                    <span className="text-xs font-bold text-blue-600">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
              )}
            </Button>
            
            {/* Tooltip */}
              <div className="absolute bottom-16 right-0 mb-2 opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                {hasIncompleteTour ? 'Continue configuration' : 'Begin profile configuration'}
                <div className="absolute top-full right-4 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border dark:border-gray-700 overflow-hidden"
          >
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="absolute top-2 right-2 h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center space-x-2 mb-2">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-semibold">
                  {hasIncompleteTour ? 'Continue Configuration' : 'Welcome to Dwellpath'}
                </h3>
              </div>
              
              <p className="text-sm text-blue-100">
                {hasIncompleteTour 
                  ? 'Resume your residency profile configuration'
                  : "We'll configure Dwellpath for your residency profile with personalized guidance"
                }
              </p>
              
              {hasIncompleteTour && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-blue-100 mb-1">
                    <span>Progress</span>
                    <span>{completedSteps} of {totalSteps} steps</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-blue-800" />
                </div>
              )}
            </div>
            
            <CardContent className="p-4 space-y-4">
              {hasIncompleteTour ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <Lightbulb className="h-4 w-4 text-yellow-500" />
                    <span>Personalized recommendations available</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={resumeOnboarding}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continue Configuration
                    </Button>
                    
                    <Button 
                      onClick={skipOnboarding}
                      variant="outline"
                      size="sm"
                      className="text-gray-600 dark:text-gray-300"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Badge variant="secondary" className="text-xs">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI-Powered
                    </Badge>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <ul className="space-y-1">
                        <li className="flex items-center space-x-2">
                          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                          <span>Personalized tax strategies</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                          <span>Feature recommendations</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <div className="h-1.5 w-1.5 bg-blue-500 rounded-full"></div>
                          <span>Compliance guidance</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      onClick={startOnboarding}
                      className="flex-1"
                      size="sm"
                    >
                      Begin Configuration
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                    
                    <Button 
                      onClick={skipOnboarding}
                      variant="outline"
                      size="sm"
                    >
                      Skip
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Personalized guidance • 2-3 minutes
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}