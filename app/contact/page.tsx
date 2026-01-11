import { MarketingHeader } from '@/components/landing/MarketingHeader';
import { SiteFooter } from '@/components/landing/SiteFooter';
import { Card } from '@/components/ui/card';
import ContactForm from './contactForm';

export const metadata = {
  title: 'Contact — ArbHunter',
  description: 'Contact ArbHunter. Sales, partnerships, agencies, and support.',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-white">
      <MarketingHeader />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">Contact</h1>
        <p className="mt-2 text-white/70 leading-relaxed">
          Agencies and high-volume teams: tell us what you’re trying to scale and we’ll reply with the fastest path.
        </p>

        <Card className="mt-8 p-5 sm:p-6 bg-[#0B0D10] border-white/10">
          <ContactForm />
        </Card>

        <div className="mt-6 text-xs text-white/55 leading-relaxed">
          By submitting, you agree we may email you back about your request. Do not include passwords or sensitive data.
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

