"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

/**
 * Light/dark switch. The initial `data-theme` is set on <html> by a blocking
 * inline script in the layout (so there's no flash); this only flips it and
 * persists the choice.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme((document.documentElement.getAttribute("data-theme") as Theme) || "light");
    setMounted(true);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // storage may be unavailable (private mode) — ignore
    }
    setTheme(next);
  };

  const goingDark = theme !== "dark";

  return (
    <button
      type="button"
      className="themetg"
      onClick={toggle}
      aria-label={`Switch to ${goingDark ? "dark" : "light"} mode`}
      title={`Switch to ${goingDark ? "dark" : "light"} mode`}
    >
      <span className="tic" aria-hidden="true">
        {!mounted ? "◐" : theme === "dark" ? "☀" : "☾"}
      </span>
      <span className="ttlabel">{!mounted ? "Theme" : theme === "dark" ? "Light" : "Dark"}</span>
    </button>
  );
}
