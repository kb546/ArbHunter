'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { SUPPORT_EMAIL, hasSupportEmail } from '@/lib/support';

export default function ContactForm() {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [company, setCompany] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [pending, setPending] = React.useState(false);

  // Honeypot (hidden)
  const [companyWebsite, setCompanyWebsite] = React.useState('');

  async function submit() {
    setPending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          subject,
          message,
          page_url: typeof window !== 'undefined' ? window.location.href : '',
          company_website: companyWebsite,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Failed (HTTP ${res.status})`);

      toast.success('Message sent', { description: 'We’ll reply within 24 hours (often sooner).' });
      setName('');
      setEmail('');
      setCompany('');
      setSubject('');
      setMessage('');
      setCompanyWebsite('');
    } catch (e: any) {
      toast.error('Could not send message', {
        description: 'Please try again. If this keeps happening, email us directly.',
        action: hasSupportEmail()
          ? ({ label: 'Email us', onClick: () => (window.location.href = `mailto:${SUPPORT_EMAIL}`) } as any)
          : undefined,
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email *</Label>
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company" className="text-white">Company / Agency</Label>
          <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-white">Subject *</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Agency plan + higher limits"
          />
        </div>
      </div>

      {/* Honeypot */}
      <div className="hidden">
        <Label htmlFor="company_website">Company website</Label>
        <Input
          id="company_website"
          value={companyWebsite}
          onChange={(e) => setCompanyWebsite(e.target.value)}
          placeholder="https://"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-white">Message *</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What are you trying to achieve? Include volume (countries/month, creatives/month) if relevant."
          className="min-h-[160px]"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={submit}
          disabled={
            pending || !email.trim() || !subject.trim() || !message.trim()
          }
          className="bg-[#DFFF00] text-[#0B0D10] hover:bg-[#DFFF00]/90"
        >
          {pending ? 'Sending…' : 'Send message'}
        </Button>
        <Button variant="outline" className="border-white/15 bg-transparent text-white hover:bg-white/5" onClick={() => {
          setName(''); setEmail(''); setCompany(''); setSubject(''); setMessage('');
        }}>
          Clear
        </Button>
      </div>
    </div>
  );
}

