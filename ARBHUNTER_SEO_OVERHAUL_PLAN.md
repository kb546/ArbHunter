# ArbHunter SEO & UX Overhaul Plan

**Created:** January 18, 2026
**Goal:** Transform ArbHunter.dev into an SEO-optimized, conversion-focused platform modeled after AdCreative.ai's proven structure

---

## Executive Summary

### Current Issues Identified

1. **Navigation Inconsistency**: Homepage uses section anchors (`#features`, `#pricing`), pricing page uses `<MarketingHeader>` with separate pages
2. **Paddle References**: Still mentioning Paddle in footer and legal pages despite switching to Dodo
3. **Weak SEO Structure**: No dedicated feature pages, all content on homepage
4. **Poor Site Indexing**: Only 6 pages in sitemap, missing feature pages entirely
5. **Subscription Error Handling**: Generic error messages, no guidance to contact support
6. **No Vertical-Specific Pages**: Missing use case pages for different customer segments

### Success Metrics (6 Months Post-Implementation)

- **Organic Traffic**: +300% increase from dedicated feature pages
- **Conversion Rate**: +40% from improved CTAs and messaging
- **SEO Rankings**: Top 10 for "ad arbitrage tool", "facebook arbitrage", "creative generation"
- **User Retention**: +25% from improved onboarding and error handling

---

## PHASE 1: Critical Fixes (Week 1-2)

### 1.1 Remove All Paddle References

**Files to Update:**

**[components/landing/SiteFooter.tsx](components/landing/SiteFooter.tsx:98)**
```tsx
// BEFORE (Line 98):
Billing is handled by Paddle (MoR). Taxes/VAT are handled automatically when applicable.

// AFTER:
Billing is handled by Dodo Payments (Merchant of Record). Taxes/VAT are handled automatically when applicable.
```

**[app/terms/page.tsx](app/terms/page.tsx:38)**
```tsx
// BEFORE (Line 38):
Billing is handled by Paddle (Merchant of Record), which may collect taxes/VAT where required.

// AFTER:
Billing is handled by Dodo Payments (Merchant of Record), which may collect taxes/VAT where required.
```

**[app/privacy/page.tsx](app/privacy/page.tsx:37)**
```tsx
// BEFORE (Line 37):
Payments are processed by Paddle (Merchant of Record). We do not store your full payment details.

// AFTER:
Payments are processed by Dodo Payments (Merchant of Record). We do not store your full payment details.
```

### 1.2 Fix Navigation Consistency

**Problem:** Homepage uses inline section navigation (`#features`, `#pricing`) while other pages use MarketingHeader with separate page links.

**Solution:** Standardize on separate pages for better SEO and indexing.

**Action Items:**
1. Keep homepage navigation as-is (sections work well for landing)
2. Update `<MarketingHeader>` to remove Terms/Privacy/Refunds from main nav
3. Move legal links to footer only
4. Add "Features" dropdown with individual feature pages (when created in Phase 2)

**New Navigation Structure:**
```
Home | Features ▼ | Pricing | Contact
         └─ Opportunity Sniffer
         └─ Creative Studio
         └─ Campaign Manager
         └─ ROI Calculator
```

### 1.3 Improve Subscription Error Handling

**Current Issues:**
- [app/account/billing/BillingClient.tsx](app/account/billing/BillingClient.tsx:140): Generic error toast
- [app/pricing/page.tsx](app/pricing/page.tsx:197): Basic alert() with no support contact

**Improvements Needed:**

**File: [app/account/billing/BillingClient.tsx](app/account/billing/BillingClient.tsx)**

Update error handling for plan changes and cancellations:

```tsx
// Line 136-143: Improve changePlan error handling
if (!res.ok) {
  const errorMsg = data.error || `Change plan failed (HTTP ${res.status})`;
  throw new Error(errorMsg);
}

// REPLACE WITH:
if (!res.ok) {
  const errorMsg = data.error || `Unable to change plan (HTTP ${res.status})`;

  // Specific error messages based on status
  if (res.status === 409) {
    throw new Error('You are already on this plan. Please select a different plan.');
  } else if (res.status === 402) {
    throw new Error('Payment method issue. Please update your billing details or contact support@arbhunter.dev');
  } else if (res.status >= 500) {
    throw new Error('Our system is experiencing issues. Please try again in a few minutes or contact support@arbhunter.dev');
  } else {
    throw new Error(`${errorMsg}. If this persists, please contact support@arbhunter.dev`);
  }
}
```

```tsx
// Line 158: Improve cancel error handling
toast.error('Failed to cancel', { description: e?.message || String(e) });

// REPLACE WITH:
toast.error('Unable to cancel subscription', {
  description: `${e?.message || String(e)}. Please contact support@arbhunter.dev for assistance.`
});
```

**File: [app/pricing/page.tsx](app/pricing/page.tsx)**

```tsx
// Line 183-198: Replace alert() with better error handling
} catch (err: any) {
  alert(`Upgrade failed: ${err?.message || String(err)}`);
}

// REPLACE WITH:
} catch (err: any) {
  let errorMessage = 'Unable to start checkout';
  const errMsg = err?.message || String(err);

  if (errMsg.includes('401') || errMsg.includes('Unauthorized')) {
    // This is already handled with redirect, but add fallback
    errorMessage = 'Please log in first to upgrade your plan.';
  } else if (errMsg.includes('500')) {
    errorMessage = 'Our payment system is temporarily unavailable. Please try again in a few minutes.';
  } else {
    errorMessage = `${errMsg}. Need help? Contact support@arbhunter.dev`;
  }

  alert(errorMessage);
}
```

**File: [app/api/dodo/subscription/change-plan/route.ts](app/api/dodo/subscription/change-plan/route.ts)**

Add better error messages from API:

```tsx
// Line 43-48: Improve "same plan" error
if (subscription.plan === newPlan) {
  return NextResponse.json(
    { error: 'Already on this plan' },
    { status: 400 }
  );
}

// REPLACE WITH:
if (subscription.plan === newPlan) {
  return NextResponse.json(
    { error: `You are already on the ${newPlan.toUpperCase()} plan. Please choose a different plan.` },
    { status: 409 } // Use 409 Conflict for better status
  );
}
```

---

## PHASE 2: Feature Pages Creation (Week 3-6)

### 2.1 Feature Pages to Create

Based on AdCreative.ai's structure, create these dedicated landing pages:

#### Page 1: `/opportunity-sniffer`
- **H1:** "Find Profitable Ad Arbitrage Opportunities Before Anyone Else"
- **Focus:** Discovery tool, trend detection, country targeting
- **SEO Keywords:** ad arbitrage opportunities, facebook arbitrage scanner, trending topics for ads
- **CTAs:** "Start Discovering" (4x throughout page)

#### Page 2: `/creative-studio`
- **H1:** "Generate High-Converting Ad Creatives in Minutes, Not Hours"
- **Focus:** A/B testing, creative generation, quality scoring
- **SEO Keywords:** ad creative generator, facebook ad templates, a/b test creatives
- **CTAs:** "Generate Creatives" (4x throughout page)

#### Page 3: `/campaign-manager`
- **H1:** "Organize and Scale Your Ad Campaigns Without Spreadsheet Chaos"
- **Focus:** Campaign organization, tagging, export functionality
- **SEO Keywords:** ad campaign management, arbitrage campaign tracking
- **CTAs:** "Organize Campaigns" (4x throughout page)

#### Page 4: `/roi-calculator`
- **H1:** "Calculate Your Ad Arbitrage Profit Potential"
- **Focus:** Interactive calculator, trust building, lead generation
- **SEO Keywords:** ad arbitrage roi calculator, facebook arbitrage profit
- **CTAs:** "Calculate ROI" → "See How to Achieve This" → Signup

### 2.2 Feature Page Template Structure

All feature pages follow this 9-section template:

```tsx
// components/feature/FeaturePageTemplate.tsx
export default function FeaturePageTemplate({
  title, // H1
  subtitle, // Hero subheading
  heroImage, // Hero visual
  sections, // 3-5 feature sections
  pricing, // Pricing table embed
  faqs, // 8-12 FAQ items
  relatedFeatures, // Links to other feature pages
}) {
  return (
    <div className="min-h-screen bg-[#0B0D10] text-white">
      <ForceDark />
      <MarketingHeader />

      {/* 1. Hero Section */}
      <Section>
        <Container>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <CTA primary />
          {heroImage}
        </Container>
      </Section>

      {/* 2. Social Proof */}
      <TrustBar stats={['X opportunities found', 'Y% success rate']} />

      {/* 3-5. Feature Deep Dives */}
      {sections.map(section => (
        <FeatureSection
          key={section.id}
          title={section.title}
          description={section.description}
          image={section.image}
          benefits={section.benefits}
          alternateLayout={section.alternate}
        />
      ))}

      {/* 6. Pricing Embed */}
      <PricingSection compact />

      {/* 7. FAQ */}
      <FAQ items={faqs} />

      {/* 8. Related Features */}
      <RelatedFeaturesSection features={relatedFeatures} />

      {/* 9. Footer */}
      <SiteFooter />
    </div>
  );
}
```

### 2.3 Internal Linking Map

```
Homepage (/)
  ├─> Opportunity Sniffer (/opportunity-sniffer)
  │     ├─> Creative Studio (/creative-studio)
  │     ├─> Campaign Manager (/campaign-manager)
  │     └─> Pricing (/pricing)
  │
  ├─> Creative Studio (/creative-studio)
  │     ├─> Opportunity Sniffer (/opportunity-sniffer)
  │     ├─> Campaign Manager (/campaign-manager)
  │     └─> ROI Calculator (/roi-calculator)
  │
  ├─> Campaign Manager (/campaign-manager)
  │     ├─> Creative Studio (/creative-studio)
  │     └─> Pricing (/pricing)
  │
  └─> Pricing (/pricing)
        └─> All 3 feature pages

ROI Calculator (/roi-calculator)
  ├─> Opportunity Sniffer
  ├─> Creative Studio
  └─> Pricing (after calculation)
```

---

## PHASE 3: Use Case Pages (Week 7-9)

### 3.1 Vertical-Specific Landing Pages

Based on target customer segments:

#### Page 1: `/for/media-buyers`
- **H1:** "Ad Arbitrage Tools Built for Professional Media Buyers"
- **Focus:** Speed, scale, ROI optimization
- **Features Highlighted:** Batch discovery, automated creative generation, campaign tracking
- **CTA:** "Start Professional Trial"

#### Page 2: `/for/agencies`
- **H1:** "Scale Your Agency's Ad Arbitrage Operations"
- **Focus:** Client management, white-label potential, team collaboration
- **Features Highlighted:** Multi-account support, reporting, export capabilities
- **CTA:** "Book Agency Demo"

#### Page 3: `/for/solo-marketers`
- **H1:** "Start Ad Arbitrage as a Solo Marketer"
- **Focus:** Simplicity, learning curve, affordability
- **Features Highlighted:** Guided workflow, templates, 7-day trial
- **CTA:** "Start Free Trial"

### 3.2 Use Case Page Structure

```tsx
// Simpler than feature pages, focused on persona benefits
1. Hero (persona-specific value prop)
2. "You Need..." problem statement
3. "ArbHunter Gives You..." solution with 3-5 key features
4. Customer testimonial (if available)
5. Simplified pricing (1-2 recommended plans)
6. FAQ (persona-specific questions)
7. CTA footer
```

---

## PHASE 4: SEO Optimization (Week 10-12)

### 4.1 Update Sitemap

**File: [app/sitemap.ts](app/sitemap.ts)**

```tsx
// CURRENT (6 pages):
const routes = [
  '/',
  '/pricing',
  '/contact',
  '/terms',
  '/privacy',
  '/refund-policy',
];

// NEW (15+ pages):
const routes = [
  // Core pages
  '/',
  '/pricing',

  // Feature pages (HIGH PRIORITY)
  '/opportunity-sniffer',
  '/creative-studio',
  '/campaign-manager',
  '/roi-calculator',

  // Use case pages (MEDIUM PRIORITY)
  '/for/media-buyers',
  '/for/agencies',
  '/for/solo-marketers',

  // Support pages (LOW PRIORITY)
  '/contact',
  '/support',

  // Legal (STATIC)
  '/terms',
  '/privacy',
  '/refund-policy',
];

// Update priorities:
return routes.map((path) => {
  let priority = 0.6;
  let changeFrequency = 'monthly';

  if (path === '/') {
    priority = 1.0;
    changeFrequency = 'weekly';
  } else if (path.startsWith('/opportunity-sniffer') ||
             path.startsWith('/creative-studio') ||
             path.startsWith('/campaign-manager')) {
    priority = 0.9; // Feature pages are critical
    changeFrequency = 'weekly';
  } else if (path === '/pricing' || path === '/roi-calculator') {
    priority = 0.8;
    changeFrequency = 'weekly';
  } else if (path.startsWith('/for/')) {
    priority = 0.7; // Use case pages
    changeFrequency = 'monthly';
  }

  return {
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  };
});
```

### 4.2 Meta Tags & Schema Markup

Add to each feature page:

```tsx
// app/opportunity-sniffer/page.tsx
export const metadata = {
  title: 'Find Profitable Ad Arbitrage Opportunities | ArbHunter',
  description: 'Discover trending topics and high-margin countries for Facebook ad arbitrage. AI-powered opportunity scanner finds profitable campaigns before your competitors.',
  keywords: 'ad arbitrage, facebook arbitrage, opportunity scanner, trending topics, ad spy tool',
  openGraph: {
    title: 'Find Profitable Ad Arbitrage Opportunities',
    description: 'AI-powered opportunity scanner for Facebook ad arbitrage',
    url: 'https://arbhunter.dev/opportunity-sniffer',
    images: ['/og/opportunity-sniffer.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Profitable Ad Arbitrage Opportunities',
    description: 'AI-powered opportunity scanner for Facebook ad arbitrage',
    images: ['/og/opportunity-sniffer.png'],
  },
};

// Add structured data
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ArbHunter Opportunity Sniffer",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "description": "AI-powered opportunity scanner for Facebook ad arbitrage",
  "offers": {
    "@type": "AggregateOffer",
    "lowPrice": "39",
    "highPrice": "249",
    "priceCurrency": "USD",
    "priceSpecification": {
      "@type": "UnitPriceSpecification",
      "price": "39",
      "priceCurrency": "USD",
      "billingDuration": "P1M"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
</script>
```

### 4.3 robots.txt Optimization

```txt
# /public/robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /account/
Disallow: /auth/
Disallow: /discovery
Disallow: /creative-studio
Disallow: /campaigns
Disallow: /dashboard

# Allow feature landing pages (different from app routes)
Allow: /opportunity-sniffer
Allow: /creative-studio$
Allow: /campaign-manager

Sitemap: https://arbhunter.dev/sitemap.xml
```

---

## PHASE 5: Conversion Optimization (Week 13-15)

### 5.1 Multi-CTA Strategy

**Homepage Updates:**
- Hero: "Start the hunt" (current) ✓
- After features: "See how it works" → Links to `/opportunity-sniffer`
- Before pricing: "Calculate your ROI" → Links to `/roi-calculator`
- Pricing section: Plan CTAs (current) ✓
- FAQ footer: "Create account" (current) ✓

**Feature Pages:**
- Hero: Primary action (e.g., "Start Discovering")
- After feature section 1: "See it in action" → Demo video/GIF
- After feature section 2: "Try for free"
- Before pricing: "Calculate ROI" → `/roi-calculator`
- Pricing table: Plan selection CTAs
- Footer: "Talk to sales" (for Agency plan)

### 5.2 Progressive Disclosure

**Pricing Page Enhancement:**
```tsx
// Add billing period toggle (like AdCreative.ai)
<PricingToggle
  options={['Monthly', 'Quarterly (-15%)', 'Yearly (-25%)']}
  defaultSelected="Monthly"
/>

// Update plan cards to show:
- Monthly price (default)
- Quarterly price with discount badge
- Yearly price with "Best value" badge
```

### 5.3 Trust Signals

**Add to all pages before pricing:**
```tsx
<TrustBar>
  <Stat icon="🎯" value="50,000+" label="Opportunities discovered" />
  <Stat icon="🎨" value="200,000+" label="Creatives generated" />
  <Stat icon="⭐" value="4.8/5" label="User rating" />
  <Stat icon="🔒" value="SOC 2" label="Compliant" />
</TrustBar>
```

---

## PHASE 6: Subscription UX Improvements (Week 16-18)

### 6.1 Detailed Plan Change Scenarios

**Scenario 1: Agency → Pro (Downgrade)**

**Expected Behavior:**
1. User clicks "Switch to Pro" on billing page
2. API validates:
   - User is on Agency plan ✓
   - New plan is different ✓
3. Dodo API call: `updateDodoSubscription(subscription_id, pro_product_id)`
4. Dodo handles proration automatically
5. Webhook `subscription.updated` is sent
6. Database updated with new plan
7. User sees success message: "Plan changed to PRO. Your next invoice will reflect the new pricing with prorated credit."

**Current Implementation Status:** ✓ Working
**Improvement Needed:** Better user messaging

```tsx
// app/account/billing/BillingClient.tsx
// Line 137: Update success message
toast.success('Plan change requested', { description: 'It can take a few seconds to reflect. Refreshing…' });

// REPLACE WITH:
const upgrading = ['starter', 'pro', 'agency'].indexOf(newPlan) >
                  ['starter', 'pro', 'agency'].indexOf(currentPlan);

toast.success(
  upgrading ? 'Upgrading your plan' : 'Downgrading your plan',
  {
    description: upgrading
      ? 'Activated immediately. Your next invoice will be prorated.'
      : 'Takes effect now. You\'ll receive a prorated credit on your next invoice.'
  }
);
```

**Scenario 2: Starter → Agency (Upgrade)**

**Expected Behavior:** Same as above, but:
- Message emphasizes immediate access to new limits
- Show new monthly limits after page refresh

**Scenario 3: Pro → Pro (Same Plan)**

**Current Handling:** Returns 400 error "Already on this plan"
**Improvement:** Disable the button for current plan

```tsx
// app/account/billing/BillingClient.tsx
// Line 271-274: Add disabled state
<Button
  className="w-full"
  disabled={isWorking || currentPlan === 'starter'}
  onClick={() => changePlan('starter')}
>
  {currentPlan === 'starter' ? 'Current Plan' : 'Switch to Starter'}
</Button>
```

### 6.2 Cancellation Flow Improvements

**Current Flow:**
1. User clicks "Cancel" button
2. Browser confirm() dialog
3. API call to cancel
4. Success toast → page reload

**Improved Flow:**
1. User clicks "Cancel Subscription" button
2. Modal dialog appears with:
   - "Are you sure you want to cancel?"
   - Bullet points of what they'll lose
   - "You'll keep access until [date]"
   - "Need help? Contact support@arbhunter.dev"
   - Two buttons: "Keep My Plan" (primary) and "Yes, Cancel" (destructive)
3. If confirmed, API call
4. Success message with retention CTA

```tsx
// New component: app/account/billing/CancelDialog.tsx
export function CancelDialog({ subscription, onConfirm, onCancel }) {
  const endDate = subscription?.current_period_end
    ? new Date(subscription.current_period_end).toLocaleDateString()
    : 'the end of your billing period';

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel your {subscription?.plan} subscription?</DialogTitle>
          <DialogDescription>
            Before you go, here's what you'll lose:
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 text-sm">
          <li>✗ No more opportunity discoveries</li>
          <li>✗ No more creative generation</li>
          <li>✗ No more campaign organization</li>
        </ul>

        <p className="text-sm text-muted-foreground">
          You'll keep access until <strong>{endDate}</strong>. After that,
          you'll be downgraded to the free plan with limited access.
        </p>

        <p className="text-sm text-muted-foreground">
          Having issues? Contact <a href="mailto:support@arbhunter.dev" className="underline">support@arbhunter.dev</a> - we're here to help!
        </p>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Keep My Plan</Button>
          <Button variant="destructive" onClick={onConfirm}>Yes, Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### 6.3 Error State Handling Matrix

| Scenario | HTTP Status | User-Facing Message | Action |
|----------|-------------|---------------------|--------|
| Not authenticated | 401 | "Please log in to manage your subscription" | Redirect to /auth/login |
| No subscription found | 404 | "No active subscription found. Upgrade from pricing page?" | Link to /pricing |
| Already on plan | 409 | "You're already on the [PLAN] plan" | Disable button |
| Payment method issue | 402 | "Payment method declined. Update billing details or contact support@arbhunter.dev" | Link to update payment |
| Rate limit | 429 | "Too many requests. Please try again in a few seconds" | Retry after 3s |
| Dodo API error | 500 | "Payment system temporarily unavailable. Contact support@arbhunter.dev if this persists" | Retry option |
| Network error | - | "Connection issue. Check your internet and try again" | Retry option |

---

## PHASE 7: Content & Copywriting (Ongoing)

### 7.1 Homepage Updates

**Current H1:**
> "Find better opportunities. Test faster. Scale smarter."

**Improved H1 Options:**
1. "Find Profitable Ad Arbitrage Opportunities in Seconds" (More specific)
2. "Discover, Create, Scale: Your Ad Arbitrage Workflow" (Process-focused)
3. "The Fastest Way to Find and Test Ad Arbitrage Opportunities" (Speed-focused)

**Recommendation:** Option 1 for SEO, Option 3 for conversion

**Current Subheading:**
> "Pick a country + topic, generate ad creatives, and organize results — without spreadsheets and guesswork."

**Keep:** This is clear and benefit-focused ✓

### 7.2 Feature Descriptions

**Update these for SEO:**

| Feature | Current | SEO-Optimized |
|---------|---------|---------------|
| Opportunity Sniffer | "Stop guessing. Find countries + topics worth testing." | "Discover trending ad arbitrage opportunities by country with AI-powered trend detection" |
| Creative Studio | "Generate A/B pairs (2 variations) or batch options quickly." | "Generate high-converting ad creatives with automatic A/B testing in minutes" |
| Article Factory | "Turn a topic into a clean article layout (shipping next)." | "AI-powered article generator for advertorial campaigns (coming soon)" |

### 7.3 Call-to-Action Variations

**Current:** "Start the hunt" (unique, brand-appropriate) ✓

**Additional CTAs for different contexts:**
- Pricing page: "Start 7-Day Trial" (emphasizes trial)
- Feature pages: "Try [Feature Name]" (feature-specific)
- Use case pages: "Start for Free" (removes friction)
- ROI Calculator: "See How to Achieve This" (post-calculation)
- Blog/content: "Get Started" (generic but safe)

---

## Implementation Checklist

### Week 1-2: Critical Fixes
- [ ] Update Paddle → Dodo in SiteFooter.tsx (Line 98)
- [ ] Update Paddle → Dodo in terms/page.tsx (Line 38)
- [ ] Update Paddle → Dodo in privacy/page.tsx (Line 37)
- [ ] Improve error handling in BillingClient.tsx (Lines 136-143, 158)
- [ ] Improve error handling in pricing/page.tsx (Lines 183-198)
- [ ] Update API error messages in change-plan/route.ts (Lines 43-48)
- [ ] Add current plan disabled state to billing buttons

### Week 3-6: Feature Pages
- [ ] Create FeaturePageTemplate component
- [ ] Build /opportunity-sniffer page
- [ ] Build /creative-studio page
- [ ] Build /campaign-manager page
- [ ] Build /roi-calculator page (interactive)
- [ ] Implement internal linking across all pages

### Week 7-9: Use Case Pages
- [ ] Create /for/media-buyers page
- [ ] Create /for/agencies page
- [ ] Create /for/solo-marketers page
- [ ] Add testimonials/case studies (if available)

### Week 10-12: SEO
- [ ] Update sitemap.ts with all new pages
- [ ] Add meta tags to all pages
- [ ] Implement schema markup
- [ ] Update robots.txt
- [ ] Submit sitemap to Google Search Console
- [ ] Set up Google Analytics 4 events

### Week 13-15: Conversion
- [ ] Add billing period toggle to pricing
- [ ] Implement multi-CTA strategy on all pages
- [ ] Add trust signals (stats, badges)
- [ ] Create demo videos/GIFs for feature pages
- [ ] A/B test H1 variations

### Week 16-18: UX
- [ ] Build CancelDialog component
- [ ] Implement error state matrix
- [ ] Add "Contact Support" fallbacks to all error messages
- [ ] Test all subscription change scenarios
- [ ] Add loading states and optimistic UI updates

---

## Success Tracking

### Metrics to Monitor

**SEO Metrics (Google Search Console):**
- Impressions for target keywords
- Click-through rate (target: >3%)
- Average position for "ad arbitrage" keywords
- Number of indexed pages (should go from 6 → 15+)

**Conversion Metrics (GA4):**
- Landing page → Signup conversion rate
- Feature page → Pricing page visits
- Pricing page → Checkout starts
- ROI Calculator → Signup conversion

**User Experience (Hotjar/FullStory):**
- Error message triggers (should decrease)
- Support email volume (should decrease after better errors)
- Plan change completion rate (should increase)

**Business Metrics:**
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Churn rate (should decrease with better UX)

---

## Appendix A: Paddle Removal Audit

### Files with Paddle References

✅ **Ready to remove (safe, just text):**
- components/landing/SiteFooter.tsx:98
- app/terms/page.tsx:38
- app/privacy/page.tsx:37

⚠️ **Keep for backwards compatibility (code):**
- app/api/paddle/* (keep for existing Paddle customers if any)
- lib/paddle.ts (keep until all users migrated)
- lib/paddle-client.ts (keep until all users migrated)
- supabase/migrations/005_subscriptions_paddle.sql (historical, don't delete)
- app/admin/webhooks/paddle/page.tsx (admin tools, keep for now)

⚠️ **Update to support both providers:**
- app/account/billing/BillingClient.tsx (already supports both) ✓
- lib/billing.server.ts (already supports both) ✓

### Migration Strategy for Existing Paddle Users

If there are any users still on Paddle subscriptions:

1. **Don't delete Paddle code** - Keep API routes functional
2. **Add banner to billing page** for Paddle users:
   ```tsx
   {subscription?.provider === 'paddle' && (
     <Alert>
       <Info className="h-4 w-4" />
       <AlertTitle>Payment Provider Update</AlertTitle>
       <AlertDescription>
         We've switched to Dodo Payments for new subscriptions. Your Paddle
         subscription will continue to work normally. When you renew or change
         plans, you'll be migrated to Dodo automatically.
       </AlertDescription>
     </Alert>
   )}
   ```
3. **Set deadline** for migration (e.g., 6 months)
4. **Send email** to Paddle users 30 days before deadline

---

## Appendix B: Quick Reference - AdCreative.ai Patterns

### What We're Replicating:
✅ Dedicated feature pages with consistent structure
✅ Action-verb navigation categorization
✅ Internal linking strategy
✅ Multi-tier pricing with toggles
✅ Trust signals and social proof
✅ FAQ sections on every page
✅ Benefit-focused headlines
✅ Multiple CTAs per page

### What We're NOT Replicating:
❌ 15-20 language localization (not needed yet)
❌ Complex mega-menu (we have fewer features)
❌ Enterprise-level features (not our ICP yet)
❌ Mobile app (we're web-only)
❌ Partner/integration marketplace

---

## Questions for Product Team

1. **Feature Pages:** Do we have mockups/screenshots for each feature? Need high-quality visuals for feature pages.
2. **Metrics:** Can we get actual usage data for trust signals? (e.g., "X opportunities discovered")
3. **Testimonials:** Do we have any customer testimonials or case studies?
4. **Roadmap:** Article Factory is listed as "shipping next" - what's the timeline?
5. **Pricing:** Any plans to add quarterly/yearly billing? AdCreative.ai offers 15-25% discounts for longer commitments.
6. **Support:** Is support@arbhunter.dev actively monitored? We're adding it to all error messages.

---

**End of Plan**

*Next Steps: Review with team → Prioritize phases → Assign tasks → Begin Week 1 implementation*
