type SendEmailParams = {
  to: string;
  subject: string;
  text: string;
  replyTo?: string | null;
};

function hasResend(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendEmail(params: SendEmailParams): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!hasResend()) {
    return { ok: false, error: 'Email provider not configured (missing RESEND_API_KEY)' };
  }

  const from = process.env.RESEND_FROM || 'ArbHunter <onboarding@resend.dev>';

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [params.to],
        subject: params.subject,
        text: params.text,
        ...(params.replyTo ? { reply_to: params.replyTo } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { ok: false, error: data?.message || data?.error || `Resend failed (HTTP ${res.status})` };
    }
    return { ok: true, id: data?.id };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

