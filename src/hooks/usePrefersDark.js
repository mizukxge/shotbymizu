import { useEffect, useState } from "react";
export function usePrefersDark() {
  const [isDark, setIsDark] = useState(
    typeof window !== "undefined"
      ? window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);
  return isDark;
}
