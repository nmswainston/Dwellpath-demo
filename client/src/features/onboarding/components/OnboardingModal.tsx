import { useState, useEffect, type ReactNode } from "react";
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
import { LogoIcon } from "@/components/branding/LogoIcon";
import { useToast } from "@/hooks/use-toast";
import { userApi } from "@/lib/apiClient";
import {
  APP_MODAL_CONTENT_BASE_CLASSNAME,
  APP_MODAL_CONTENT_FIXED_SIZE_CLASSNAME,
  APP_MODAL_OVERLAY_CLASSNAME,
} from "@/lib/modalStyles";

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

type StepSections = {
  hero: {
    title: string;
    description?: ReactNode;
    icon?: ReactNode;
  };
  primary: ReactNode;
  secondary?: ReactNode;
};

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

  const getStepSections = (): StepSections | null => {
    switch (currentStep) {
      case 0: // Welcome
        return {
          hero: {
            title: "Welcome to Dwellpath",
            description: (
              <>
                Track where you live, prove where you belong, and protect your
                residency story with clarity.
              </>
            ),
            icon: (
              <div className="w-[70px] h-[70px] rounded-full bg-muted/40 border border-border/60 flex items-center justify-center mx-auto">
                <LogoIcon size={60} decorative />
              </div>
            ),
          },
          primary: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <div className="rounded-xl border border-foreground/14 bg-card p-4 h-full">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-10 h-10 rounded-lg bg-muted/40 border border-foreground/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-foreground leading-tight">
                      Track Days
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Monitor days in each state with clear 183-day insights.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-foreground/14 bg-card p-4 h-full">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-10 h-10 rounded-lg bg-muted/40 border border-foreground/10 flex items-center justify-center shrink-0">
                    <Receipt className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-foreground leading-tight">
                      Log Expenses
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Tie key expenses to locations for a stronger residency
                      story.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-foreground/14 bg-card p-4 h-full">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-10 h-10 rounded-lg bg-muted/40 border border-foreground/10 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-foreground leading-tight">
                      AI Assistant
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Ask Dwellpath AI for guidance as your situation evolves.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-foreground/14 bg-card p-4 h-full">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-10 h-10 rounded-lg bg-muted/40 border border-foreground/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-foreground leading-tight">
                      Secure Journal
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      Keep a clean record of travel, ties, and decisions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ),
        };

      case 1: // Profile
        return {
          hero: {
            title: "Configure your profile",
            description: (
              <>
                Tell us how you use your homes so we can tailor tracking and
                guidance.
              </>
            ),
          },
          primary: (
            <div className="space-y-7">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wide text-foreground block font-semibold font-body">
                  What best describes you?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {USER_TYPES.map((type) => (
                    <Card
                      key={type.id}
                      variant={onboardingData.userType === type.id ? "primary" : "default"}
                      className={cn(
                        "cursor-pointer transition-all duration-200 min-h-[96px] sm:min-h-[110px]",
                        onboardingData.userType === type.id
                          ? "hover:bg-primary/95 hover:border-primary-foreground/35"
                          : "border-foreground/12 hover:border-foreground/40"
                      )}
                      onClick={() => updateData("userType", type.id)}
                    >
                      <CardContent className="p-5 flex items-start gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                            onboardingData.userType === type.id
                              ? "bg-primary-foreground/90 text-primary"
                              : "bg-muted/50 text-foreground"
                          )}
                        >
                          <type.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4
                            className={cn(
                              "font-semibold text-sm",
                              onboardingData.userType === type.id
                                ? "text-primary-foreground"
                                : "text-foreground"
                            )}
                          >
                            {type.label}
                          </h4>
                          <p
                            className={cn(
                              "text-xs leading-relaxed mt-1 whitespace-normal wrap-break-word",
                              onboardingData.userType === type.id
                                ? "text-primary-foreground"
                                : "text-foreground"
                            )}
                          >
                            {type.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm text-foreground font-medium"
                  >
                    First name
                  </Label>
                  <Input
                    id="firstName"
                    value={onboardingData.firstName}
                    onChange={(e) => updateData("firstName", e.target.value)}
                    placeholder="Enter your first name"
                    className="bg-card border-foreground/20 text-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm text-foreground font-medium"
                  >
                    Last name
                  </Label>
                  <Input
                    id="lastName"
                    value={onboardingData.lastName}
                    onChange={(e) => updateData("lastName", e.target.value)}
                    placeholder="Enter your last name"
                    className="bg-card border-foreground/20 text-foreground"
                  />
                </div>
              </div>
            </div>
          ),
        };

      case 2: // States
        return {
          hero: {
            title: "Configure your states",
            description: (
              <>
                Set your primary and secondary states so we can monitor key
                thresholds.
              </>
            ),
          },
          primary: (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="primaryState"
                  className="text-sm text-foreground block font-medium"
                >
                  Primary state
                </Label>
                <Select
                  value={onboardingData.primaryState}
                  onValueChange={(value) => updateData("primaryState", value)}
                >
                  <SelectTrigger
                    id="primaryState"
                    name="primaryState"
                    className="bg-card border-foreground/20 text-foreground"
                  >
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
                <p className="text-xs text-foreground leading-relaxed">
                  Where you are most anchored today.
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="secondaryState"
                  className="text-sm text-foreground block font-medium"
                >
                  Secondary state
                </Label>
                <Select
                  value={onboardingData.secondaryState}
                  onValueChange={(value) => updateData("secondaryState", value)}
                >
                  <SelectTrigger
                    id="secondaryState"
                    name="secondaryState"
                    className="bg-card border-foreground/20 text-foreground"
                  >
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
                <p className="text-xs text-foreground leading-relaxed">
                  The other state that matters most for tax purposes.
                </p>
              </div>
            </div>
          ),
          secondary:
            onboardingData.primaryState && onboardingData.secondaryState ? (
              <div className="p-4 rounded-xl border border-foreground/14 bg-card">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    States configured
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  Dwellpath will monitor your days between{" "}
                  <strong className="text-foreground font-semibold">
                    {onboardingData.primaryState}
                  </strong>{" "}
                  and{" "}
                  <strong className="text-foreground font-semibold">
                    {onboardingData.secondaryState}
                  </strong>{" "}
                  so you can stay ahead of 183-day and related rules.
                </p>
              </div>
            ) : null,
        };

      case 3: // Preferences
        return {
          hero: {
            title: "Set preferences",
            description: (
              <>
                Choose your tax year and how assertively you want Dwellpath to
                monitor and nudge you.
              </>
            ),
          },
          primary: (
            <div className="space-y-8">
              <div className="space-y-2">
                <Label
                  htmlFor="taxYear"
                  className="text-sm text-foreground block font-medium"
                >
                  Tax year
                </Label>
                <Select
                  value={onboardingData.taxYear}
                  onValueChange={(value) => updateData("taxYear", value)}
                >
                  <SelectTrigger
                    id="taxYear"
                    name="taxYear"
                    className="bg-card border-foreground/20 text-foreground"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-sm text-foreground block font-medium">
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
                      variant={
                        onboardingData.riskTolerance === option.value
                          ? "primary"
                          : "default"
                      }
                      className={cn(
                        "cursor-pointer transition-all duration-200",
                        onboardingData.riskTolerance === option.value
                          ? "hover:bg-primary/95 hover:border-primary-foreground/35"
                          : "border-foreground/12 hover:border-foreground/40"
                      )}
                      onClick={() => updateData("riskTolerance", option.value)}
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="space-y-1">
                          <h4
                            className={cn(
                              "font-semibold text-sm",
                              onboardingData.riskTolerance === option.value
                                ? "text-primary-foreground"
                                : "text-foreground"
                            )}
                          >
                            {option.label}
                          </h4>
                          <p
                            className={cn(
                              "text-xs leading-relaxed",
                              onboardingData.riskTolerance === option.value
                                ? "text-primary-foreground"
                                : "text-foreground"
                            )}
                          >
                            {option.description}
                          </p>
                        </div>
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border-2",
                            onboardingData.riskTolerance === option.value
                              ? "bg-primary-foreground/90 border-primary-foreground/35"
                              : "border-foreground/40"
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ),
        };

      case 4: // Features Tour
        return {
          hero: {
            title: "Dwellpath capabilities",
            description: (
              <>
                Core tools that help you track, prove, and protect your
                residency.
              </>
            ),
          },
          primary: (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 md:gap-y-7">
              <Card className="rounded-2xl border border-foreground/14 bg-card/40 transition-transform hover:-translate-y-px">
                <CardContent className="p-6 flex items-start gap-5">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-foreground/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <h4 className="text-base md:text-lg font-semibold text-foreground leading-snug">
                      Smart day tracking
                    </h4>
                    <p className="text-sm md:text-[15px] leading-relaxed text-foreground/70">
                      Log days in each state with automatic threshold monitoring
                      and clear 183-day status.
                    </p>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      Essential feature
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-foreground/14 bg-card/40 transition-transform hover:-translate-y-px">
                <CardContent className="p-6 flex items-start gap-5">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-foreground/10 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <h4 className="text-base md:text-lg font-semibold text-foreground leading-snug">
                      AI-powered assistant
                    </h4>
                    <p className="text-sm md:text-[15px] leading-relaxed text-foreground/70">
                      Ask residency questions, explore strategies, and prepare
                      for audits with tailored answers.
                    </p>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      AI feature
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border border-foreground/14 bg-card/40 transition-transform hover:-translate-y-px">
                <CardContent className="p-6 flex items-start gap-5">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-foreground/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2.5">
                    <h4 className="text-base md:text-lg font-semibold text-foreground leading-snug">
                      Compliance analysis
                    </h4>
                    <p className="text-sm md:text-[15px] leading-relaxed text-foreground/70">
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
          ),
        };

      case 5: // Complete
        return {
          hero: {
            title: "Configuration complete",
            description: (
              <>
                Welcome to Dwellpath
                {onboardingData.firstName
                  ? `, ${onboardingData.firstName}`
                  : ""}. Your residency profile is ready.
              </>
            ),
            icon: (
              <div className="w-14 h-14 rounded-full bg-primary border border-primary-foreground/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-primary-foreground" />
              </div>
            ),
          },
          primary: (
            <div className="p-4 rounded-xl border border-foreground/14 bg-card text-left w-full">
              <h4 className="font-semibold text-sm text-foreground mb-3">
                Configuration summary
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Profile type</span>
                  <span className="font-medium text-foreground">
                    {USER_TYPES.find((t) => t.id === onboardingData.userType)
                      ?.label || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Primary state</span>
                  <span className="font-medium text-foreground">
                    {onboardingData.primaryState || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Secondary state</span>
                  <span className="font-medium text-foreground">
                    {onboardingData.secondaryState || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Tax year</span>
                  <span className="font-medium text-foreground">
                    {onboardingData.taxYear}
                  </span>
                </div>
              </div>
            </div>
          ),
          secondary: (
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto text-center leading-relaxed">
              You can now start logging days, recording expenses, and building a
              clear audit trail of where you live and why.
            </p>
          ),
        };

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
          APP_MODAL_CONTENT_BASE_CLASSNAME,
          APP_MODAL_CONTENT_FIXED_SIZE_CLASSNAME,
          "overflow-hidden flex flex-col",
          "p-0"
        )}
        overlayClassName={APP_MODAL_OVERLAY_CLASSNAME}
      >
        {/* Header - Fixed */}
        <div className="shrink-0 px-6 sm:px-8 pt-5 sm:pt-6 pb-4">
          <DialogHeader className="px-0 space-y-3">
            <DialogTitle className="sr-only">Onboarding</DialogTitle>
            <DialogDescription className="sr-only">
              Complete the onboarding process to set up your tax residency tracking
            </DialogDescription>

            {/* Step indicator (orientation only) */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-body tracking-wide text-foreground">
                Step {currentStep + 1} of {ONBOARDING_STEPS.length}
              </span>
            </div>

            {/* Progress */}
            <Progress value={progress} className="h-2 bg-muted" />

            {/* Optional helper sentence */}
            <p className="text-xs sm:text-sm text-muted-foreground font-body leading-relaxed">
              {ONBOARDING_STEPS[currentStep].description}
            </p>
          </DialogHeader>
        </div>

        {/* Body - Scrollable */}
        <div
          className={cn(
            "flex-1 min-h-0 px-6 sm:px-8",
            "overflow-y-auto overscroll-contain"
          )}
        >
          <div className="py-6 sm:py-7">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-3">
                  <div className="w-10 h-10 mx-auto animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
                  <p className="text-sm text-foreground font-medium">
                    Configuring your profile…
                  </p>
                </div>
              </div>
            ) : (
              (() => {
                const step = getStepSections();
                if (!step) return null;

                return (
                  <div className="mx-auto w-full max-w-4xl leading-relaxed">
                    <div className="space-y-8 sm:space-y-10">
                      {/* Hero Block */}
                      <section className="text-center space-y-4">
                        {step.hero.icon}
                        <div className="space-y-2">
                          <h3 className="text-2xl sm:text-3xl font-heading font-semibold text-foreground">
                            {step.hero.title}
                          </h3>
                          {step.hero.description ? (
                            <p className="text-sm sm:text-base text-muted-foreground font-body max-w-md mx-auto leading-relaxed">
                              {step.hero.description}
                            </p>
                          ) : null}
                        </div>
                      </section>

                      {/* Primary Interaction Block */}
                      <section className="space-y-6">
                        {step.primary}
                      </section>

                      {/* Secondary / Supporting Info */}
                      {step.secondary ? (
                        <section className="space-y-4">
                          {step.secondary}
                        </section>
                      ) : null}
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        {!isLoading && (
          <div className="shrink-0 px-6 sm:px-8 pb-6 sm:pb-7 pt-4 border-t border-foreground/12">
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm",
                  "border-foreground/30 text-foreground",
                  "hover:bg-primary hover:text-primary-foreground hover:border-primary/50",
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
                    "border-primary/30 bg-primary",
                    "text-primary-foreground hover:bg-primary/90 hover:border-primary/50"
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
                    "border-primary/30 bg-primary",
                    "text-primary-foreground hover:bg-primary/90 hover:border-primary/50",
                    "disabled:opacity-40 disabled:cursor-not-allowed"
                  )}
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
