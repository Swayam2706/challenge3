"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Light/dark theme toggle.
 *
 * The initial theme is applied before paint by an inline script in the root
 * layout (avoiding a flash of the wrong theme); this component keeps the UI in
 * sync and persists the user's explicit choice.
 */
export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("ecotrack:theme", next ? "dark" : "light");
    } catch {
      // Ignore storage failures (e.g. private mode).
    }
  }

  // Render a stable placeholder until mounted to avoid hydration mismatch.
  if (!mounted) {
    return <div className="h-9 w-9" aria-hidden="true" />;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className="h-9 w-9 px-0"
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}
