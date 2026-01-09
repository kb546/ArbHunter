# 🔐 Phase 3: Authentication & Billing - Implementation Plan

**Goal:** Make ArbHunter production-ready in 7-10 days  
**Priority:** Critical blockers only  
**Focus:** Ship fast, iterate later

---

## 📋 Implementation Checklist

### **Day 1-2: Authentication with Supabase** 🔐

#### **What to Build:**

1. **Supabase Auth Setup** (2 hours)
```bash
# Already have Supabase project, just need to enable Auth
# In Supabase Dashboard → Authentication → Settings
# Enable Email provider
# Configure email templates
```

2. **Auth Pages** (4 hours)
   - `/app/auth/signup/page.tsx` - Signup form
   - `/app/auth/login/page.tsx` - Login form
   - `/app/auth/forgot-password/page.tsx` - Password reset
   - `/app/auth/callback/route.ts` - OAuth callback handler

3. **Auth Context** (2 hours)
```typescript
// app/providers/auth-provider.tsx
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

4. **Protected Routes Middleware** (2 hours)
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  // Protect /creative-studio and /api routes
  if (!session && (
    req.nextUrl.pathname.startsWith('/creative-studio') ||
    req.nextUrl.pathname.startsWith('/api/discover') ||
    req.nextUrl.pathname.startsWith('/api/v3')
  )) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return res;
}
```

5. **Database Schema Updates** (1 hour)
```sql
-- Add user_id to all tables
ALTER TABLE discoveries ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE campaigns ADD COLUMN user_id UUID REFERENCES auth.users(id);
ALTER TABLE creatives ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Add RLS policies (Row Level Security)
ALTER TABLE discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own discoveries"
  ON discoveries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only create their own discoveries"
  ON discoveries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Repeat for campaigns and creatives
```

6. **Update API Routes** (2 hours)
```typescript
// app/api/discover/route.ts
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rest of your code, but add user_id to DB inserts
  const { data, error } = await supabase
    .from('discoveries')
    .insert({
      ...discoveryData,
      user_id: session.user.id, // Add this
    });
}
```

**Total Time:** 13 hours (~2 days)

---

### **Day 3-4: Stripe Integration & Pricing** 💳

#### **What to Build:**

1. **Stripe Account Setup** (1 hour)
```bash
# Create Stripe account at stripe.com
# Get API keys (test mode)
# Add to .env.local:
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

2. **Pricing Page** (3 hours)
```typescript
// app/pricing/page.tsx
export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: 0,
      features: [
        '5 discoveries/month',
        '10 ad creatives/month',
        'Watermarked exports',
        'Community support',
      ],
    },
    {
      name: 'Starter',
      price: 29,
      priceId: 'price_starter_monthly', // Stripe price ID
      features: [
        '50 discoveries/month',
        '100 ad creatives/month',
        'No watermarks',
        'Email support',
        'All creative presets',
      ],
      popular: true,
    },
    {
      name: 'Pro',
      price: 79,
      priceId: 'price_pro_monthly',
      features: [
        '200 discoveries/month',
        '500 ad creatives/month',
        'Priority generation',
        'Priority support',
        'A/B testing tools',
        'CSV exports',
      ],
    },
    {
      name: 'Agency',
      price: 199,
      priceId: 'price_agency_monthly',
      features: [
        'Unlimited discoveries',
        '2,000 ad creatives/month',
        'White-label option',
        'API access',
        'Dedicated support',
        'Team collaboration',
      ],
    },
  ];

  return (
    <div className="pricing-grid">
      {plans.map(plan => (
        <PricingCard key={plan.name} plan={plan} />
      ))}
    </div>
  );
}
```

3. **Stripe Products & Prices** (1 hour)
```bash
# In Stripe Dashboard → Products
# Create 3 products (Starter, Pro, Agency)
# Create recurring prices for each
# Copy price IDs to your code
```

4. **Checkout API Route** (3 hours)
```typescript
// app/api/checkout/route.ts
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const { priceId } = await req.json();
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Create Stripe checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    client_reference_id: session.user.id,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing?canceled=true`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

5. **Webhook Handler** (4 hours)
```typescript
// app/api/webhooks/stripe/route.ts
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Update user subscription in DB
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      await supabase.from('subscriptions').insert({
        user_id: session.client_reference_id,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan: getPlanFromPriceId(session.line_items?.data[0]?.price?.id),
        status: 'active',
      });

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Update subscription status
      await supabase
        .from('subscriptions')
        .update({ status: subscription.status })
        .eq('stripe_subscription_id', subscription.id);

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Cancel subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
```

6. **Subscriptions Table** (1 hour)
```sql
-- supabase/migrations/003_subscriptions.sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'pro', 'agency')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

**Total Time:** 13 hours (~2 days)

---

### **Day 5: Usage Limits & Tracking** 📊

#### **What to Build:**

1. **Usage Table** (1 hour)
```sql
-- supabase/migrations/004_usage_tracking.sql
CREATE TABLE usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  discoveries_count INT DEFAULT 0,
  creatives_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Add RLS
ALTER TABLE usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own usage"
  ON usage FOR SELECT
  USING (auth.uid() = user_id);
```

2. **Usage Tracking Service** (3 hours)
```typescript
// services/usage.service.ts
import { supabase } from '@/lib/supabase';

export async function checkUsageLimit(
  userId: string,
  type: 'discoveries' | 'creatives'
): Promise<{ allowed: boolean; limit: number; used: number }> {
  // Get user's plan
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan')
    .eq('user_id', userId)
    .single();

  const plan = sub?.plan || 'free';
  
  // Define limits
  const limits = {
    free: { discoveries: 5, creatives: 10 },
    starter: { discoveries: 50, creatives: 100 },
    pro: { discoveries: 200, creatives: 500 },
    agency: { discoveries: 9999, creatives: 2000 },
  };

  const limit = limits[plan][type];

  // Get current month's usage
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: usage } = await supabase
    .from('usage')
    .select(`${type}_count`)
    .eq('user_id', userId)
    .gte('period_start', startOfMonth.toISOString())
    .single();

  const used = usage?.[`${type}_count`] || 0;

  return {
    allowed: used < limit,
    limit,
    used,
  };
}

export async function incrementUsage(
  userId: string,
  type: 'discoveries' | 'creatives',
  count: number = 1
) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);

  // Upsert usage record
  await supabase.from('usage').upsert({
    user_id: userId,
    period_start: startOfMonth.toISOString(),
    period_end: endOfMonth.toISOString(),
    [`${type}_count`]: supabase.sql`${type}_count + ${count}`,
  });
}
```

3. **Middleware for API Routes** (2 hours)
```typescript
// lib/api-middleware.ts
import { checkUsageLimit, incrementUsage } from '@/services/usage.service';

export async function withUsageLimit(
  req: Request,
  type: 'discoveries' | 'creatives'
) {
  const session = await getSession(req);
  if (!session) {
    return { error: 'Unauthorized', status: 401 };
  }

  const { allowed, limit, used } = await checkUsageLimit(session.user.id, type);

  if (!allowed) {
    return {
      error: `Usage limit exceeded. You've used ${used}/${limit} ${type} this month. Upgrade to continue.`,
      status: 429,
      data: { limit, used, upgradeUrl: '/pricing' },
    };
  }

  // Usage is allowed, increment count
  await incrementUsage(session.user.id, type);

  return { allowed: true };
}
```

4. **Update API Routes with Limits** (2 hours)
```typescript
// app/api/discover/route.ts
export async function POST(req: Request) {
  // Check usage limit
  const limitCheck = await withUsageLimit(req, 'discoveries');
  if (!limitCheck.allowed) {
    return NextResponse.json(
      { error: limitCheck.error, ...limitCheck.data },
      { status: limitCheck.status }
    );
  }

  // Proceed with discovery
  // ... your existing code ...
}
```

5. **Usage UI Component** (2 hours)
```typescript
// components/usage-indicator.tsx
export function UsageIndicator() {
  const { user } = useAuth();
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    if (user) {
      fetch('/api/usage')
        .then(res => res.json())
        .then(setUsage);
    }
  }, [user]);

  if (!usage) return null;

  const discoveryPercent = (usage.discoveries.used / usage.discoveries.limit) * 100;
  const creativePercent = (usage.creatives.used / usage.creatives.limit) * 100;

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Your Usage This Month</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Discoveries</span>
            <span>{usage.discoveries.used} / {usage.discoveries.limit}</span>
          </div>
          <Progress value={discoveryPercent} />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>Ad Creatives</span>
            <span>{usage.creatives.used} / {usage.creatives.limit}</span>
          </div>
          <Progress value={creativePercent} />
        </div>
      </div>

      {(discoveryPercent > 80 || creativePercent > 80) && (
        <Button variant="outline" className="w-full mt-4" asChild>
          <Link href="/pricing">Upgrade Plan</Link>
        </Button>
      )}
    </Card>
  );
}
```

**Total Time:** 10 hours (~1.5 days)

---

### **Day 6-7: Polish & Testing** 🧪

#### **What to Build:**

1. **User Dashboard** (4 hours)
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const { user } = await getUser();
  const subscription = await getSubscription(user.id);
  const usage = await getUsage(user.id);
  const recentCampaigns = await getRecentCampaigns(user.id);

  return (
    <div className="space-y-8">
      <h1>Welcome back, {user.email}!</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <StatCard title="Plan" value={subscription.plan} />
        <StatCard title="Discoveries" value={`${usage.discoveries.used}/${usage.discoveries.limit}`} />
        <StatCard title="Creatives" value={`${usage.creatives.used}/${usage.creatives.limit}`} />
      </div>

      <UsageIndicator />

      <RecentCampaigns campaigns={recentCampaigns} />
    </div>
  );
}
```

2. **Billing Portal** (2 hours)
```typescript
// app/api/create-portal-session/route.ts
export async function POST(req: Request) {
  const session = await getSession(req);
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', session.user.id)
    .single();

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
  });

  return NextResponse.json({ url: portalSession.url });
}
```

3. **Upgrade Prompts** (2 hours)
```typescript
// components/upgrade-modal.tsx
export function UpgradeModal({ isOpen, onClose, reason }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Continue</DialogTitle>
          <DialogDescription>
            {reason === 'discoveries' && 
              "You've reached your discovery limit for this month."}
            {reason === 'creatives' && 
              "You've reached your creative generation limit for this month."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <PricingCards compact />
          <Button asChild>
            <Link href="/pricing">View All Plans</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

4. **Email Notifications** (2 hours)
```typescript
// lib/email.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(user) {
  await resend.emails.send({
    from: 'ArbHunter <welcome@arbhunter.com>',
    to: user.email,
    subject: 'Welcome to ArbHunter!',
    html: `
      <h1>Welcome to ArbHunter!</h1>
      <p>You're now part of the most advanced ad arbitrage platform.</p>
      <a href="https://arbhunter.com/dashboard">Get Started</a>
    `,
  });
}

export async function sendUsageWarning(user, type, percent) {
  await resend.emails.send({
    from: 'ArbHunter <alerts@arbhunter.com>',
    to: user.email,
    subject: `You've used ${percent}% of your ${type} limit`,
    html: `
      <p>You're running low on ${type} for this month.</p>
      <a href="https://arbhunter.com/pricing">Upgrade Now</a>
    `,
  });
}
```

5. **Testing Suite** (4 hours)
- Test signup flow
- Test login flow
- Test checkout flow
- Test webhook handling
- Test usage limits
- Test upgrade prompts
- Test billing portal

6. **Documentation Updates** (2 hours)
- Update README with auth info
- Create user guide
- Create video walkthrough (5 min Loom)

**Total Time:** 16 hours (~2 days)

---

## 📊 Total Implementation Time

| Task | Time | Days |
|------|------|------|
| Authentication | 13 hours | 2 |
| Stripe Integration | 13 hours | 2 |
| Usage Limits | 10 hours | 1.5 |
| Polish & Testing | 16 hours | 2 |
| **Total** | **52 hours** | **7.5 days** |

---

## 🎯 Post-Implementation Checklist

### **Before Launch:**
- [ ] All features tested in staging
- [ ] Stripe webhooks working (test in Stripe dashboard)
- [ ] Email notifications sending
- [ ] Usage limits enforcing correctly
- [ ] RLS policies preventing data leaks
- [ ] Upgrade prompts showing at right times
- [ ] Billing portal accessible
- [ ] Error handling for failed payments

### **Launch Day:**
- [ ] Deploy to production (Vercel)
- [ ] Set Stripe to live mode
- [ ] Update Stripe webhook URL to production
- [ ] Test complete flow (signup → upgrade → generate ads)
- [ ] Monitor errors (Sentry or similar)
- [ ] Prepare customer support email

---

## 💰 Expected Costs

### **Monthly SaaS Costs:**
- Supabase: $25/month (Pro plan)
- Stripe: 2.9% + $0.30 per transaction
- Resend (email): $20/month (1000 emails/month)
- Vercel: Free (hobby) or $20/month (Pro)
- **Total:** ~$65/month + Stripe fees

### **Per-User Costs:**
- AI generation: $3/user/month (at usage limits)
- Break-even: 3 Starter users ($87 revenue)

---

## 🚀 You're Almost There!

**Current State:** 80% complete (technical excellence)  
**After This:** 95% complete (business ready)  
**Time to Launch:** 7-10 days

**Focus on execution. The hard part (AI system) is done. The rest is standard SaaS plumbing.**

**You got this!** 💪
