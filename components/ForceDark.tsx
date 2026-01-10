"use client";

import * as React from "react";

/**
 * Ensures marketing/auth pages stay dark even if an authenticated user
 * previously switched the app to light mode.
 */
export function ForceDark() {
  React.useEffect(() => {
    try {
      document.documentElement.classList.add("dark");
    } catch {
      // no-op
    }
  }, []);

  return null;
}

