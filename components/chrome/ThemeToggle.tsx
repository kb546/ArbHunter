"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "dark" | "light";

const STORAGE_KEY = "arbhunter_theme";
const COOKIE_KEY = "arbhunter_theme";

function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  if (theme === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

function readCookieTheme(): ThemeMode | null {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
    if (!m) return null;
    const v = decodeURIComponent(m[1] || "");
    if (v === "dark" || v === "light") return v;
    return null;
  } catch {
    return null;
  }
}

function persistTheme(theme: ThemeMode) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore
  }
  try {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(theme)}; Path=/; Max-Age=${60 * 60 * 24 * 365}`;
  } catch {
    // ignore
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = React.useState<ThemeMode>("dark");

  React.useEffect(() => {
    // Default is dark. Only app pages (AppChrome) mount this.
    let initial: ThemeMode = "dark";
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") initial = stored;
    } catch {
      // ignore
    }

    const cookieTheme = readCookieTheme();
    if (cookieTheme) initial = cookieTheme;

    setTheme(initial);
    applyTheme(initial);
  }, []);

  function toggle() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    persistTheme(next);
  }

  const Icon = theme === "dark" ? Sun : Moon;
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={toggle}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}

