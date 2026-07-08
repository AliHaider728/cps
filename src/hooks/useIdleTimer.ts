import { useEffect, useRef, useCallback } from "react";

interface UseIdleTimerProps {
  timeout: number;
  onIdle: () => void;
  debounce?: number;
}

export function useIdleTimer({ timeout, onIdle, debounce = 500 }: UseIdleTimerProps) {
  const idleTimeoutId = useRef<number | ReturnType<typeof setTimeout> | null>(null);
  const lastActivityTime = useRef<number>(Date.now());
  const onIdleRef = useRef(onIdle);

  // Keep the latest callback ref to avoid unnecessary re-renders or stale closures
  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  const resetTimer = useCallback(
    (isLocalActivity = true) => {
      const now = Date.now();
      
      // Throttle local activity updates to avoid hammering localStorage and setTimout
      if (isLocalActivity && now - lastActivityTime.current < debounce) {
        return;
      }

      lastActivityTime.current = now;

      if (isLocalActivity) {
        try {
          // Sync with other tabs
          localStorage.setItem("_idle_lastActivity", now.toString());
        } catch (error) {
          // Ignore localStorage errors (e.g., incognito/private mode restrictions)
        }
      }

      if (idleTimeoutId.current) {
        clearTimeout(idleTimeoutId.current as any);
      }

      idleTimeoutId.current = setTimeout(() => {
        onIdleRef.current();
      }, timeout);
    },
    [timeout, debounce]
  );

  useEffect(() => {
    // Initial setup
    resetTimer(true);

    const handleLocalActivity = () => resetTimer(true);

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "_idle_lastActivity") {
        // Activity detected in another tab, reset the timer without writing to localStorage again
        resetTimer(false);
      }
    };

    const events = [
      "mousemove",
      "keydown",
      "wheel",
      "DOMMouseScroll",
      "mouseWheel",
      "mousedown",
      "touchstart",
      "touchmove",
      "MSPointerDown",
      "MSPointerMove",
      "visibilitychange",
    ];

    events.forEach((event) => {
      window.addEventListener(event, handleLocalActivity, { passive: true });
    });

    window.addEventListener("storage", handleStorageChange);

    return () => {
      if (idleTimeoutId.current) {
        clearTimeout(idleTimeoutId.current as any);
      }
      events.forEach((event) => {
        window.removeEventListener(event, handleLocalActivity);
      });
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [resetTimer]);

  // Provide a manual reset function if needed (e.g., when the user clicks "Continue Session")
  return { reset: () => resetTimer(true) };
}
