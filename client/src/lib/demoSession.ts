const DEMO_SESSION_ACTIVE_KEY = "dwellpath.demoSession.active.v1";

export function isDemoSessionActive(): boolean {
  try {
    return window.sessionStorage.getItem(DEMO_SESSION_ACTIVE_KEY) === "true";
  } catch {
    return false;
  }
}

export function startDemoSession(): void {
  try {
    window.sessionStorage.setItem(DEMO_SESSION_ACTIVE_KEY, "true");
  } catch {
    // ignore (privacy mode / blocked storage)
  }
}

export function clearDemoSession(): void {
  try {
    window.sessionStorage.removeItem(DEMO_SESSION_ACTIVE_KEY);
  } catch {
    // ignore
  }
}


