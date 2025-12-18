export const APP_MODAL_OVERLAY_CLASSNAME = "bg-black/40 backdrop-blur-md";

export const APP_MODAL_CONTENT_BASE_CLASSNAME = [
  // App modals are positioned from the top (not centered) to feel anchored and
  // to avoid footer/CTA jumping between steps.
  "fixed left-1/2 top-[4vh] -translate-x-1/2 translate-y-0",
  // Override the default DialogContent max constraints so our fixed sizing
  // below can actually take effect.
  "max-w-none max-h-none",
  "bg-card text-foreground",
  "border border-primary",
  "rounded-2xl shadow-2xl",
].join(" ");

// Fixed sizing to prevent CTA/buttons from "jumping" as content changes.
// - Caps to viewport on smaller screens
// - Stable on larger screens (same pixel height across modals)
export const APP_MODAL_CONTENT_FIXED_SIZE_CLASSNAME =
  "w-[min(1040px,calc(100vw-2rem))] h-[min(860px,92vh)]";

export const APP_MODAL_CONTENT_SCROLL_CLASSNAME =
  "overflow-y-auto overscroll-contain";


