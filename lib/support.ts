// Client-safe support email address shown in the UI.
// Do NOT hardcode a default inbox; require explicit configuration via env.
export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
  process.env.SUPPORT_EMAIL ||
  '';

export const hasSupportEmail = () => Boolean(SUPPORT_EMAIL && SUPPORT_EMAIL.includes('@'));

