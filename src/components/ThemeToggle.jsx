import React, { useEffect, useState } from "react";
import { usePrefersDark } from "../hooks/usePrefersDark.js";

function applyTheme(dark) {
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark); // keep explicit light class for CSS targeting
  root.style.colorScheme = dark ? "dark" : "light";
  localStorage.setItem("theme", dark ? "dark" : "light");
}

export function ThemeToggle() {
  const prefersDark = usePrefersDark();
  const [dark, setDark] = useState(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    return stored ? stored === "dark" : prefersDark;
  });

  useEffect(() => applyTheme(dark), [dark]);

  return (
    <button
      className="rounded-full border px-3 py-1 text-xs opacity-80 hover:opacity-100"
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle color theme"
      title="Toggle theme"
    >
      {dark ? "Dark" : "Light"}
    </button>
  );
}
