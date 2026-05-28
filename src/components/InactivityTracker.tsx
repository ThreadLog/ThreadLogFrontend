import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { clearSession, getSession } from "@/lib/auth";

const INACTIVITY_MS = 2 * 60 * 60 * 1000;

export function InactivityTracker() {
  const navigate = useNavigate();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!getSession()) return;

    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        clearSession();
        navigate({ to: "/login" });
      }, INACTIVITY_MS);
    }

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"] as const;
    events.forEach((e) => window.addEventListener(e, reset));
    reset();

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return null;
}
