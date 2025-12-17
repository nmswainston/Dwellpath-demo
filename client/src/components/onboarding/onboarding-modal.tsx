import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  Receipt,
  BookOpen,
  Bot,
  Snowflake,
  CheckCircle,
  AlertTriangle,
  Users,
  Building,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/lib/apiClient";

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

const USER_TYPES = [
  {
    id: "snowbird",
    label: "Seasonal Homeowner",
    description: "Split time between states seasonally",
    icon: Snowflake,
  },
  {
    id: "remote-worker",
    label: "Remote Worker",
    description: "Work from different locations",
    icon: Users,
  },
  {
    id: "property-owner",
    label: "Property Owner",
    description: "Own homes in multiple states",
    icon: Building,
  },
  {
    id: "frequent-traveler",
    label: "Frequent Traveler",
    description: "Travel extensively for work/leisure",
    icon: Plane,
  },
];

const ONBOARDING_STEPS = [
  {
    id: "welcome",
    title: "Welcome to Dwellpath",
    description: "We’ll configure Dwellpath for your residency profile.",
  },
  {
    id: "profile",
    title: "Configure Profile",
    description: "Tell us how you use your homes and where you spend time.",
  },
  {
    id: "states",
    title: "Primary States",
    description: "Set your primary and secondary states of residence.",
  },
  {
    id: "preferences",
    title: "Preferences",
    description: "Tune tracking and guidance to your comfort level.",
  },
  {
    id: "features",
    title: "Feature Tour",
    description: "Preview the tools you’ll use every day.",
  },
  {
    id: "complete",
    title: "Configuration Complete",
    description: "You’re ready to start tracking and proving residency.",
  },
];

interface OnboardingData {
  userType: string;
  firstName: string;
  lastName: string;
  primaryState: string;
  secondaryState: string;
  taxYear: string;
  notifications: boolean;
  riskTolerance: string;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({
  isOpen,
  onComplete,
}: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userType: "",
    firstName: "",
    lastName: "",
    primaryState: "",
    secondaryState: "",
    taxYear: "2024",
    notifications: true,
    riskTolerance: "medium",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // NEW: local open state that follows the prop
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setOpen(false);      // close the dialog locally
    onComplete();        // let the parent know onboarding finished
  };

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // In demo mode we never call a backend.
      await userApi.completeOnboarding(onboardingData);

      toast({
        title: "Configuration Complete",
        description: "Your residency profile has been configured successfully.",
      });

      // CLOSE HERE
      handleClose();
    } catch (error) {
      console.error("Onboarding error:", error);
      toast({
        title: "Configuration Error",
        description:
          "An error occurred while configuring your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateData = (field: keyof OnboardingData, value: any) => {
    setOnboardingData((prev) => ({ ...prev, [field]: value }));
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Profile
        return (
          onboardingData.userType &&
          onboardingData.firstName &&
          onboardingData.lastName
        );
      case 2: // States
        return onboardingData.primaryState && onboardingData.secondaryState;
      case 3: // Preferences
        return onboardingData.taxYear && onboardingData.riskTolerance;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="flex flex-col items-center text-center gap-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#0B1D3A] border border-[#F5F3E7]/20 flex items-center justify-center">
                <Snowflake className="w-7 h-7 text-[#F5F3E7]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-[#F5F3E7]">
                  Welcome to Dwellpath
                </h3>
                <p className="text-sm sm:text-base text-[#F5F3E7]/80 font-body max-w-md">
                  Track where you live, prove where you belong, and protect your
                  residency story with clarity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div className="p-4 text-left rounded-xl border border-[#F5F3E7]/14 bg-[#101418]">
                <Calendar className="w-6 h-6 text-[#F5F3E7] mb-2" />
                <h4 className="font-semibold text-sm text-[#F5F3E7]">
                  Track Days
                </h4>
                <p className="text-xs text-[#F5F3E7]/70">
                  Monitor days in each state with clear 183-day insights.
                </p>
              </div>
              <div className="p-4 text-left rounded-xl border border-[#F5F3E7]/14 bg-[#101418]">
                <Receipt className="w-6 h-6 text-[#F5F3E7] mb-2" />
                <h4 className="font-semibold text-sm text-[#F5F3E7]">
                  Log Expenses
                </h4>
                <p className="text-xs text-[#F5F3E7]/70">
                  Tie key expenses to locations for a stronger residency story.
                </p>
              </div>
              <div className="p-4 text-left rounded-xl border border-[#F5F3E7]/14 bg-[#101418]">
                <Bot className="w-6 h-6 text-[#F5F3E7] mb-2" />
                <h4 className="font-semibold text-sm text-[#F5F3E7]">
                  AI Assistant
                </h4>
                <p className="text-xs text-[#F5F3E7]/70">
                  Ask Dwellpath AI for guidance as your situation evolves.
                </p>
              </div>
              <div className="p-4 text-left rounded-xl border border-[#F5F3E7]/14 bg-[#101418]">
                <BookOpen className="w-6 h-6 text-[#F5F3E7] mb-2" />
                <h4 className="font-semibold text-sm text-[#F5F3E7]">
                  Secure Journal
                </h4>
                <p className="text-xs text-[#F5F3E7]/70">
                  Keep a clean record of travel, ties, and decisions.
                </p>
              </div>
            </div>
          </div>
        );

      case 1: // Profile
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-[#F5F3E7]">
                Configure your profile
              </h3>
              <p className="text-sm sm:text-base text-[#F5F3E7]/80 font-body max-w-md mx-auto">
                Tell us how you use your homes so we can tailor tracking and
                guidance.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wide text-[#F5F3E7]/70 mb-2 block">
                  What best describes you?
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {USER_TYPES.map((type) => (
                    <Card
                      key={type.id}
                      className={cn(
                        "cursor-pointer transition-all duration-200 rounded-xl border bg-[#101418]",
                        onboardingData.userType === type.id
                          ? "border-[#F5F3E7] bg-[#0B1D3A]"
                          : "border-[#F5F3E7]/12 hover:border-[#F5F3E7]/40"
                      )}
                      onClick={() => updateData("userType", type.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            onboardingData.userType === type.id
                              ? "bg-[#F5F3E7] text-[#0B1D3A]"
                              : "bg-white/5 text-[#F5F3E7]/80"
                          )}
                        >
                          <type.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm text-[#F5F3E7]">
                            {type.label}
                          </h4>
                          <p className="text-xs text-[#F5F3E7]/70 truncate">
                            {type.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm text-[#F5F3E7]">
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    value={onboardingData.firstName}
                    onChange={(e) => updateData("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    className="mt-1 bg-[#101418] border-[#F5F3E7]/20 text-[#F5F3E7]"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm text-[#F5F3E7]">
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    value={onboardingData.lastName}
                    onChange={(e) => updateData("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    className="mt-1 bg-[#101418] border-[#F5F3E7]/20 text-[#F5F3E7]"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // States
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-[#F5F3E7]">
                Configure your states
              </h3>
              <p className="text-sm sm:text-base text-[#F5F3E7]/80 font-body max-w-md mx-auto">
                Set your primary and secondary states so we can monitor key
                thresholds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label className="text-sm text-[#F5F3E7] mb-2 block">
                  Primary state
                </Label>
                <Select
                  value={onboardingData.primaryState}
                  onValueChange={(value) => updateData("primaryState", value)}
                >
                  <SelectTrigger className="bg-[#101418] border-[#F5F3E7]/20 text-[#F5F3E7]">
                    <SelectValue placeholder="Select primary state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#F5F3E7]/60 mt-1">
                  Where you are most anchored today.
                </p>
              </div>

              <div>
                <Label className="text-sm text-[#F5F3E7] mb-2 block">
                  Secondary state
                </Label>
                <Select
                  value={onboardingData.secondaryState}
                  onValueChange={(value) => updateData("secondaryState", value)}
                >
                  <SelectTrigger className="bg-[#101418] border-[#F5F3E7]/20 text-[#F5F3E7]">
                    <SelectValue placeholder="Select secondary state" />
                  </SelectTrigger>
                  <SelectContent>
                    {US_STATES.filter(
                      (state) => state !== onboardingData.primaryState
                    ).map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-[#F5F3E7]/60 mt-1">
                  The other state that matters most for tax purposes.
                </p>
              </div>
            </div>

            {onboardingData.primaryState && onboardingData.secondaryState && (
              <div className="p-4 rounded-xl border border-[#F5F3E7]/14 bg-[#101418]">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-[#F5F3E7]" />
                  <span className="text-sm font-medium text-[#F5F3E7]">
                    States configured
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#F5F3E7]/75">
                  Dwellpath will monitor your days between{" "}
                  <strong>{onboardingData.primaryState}</strong> and{" "}
                  <strong>{onboardingData.secondaryState}</strong> so you can
                  stay ahead of 183-day and related rules.
                </p>
              </div>
            )}
          </div>
        );

      case 3: // Preferences
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-[#F5F3E7]">
                Set preferences
              </h3>
              <p className="text-sm sm:text-base text-[#F5F3E7]/80 font-body max-w-md mx-auto">
                Choose your tax year and how assertively you want Dwellpath to
                monitor and nudge you.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <Label className="text-sm text-[#F5F3E7] mb-2 block">
                  Tax year
                </Label>
                <Select
                  value={onboardingData.taxYear}
                  onValueChange={(value) => updateData("taxYear", value)}
                >
                  <SelectTrigger className="bg-[#101418] border-[#F5F3E7]/20 text-[#F5F3E7]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-[#F5F3E7] mb-3 block">
                  Monitoring style
                </Label>
                <div className="space-y-3">
                  {[
                    {
                      value: "conservative",
                      label: "Comprehensive",
                      description:
                        "Enhanced monitoring, early alerts, and more proactive guidance.",
                    },
                    {
                      value: "medium",
                      label: "Standard",
                      description:
                        "Balanced monitoring with clear alerts at key thresholds.",
                    },
                    {
                      value: "aggressive",
                      label: "Essential",
                      description:
                        "Lean alerts that keep you informed with maximum flexibility.",
                    },
                  ].map((option) => (
                    <Card
                      key={option.value}
                      className={cn(
                        "cursor-pointer transition-all duration-200 rounded-xl border bg-[#101418]",
                        onboardingData.riskTolerance === option.value
                          ? "border-[#F5F3E7] bg-[#0B1D3A]"
                          : "border-[#F5F3E7]/12 hover:border-[#F5F3E7]/40"
                      )}
                      onClick={() =>
                        updateData("riskTolerance", option.value)
                      }
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div>
                          <h4 className="font-semibold text-sm text-[#F5F3E7]">
                            {option.label}
                          </h4>
                          <p className="text-xs text-[#F5F3E7]/70">
                            {option.description}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2",
                            onboardingData.riskTolerance === option.value
                              ? "bg-[#F5F3E7] border-[#F5F3E7]"
                              : "border-[#F5F3E7]/40"
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4: // Features Tour
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-[#F5F3E7]">
                Dwellpath capabilities
              </h3>
              <p className="text-sm sm:text-base text-[#F5F3E7]/80 font-body max-w-md mx-auto">
                Core tools that help you track, prove, and protect your
                residency.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="rounded-xl border border-[#F5F3E7]/14 bg-[#101418]">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#0B1D3A] flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-[#F5F3E7]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-[#F5F3E7] mb-1">
                      Smart day tracking
                    </h4>
                    <p className="text-xs sm:text-sm text-[#F5F3E7]/75 mb-2">
                      Log days in each state with automatic threshold monitoring
                      and clear 183-day status.
                    </p>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      Essential feature
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-[#F5F3E7]/14 bg-[#101418]">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#0B1D3A] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-[#F5F3E7]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-[#F5F3E7] mb-1">
                      AI-powered assistant
                    </h4>
                    <p className="text-xs sm:text-sm text-[#F5F3E7]/75 mb-2">
                      Ask residency questions, explore strategies, and prepare
                      for audits with tailored answers.
                    </p>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      AI feature
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-[#F5F3E7]/14 bg-[#101418]">
                <CardContent className="p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-[#0B1D3A] flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-[#F5F3E7]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-[#F5F3E7] mb-1">
                      Compliance analysis
                    </h4>
                    <p className="text-xs sm:text-sm text-[#F5F3E7]/75 mb-2">
                      See your risk level in real time and get proactive
                      guidance before issues arise.
                    </p>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      Premium feature
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5: // Complete
        return (
          <div className="flex flex-col items-center text-center gap-6">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-[#0B1D3A] border border-[#F5F3E7]/30 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-[#F5F3E7]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-[#F5F3E7]">
                  Configuration complete
                </h3>
                <p className="text-sm sm:text-base text-[#F5F3E7]/80 font-body max-w-md">
                  Welcome to Dwellpath
                  {onboardingData.firstName
                    ? `, ${onboardingData.firstName}`
                    : ""}. Your residency profile is ready.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[#F5F3E7]/14 bg-[#101418] text-left w-full">
              <h4 className="font-semibold text-sm text-[#F5F3E7] mb-3">
                Configuration summary
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#F5F3E7]/70">Profile type</span>
                  <span className="font-medium text-[#F5F3E7]">
                    {USER_TYPES.find((t) => t.id === onboardingData.userType)
                      ?.label || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#F5F3E7]/70">Primary state</span>
                  <span className="font-medium text-[#F5F3E7]">
                    {onboardingData.primaryState || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#F5F3E7]/70">Secondary state</span>
                  <span className="font-medium text-[#F5F3E7]">
                    {onboardingData.secondaryState || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#F5F3E7]/70">Tax year</span>
                  <span className="font-medium text-[#F5F3E7]">
                    {onboardingData.taxYear}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#F5F3E7]/75 max-w-md mb-0">
              You can now start logging days, recording expenses, and building a
              clear audit trail of where you live and why.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          handleClose();
        } else {
          setOpen(true);
        }
      }}
    >
      <DialogContent
        className={cn(
          "max-w-xl sm:max-w-[650px] w-[calc(100%-2rem)]",
          "bg-[#1A1F1C] text-[#F5F3E7] border border-[#0B1D3A]",
          "rounded-2xl shadow-2xl px-5 sm:px-8 py-6 sm:py-7",
          "max-h-[90vh] overflow-y-auto"
        )}
        overlayClassName="bg-black/40 backdrop-blur-md"
      >
        <DialogHeader className="mb-4 px-0">
          <DialogTitle className="sr-only">Onboarding</DialogTitle>
          <DialogDescription className="sr-only">
            Complete the onboarding process to set up your tax residency tracking
          </DialogDescription>

          {/* Top bar: step + title */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-body tracking-wide text-[#F5F3E7]/60">
              Step {currentStep + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-xs text-[#F5F3E7]/80 font-body">
              {ONBOARDING_STEPS[currentStep].title}
            </span>
          </div>

          {/* Progress */}
          <Progress value={progress} className="h-2 bg-white/10" />
        </DialogHeader>

        {/* Description under header */}
        <p className="text-xs sm:text-sm text-[#F5F3E7]/65 mb-4 font-body">
          {ONBOARDING_STEPS[currentStep].description}
        </p>

        {/* Step content */}
        <div className="py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 mx-auto animate-spin rounded-full border-2 border-[#F5F3E7]/30 border-t-[#F5F3E7]" />
                <p className="text-sm text-[#F5F3E7] font-medium">
                  Configuring your profile…
                </p>
              </div>
            </div>
          ) : (
            renderStep()
          )}
        </div>

        {/* Navigation */}
        {!isLoading && (
          <div className="flex items-center justify-between gap-3 pt-5 mt-6 border-t border-[#F5F3E7]/12">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm",
                "border-[#F5F3E7]/30 text-[#F5F3E7]",
                "hover:bg-[#0B1D3A] hover:text-[#F5F3E7]",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            {currentStep === ONBOARDING_STEPS.length - 1 ? (
              <Button
                variant="outline"
                onClick={handleComplete}
                disabled={isLoading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm",
                  "border-[#F5F3E7] bg-[#0B1D3A]",
                  "text-[#F5F3E7] hover:bg-[#0B1D3A]/80"
                )}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Complete configuration</span>
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleNext}
                disabled={!isStepValid()}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm",
                  "border-[#F5F3E7] bg-[#0B1D3A]",
                  "text-[#F5F3E7] hover:bg-[#0B1D3A]/80",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
