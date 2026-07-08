import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useIdleTimer } from "../../hooks/useIdleTimer";
import { AlertTriangle, LogOut, Play } from "lucide-react";
import { Button } from "../ui/Button";

// Export these so they can be temporarily overridden for testing if needed
export const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
export const COUNTDOWN_SECONDS = 10; // 10 seconds

export default function IdleSessionManager() {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  const handleIdle = useCallback(() => {
    if (isAuthenticated) {
      setShowWarning(true);
      setCountdown(COUNTDOWN_SECONDS);
    }
  }, [isAuthenticated]);

  const { reset } = useIdleTimer({
    timeout: IDLE_TIMEOUT_MS,
    onIdle: handleIdle,
  });

  // Handle countdown
  useEffect(() => {
    if (!showWarning) return;

    if (countdown <= 0) {
      // Time is up, logout
      logout();
      setShowWarning(false);
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning, countdown, logout]);

  // Keep it active only when authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
    } else {
      reset(); // Reset timer when logging in
    }
  }, [isAuthenticated, reset]);

  const handleContinue = () => {
    setShowWarning(false);
    setCountdown(COUNTDOWN_SECONDS);
    reset();
  };

  if (!isAuthenticated || !showWarning) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
            <AlertTriangle size={32} className="text-orange-600" />
          </div>
          <h2 className="mb-2 text-xl font-extrabold text-slate-900">Are you still there?</h2>
          <p className="text-sm text-slate-600">
            You've been inactive for a while. For your security, you will be automatically logged out in:
          </p>
          <div className="my-6 text-5xl font-black text-orange-600 tabular-nums tracking-tighter">
            {countdown}s
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              variant="outline"
              onClick={() => logout()}
              className="flex items-center justify-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={16} /> Log Out Now
            </Button>
            <Button
              onClick={handleContinue}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play size={16} /> Continue Session
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
