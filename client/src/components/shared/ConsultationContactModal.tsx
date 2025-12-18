import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ConsultationContactModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ConsultationContactModal({ open, onOpenChange }: ConsultationContactModalProps) {
  const [submitted, setSubmitted] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const nameInputRef = React.useRef<HTMLInputElement | null>(null);

  // Keep background non-scrollable while open (and avoid layout shift from scrollbar).
  React.useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    const prevPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  // Reset demo state when closing so it's easy to re-demo.
  React.useEffect(() => {
    if (open) return;
    setSubmitted(false);
    formRef.current?.reset();
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="dialog-content w-full max-w-[min(720px,calc(100vw-2rem))] p-6 sm:p-7"
        overlayClassName="overlay-backdrop backdrop-blur-[2px]"
        onOpenAutoFocus={(e) => {
          // Put focus into the form instead of the close icon.
          e.preventDefault();
          nameInputRef.current?.focus();
        }}
      >
        <DialogHeader className="space-y-2">
          <DialogTitle className="font-heading text-xl font-light tracking-tight">
            Schedule a Consultation
          </DialogTitle>
          <DialogDescription className="font-body text-sm leading-relaxed">
            This is a presentation-only demo contact form. Nothing is sent—submitting will only show a confirmation.
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <form
            ref={formRef}
            className="mt-2 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <div className="space-y-2">
              <label className="form-label" htmlFor="consultation-name">
                Name
              </label>
              <Input
                ref={nameInputRef}
                id="consultation-name"
                name="name"
                type="text"
                required
                className="input-dwellpath"
                placeholder="Your name"
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <label className="form-label" htmlFor="consultation-email">
                Email
              </label>
              <Input
                id="consultation-email"
                name="email"
                type="email"
                required
                className="input-dwellpath"
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <label className="form-label" htmlFor="consultation-message">
                Message
              </label>
              <Textarea
                id="consultation-message"
                name="message"
                required
                className="input-dwellpath min-h-[120px] resize-none"
                placeholder="Tell us a bit about your situation…"
              />
            </div>

            <div className="pt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              <Button type="submit">Request Consultation</Button>
            </div>
          </form>
        ) : (
          <div className="mt-2 space-y-5">
            <div className="rounded-lg border bg-[hsl(var(--interactive-selected-soft-bg))] px-4 py-3">
              <p className="font-body text-sm text-foreground">
                <span className="font-medium">Thanks!</span> This form works for the demo.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Done</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


