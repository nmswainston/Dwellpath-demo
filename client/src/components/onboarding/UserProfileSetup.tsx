import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  MapPin, 
  DollarSign, 
  Target, 
  AlertTriangle,
  Smartphone,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const userProfileSchema = z.object({
  userType: z.enum(['snowbird', 'remote-worker', 'property-owner', 'frequent-traveler']),
  primaryState: z.string().min(1, 'Primary state is required'),
  secondaryState: z.string().optional(),
  netWorthRange: z.enum(['under-1m', '1m-5m', '5m-10m', 'over-10m']),
  riskTolerance: z.enum(['conservative', 'medium', 'aggressive']),
  currentChallenges: z.array(z.string()).min(1, 'Select at least one challenge'),
  goals: z.array(z.string()).min(1, 'Select at least one goal'),
  techSavviness: z.enum(['beginner', 'intermediate', 'advanced']),
});

type UserProfile = z.infer<typeof userProfileSchema>;

interface UserProfileSetupProps {
  onComplete: (profile: UserProfile) => void;
  onBack?: () => void;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const USER_TYPES = [
  {
    value: 'snowbird',
    label: 'Seasonal Homeowner',
    description: 'Split time between warm/cold climates seasonally',
    icon: '🦅'
  },
  {
    value: 'remote-worker',
    label: 'Remote Worker',
    description: 'Work remotely and travel frequently',
    icon: '💻'
  },
  {
    value: 'property-owner',
    label: 'Property Owner',
    description: 'Own properties in multiple states',
    icon: '🏠'
  },
  {
    value: 'frequent-traveler',
    label: 'Frequent Traveler',
    description: 'Travel extensively for business or pleasure',
    icon: '✈️'
  }
];

const CHALLENGES = [
  'Tracking days in each state accurately',
  'Understanding 183-day rules',
  'Managing tax liability across states',
  'Keeping organized records for audits',
  'Maintaining compliance clarity',
  'Planning optimal travel schedules',
  'Understanding domicile requirements',
  'Coordinating with accountants/CPAs'
];

const GOALS = [
  'Minimize state income tax liability',
  'Maintain audit-ready documentation',
  'Optimize travel and residency schedules',
  'Optimize tax residency strategy',
  'Simplify tax preparation process',
  'Peace of mind about compliance',
  'Professional CPA coordination',
  'Real-time compliance monitoring'
];

export function UserProfileSetup({ onComplete, onBack }: UserProfileSetupProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 5;

  const form = useForm<UserProfile>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      currentChallenges: [],
      goals: [],
    },
  });

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Validate and submit
      form.handleSubmit(onComplete)();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step-0"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <User className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Residency Profile Type</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Select the profile that best describes your residency situation
              </p>
            </div>
            
            <FormField
              control={form.control}
              name="userType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      {USER_TYPES.map((type) => (
                        <div key={type.value} className="flex items-center space-x-3 p-4 border border-border rounded-xl hover:bg-muted/50 transition-colors bg-card shadow-sm">
                          <RadioGroupItem value={type.value} id={type.value} />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{type.icon}</span>
                              <label htmlFor={type.value} className="font-medium cursor-pointer">
                                {type.label}
                              </label>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              {type.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="step-1"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Primary State of Residence</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Specify your primary tax domicile state
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="primaryState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary State</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your primary state" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondaryState"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary State (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select secondary state if applicable" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Financial Profile</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Configure recommendations tailored to your financial profile
              </p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="netWorthRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Net Worth Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under-1m">Under $1M</SelectItem>
                        <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                        <SelectItem value="5m-10m">$5M - $10M</SelectItem>
                        <SelectItem value="over-10m">Over $10M</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="riskTolerance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monitoring Preference</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="conservative" id="conservative" />
                          <label htmlFor="conservative" className="cursor-pointer">
                            Comprehensive - Enhanced monitoring and proactive guidance
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <label htmlFor="medium" className="cursor-pointer">
                            Standard - Balance optimization with compliance clarity
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="aggressive" id="aggressive" />
                          <label htmlFor="aggressive" className="cursor-pointer">
                            Essential - Essential monitoring with maximum flexibility
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step-3"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Residency Management Priorities</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Select areas where you seek clarity and guidance (Select all that apply)
              </p>
            </div>

            <FormField
              control={form.control}
              name="currentChallenges"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 gap-3">
                    {CHALLENGES.map((challenge) => (
                      <FormField
                        key={challenge}
                        control={form.control}
                        name="currentChallenges"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={challenge}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(challenge)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, challenge])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== challenge
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {challenge}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step-4"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <div className="text-center">
              <Target className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h3 className="text-xl font-semibold mb-2">Residency Objectives</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Select your residency management objectives (Select all that apply)
              </p>
            </div>

            <FormField
              control={form.control}
              name="goals"
              render={() => (
                <FormItem>
                  <div className="grid grid-cols-1 gap-3">
                    {GOALS.map((goal) => (
                      <FormField
                        key={goal}
                        control={form.control}
                        name="goals"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={goal}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(goal)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, goal])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== goal
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                {goal}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="techSavviness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technology Comfort Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your comfort level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner - Keep it simple</SelectItem>
                      <SelectItem value="intermediate">Intermediate - Some advanced features</SelectItem>
                      <SelectItem value="advanced">Advanced - Show me everything</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        );

      default:
        return null;
    }
  };

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Card className="max-w-2xl mx-auto border border-border bg-card">
      {/* Step Indicator - Top of Modal */}
      <div className="px-6 pt-6 pb-0 mb-2">
        <span className="text-sm font-semibold text-[#F5F3E7]/50 font-body tracking-wide">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>

      <CardHeader className="pt-8">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Profile Setup</span>
          </CardTitle>
        </div>
        <Progress value={progressPercentage} className="mt-2" />
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onComplete)} className="space-y-6">
            <div className="min-h-[400px]">
              {renderStep()}
            </div>
            
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0 && !onBack}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {currentStep === 0 ? 'Back' : 'Previous'}
              </Button>
              
              <Button
                type="button"
                onClick={handleNext}
              >
                {currentStep === totalSteps - 1 ? 'Complete Configuration' : 'Next'}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}