"use client";

import * as React from "react";

/**
 * Supabase email links sometimes redirect to SITE_URL with errors in the hash fragment.
 * We can’t read hash on the server, so this client handler converts it into a real URL
 * and routes the user to a friendly error page.
 */
export function AuthHashHandler() {
  React.useEffect(() => {
    try {
      const hash = window.location.hash || "";
      if (!hash.startsWith("#")) return;
      const params = new URLSearchParams(hash.slice(1));
      const errorCode = params.get("error_code") || params.get("error");
      const errorDesc = params.get("error_description");

      if (!errorCode && !errorDesc) return;

      const url = new URL(window.location.href);
      url.hash = "";
      const dest = new URL("/auth/confirm/error", url.origin);
      for (const [k, v] of params.entries()) dest.searchParams.set(k, v);
      dest.searchParams.set("next", "/dashboard");
      window.location.replace(dest.toString());
    } catch {
      // ignore
    }
  }, []);

  return null;
}

