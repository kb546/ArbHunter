'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SUPPORT_EMAIL } from '@/lib/support';

export default function SupportForm({ email }: { email: string | null }) {
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [pending, setPending] = React.useState(false);

  async function submit() {
    setPending(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
          page_url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Failed (HTTP ${res.status})`);

      toast.success('Message sent', {
        description: `Ticket ${String(data?.ticket?.id || '').slice(0, 8)} created. We’ll reply to ${email || 'your email'} soon.`,
      });
      setSubject('');
      setMessage('');
    } catch (e: any) {
      toast.error('Could not send message', {
        description: e?.message || String(e),
        action: email
          ? ({ label: 'Email us', onClick: () => (window.location.href = `mailto:${SUPPORT_EMAIL}`) } as any)
          : undefined,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          We usually respond within <span className="text-foreground font-medium">24 hours</span>.
        </div>
        <Badge variant="outline" className="bg-transparent">Support</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Your email</Label>
          <Input value={email || '—'} disabled />
          <div className="text-xs text-muted-foreground">
            Replies go to this email. If it’s wrong, update it in Supabase for now.
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Billing says inactive, but I just paid"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">What happened?</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe what you did, what you expected, and what you saw. Include screenshots if possible."
          className="min-h-[140px]"
        />
        <div className="text-xs text-muted-foreground">
          Tip: Include the campaign name, niche, GEO, and the page you were on.
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button onClick={submit} disabled={pending || !subject.trim() || !message.trim()}>
          {pending ? 'Sending…' : 'Send to support'}
        </Button>
        <Button variant="outline" onClick={() => (window.location.href = `mailto:${SUPPORT_EMAIL}`)}>
          Email us instead
        </Button>
      </div>
    </div>
  );
}

