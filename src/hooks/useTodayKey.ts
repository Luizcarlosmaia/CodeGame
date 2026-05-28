import { useEffect, useRef, useState } from "react";
import { todayKey } from "../utils/stats";

const CHECK_INTERVAL_MS = 30_000;

export function useTodayKey(onDayChange?: (newDay: string, previousDay: string) => void) {
  const [today, setToday] = useState(() => todayKey());
  const onDayChangeRef = useRef(onDayChange);

  useEffect(() => {
    onDayChangeRef.current = onDayChange;
  }, [onDayChange]);

  useEffect(() => {
    const check = () => {
      const current = todayKey();
      setToday((previous) => {
        if (previous === current) return previous;
        onDayChangeRef.current?.(current, previous);
        return current;
      });
    };

    const interval = setInterval(check, CHECK_INTERVAL_MS);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, []);

  return today;
}
