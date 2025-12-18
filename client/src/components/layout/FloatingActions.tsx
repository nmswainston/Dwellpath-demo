import FeedbackWidget from "@/features/feedback/components/FeedbackWidget";
import { OnboardingWidget } from "@/features/onboarding/components/OnboardingWidget";

/**
 * Shared floating action container for bottom-right widgets.
 * Intentionally stacks children so they never overlap.
 */
export function FloatingActions() {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3">
      <OnboardingWidget />
      <FeedbackWidget />
    </div>
  );
}


