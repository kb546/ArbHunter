# 🚀 Production Launch Checklist

## ✅ What You've Done So Far

- ✅ Created production products in Dodo Payments
- ✅ Configured production webhook endpoint: `https://arbhunter.dev/api/webhooks/dodo`
- ✅ Got production webhook secret: `whsec_FGM1opGKhIezuweIej6FGPFO+39asIES`
- ✅ Switched Dodo Dashboard to **Live Mode** (confirmed - I can see it in screenshot)
- ✅ Code merged to `main` branch and pushed to GitHub
- ✅ Vercel is deploying to production now

---

## 📋 Remaining Steps (Do These Now)

### Step 1: Get Production API Key from Dodo (2 minutes)

**You mentioned you need guidance on this - here's how:**

1. **In Dodo Dashboard** (make sure you're in **Live Mode** - bottom left)
2. **Click "Developer"** in left sidebar
3. **Click "API Keys"**
4. **Click "Add API key"** button
5. **Fill in:**
   - **Name:** `ArbHunter Production`
   - **Description:** (optional) `Production API key for arbhunter.dev`
6. **Click "Create"** or "Save"
7. **Copy the API key** - it should look like: `XrQz_...` (but different from sandbox)
8. **Save it somewhere safe** (you'll need it for Vercel)

**Important:** This is different from your sandbox key. Make sure you're in Live Mode!

---

### Step 2: Add Production Environment Variables to Vercel (5 minutes)

**Go to:** https://vercel.com/dashboard → Click on **ArbHunter** → **Settings** → **Environment Variables**

**For each variable below, click "Add New":**

#### Variable 1: DODO_ENV
- **Name:** `DODO_ENV`
- **Value:** `production`
- **Environments:** ✅ **Production only** (uncheck Preview and Development)
- Click **Save**

#### Variable 2: DODO_API_KEY
- **Name:** `DODO_API_KEY`
- **Value:** `[Paste the production API key you just created]`
- **Environments:** ✅ **Production only**
- Click **Save**

#### Variable 3: DODO_WEBHOOK_SECRET
- **Name:** `DODO_WEBHOOK_SECRET`
- **Value:** `whsec_FGM1opGKhIezuweIej6FGPFO+39asIES`
- **Environments:** ✅ **Production only**
- Click **Save**

#### Variable 4: DODO_PRODUCT_STARTER
- **Name:** `DODO_PRODUCT_STARTER`
- **Value:** `pdt_0NWV3SOf6otuU24rEfq5V`
- **Environments:** ✅ **Production only**
- Click **Save**

#### Variable 5: DODO_PRODUCT_PRO
- **Name:** `DODO_PRODUCT_PRO`
- **Value:** `pdt_0NWV9AZSQcyZejKlJxyJ4`
- **Environments:** ✅ **Production only**
- Click **Save**

#### Variable 6: DODO_PRODUCT_AGENCY
- **Name:** `DODO_PRODUCT_AGENCY`
- **Value:** `pdt_0NWV9H6zF7EYVJKfORNIF`
- **Environments:** ✅ **Production only**
- Click **Save**

#### Variable 7: PAYMENT_PROVIDER
- **Name:** `PAYMENT_PROVIDER`
- **Value:** `dodo`
- **Environments:** ✅ **Production only**
- Click **Save**

**After adding all variables:**
- Go to **Deployments** tab
- Find the latest production deployment
- Click **"..."** → **"Redeploy"** (to pick up new environment variables)

---

### Step 3: Run Database Migration in Supabase (3 minutes)

**This is CRITICAL - the app won't work without it!**

1. **Go to:** https://supabase.com/dashboard/project/nvtygtfzqymjmrwsforq/sql
2. **Click "New Query"**
3. **Copy the migration SQL** from `/Users/billkamanzi/Documents/ArbHunter/supabase/migrations/017_dodo_payments.sql`
4. **Paste and click "Run"**

**Quick Copy (Paste this):**
```sql
-- Migration 017: Add Dodo Payments Support
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS dodo_customer_id text,
  ADD COLUMN IF NOT EXISTS dodo_subscription_id text,
  ADD COLUMN IF NOT EXISTS dodo_price_id text,
  ADD COLUMN IF NOT EXISTS dodo_transaction_id text,
  ADD COLUMN IF NOT EXISTS provider_metadata jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_provider_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_provider_check
  CHECK (provider IN ('stripe', 'paddle', 'dodo'));

CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_dodo_subscription_id
  ON public.subscriptions(dodo_subscription_id)
  WHERE dodo_subscription_id IS NOT NULL;

ALTER TABLE public.webhook_events
  DROP CONSTRAINT IF EXISTS webhook_events_provider_check;

ALTER TABLE public.webhook_events
  ADD CONSTRAINT webhook_events_provider_check
  CHECK (provider IN ('stripe', 'paddle', 'dodo'));

COMMENT ON COLUMN public.subscriptions.provider_metadata IS 'Provider-specific data (JSON). Used for storing Dodo-specific fields or metadata that don''t fit in standard columns.';
COMMENT ON COLUMN public.subscriptions.dodo_customer_id IS 'Dodo Payments customer ID';
COMMENT ON COLUMN public.subscriptions.dodo_subscription_id IS 'Dodo Payments subscription ID (unique)';
COMMENT ON COLUMN public.subscriptions.dodo_price_id IS 'Dodo Payments price/product ID';
COMMENT ON COLUMN public.subscriptions.dodo_transaction_id IS 'Dodo Payments initial transaction ID';
```

**Expected result:** "Success. No rows returned"

**Verify:**
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'subscriptions' AND column_name LIKE 'dodo%';
```

Should show 4 rows.

---

### Step 4: Test with Real Card (10 minutes)

**Once Vercel deployment completes:**

1. **Go to:** https://arbhunter.dev/pricing
2. **Click "Upgrade to Starter"** (the $39/mo plan with 7-day trial)
3. **You'll be redirected to:** `https://checkout.dodopayments.com/buy/pdt_0NWV3SOf6otuU24rEfq5V`
4. **Use a REAL credit card** (you'll be charged)
5. **Complete checkout**
6. **You should be redirected back to:** `https://arbhunter.dev/account/billing?checkout=success`

**What to verify:**
- ✅ Page shows "Finalizing your upgrade"
- ✅ After a few seconds: "Upgrade complete"
- ✅ Shows plan: **STARTER**
- ✅ Shows status: **TRIALING** or **ACTIVE**

---

### Step 5: Verify in Database (2 minutes)

**Check Supabase to confirm subscription was created:**

```sql
SELECT
  user_id,
  provider,
  plan,
  status,
  dodo_subscription_id,
  dodo_customer_id,
  current_period_end,
  created_at
FROM subscriptions
WHERE provider = 'dodo'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected:**
- You should see your subscription
- `provider` = 'dodo'
- `plan` = 'starter'
- `status` = 'active' or 'trialing'
- `dodo_subscription_id` should have a value

---

### Step 6: Verify Webhook Events (2 minutes)

**Check that webhooks are working:**

```sql
SELECT
  event_type,
  status,
  verified,
  verify_reason,
  created_at
FROM webhook_events
WHERE provider = 'dodo'
ORDER BY created_at DESC
LIMIT 10;
```

**Expected:**
- At least 1 event (`subscription.created` or `subscription.activated`)
- `status` = 'processed'
- `verified` = true
- `verify_reason` = 'Valid signature'

**Also check Dodo Dashboard:**
- Go to: **Developer → Webhooks → Your endpoint**
- Click on it to see **Delivery Logs**
- Should show successful deliveries (200 status)

---

## 🎯 Success Criteria

Before announcing to customers, verify ALL of these:

- [ ] Production API key created in Dodo Dashboard (Live Mode)
- [ ] All 7 environment variables added to Vercel Production
- [ ] Vercel redeployed with new environment variables
- [ ] Database migration run successfully in Supabase
- [ ] Test checkout completed with real card
- [ ] Subscription appears in `subscriptions` table
- [ ] Webhook event appears in `webhook_events` table with `verified=true`
- [ ] Webhook delivery shows 200 status in Dodo Dashboard
- [ ] Billing page shows correct plan and status
- [ ] Can upgrade/downgrade plans
- [ ] Can cancel subscription

---

## 🚨 If Something Goes Wrong

### Issue: Checkout button doesn't work

**Check:**
1. Browser console (F12) for errors
2. Network tab: `/api/dodo/checkout` should return `checkoutUrl`
3. Verify `DODO_PRODUCT_STARTER` environment variable is set

**Fix:**
- Make sure you redeployed Vercel after adding environment variables
- Check that product IDs are correct (copy from Dodo Dashboard → Products)

---

### Issue: Webhook not received (subscription not created)

**Check:**
1. Dodo Dashboard → Webhooks → Delivery Logs
2. Look for 200 or error status codes
3. Check `webhook_events` table for `verify_reason`

**Common causes:**
- ❌ `DODO_WEBHOOK_SECRET` doesn't match (check Vercel env vars)
- ❌ Webhook URL is wrong (should be `https://arbhunter.dev/api/webhooks/dodo`)
- ❌ Database migration not run (dodo_* columns don't exist)

**Fix:**
1. Go to Vercel → Environment Variables
2. Verify `DODO_WEBHOOK_SECRET` = `whsec_FGM1opGKhIezuweIej6FGPFO+39asIES`
3. If wrong, update and redeploy

---

### Issue: TypeScript build error

**If you see build errors like "provider type mismatch":**

This should be fixed already, but if it happens:
- Check that `lib/billing.server.ts` includes `'dodo'` in provider type
- Look at the commit `28168f9` - that's the fix

---

## 📊 Monitoring (After Launch)

### Daily Checks (First Week)

**1. Active Subscriptions:**
```sql
SELECT
  plan,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
  SUM(CASE WHEN status = 'trialing' THEN 1 ELSE 0 END) as trialing
FROM subscriptions
WHERE provider = 'dodo'
GROUP BY plan;
```

**2. Webhook Success Rate:**
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) / COUNT(*), 1) as success_rate
FROM webhook_events
WHERE provider = 'dodo'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

**3. Failed Payments:**
```sql
SELECT * FROM webhook_events
WHERE provider = 'dodo'
  AND event_type = 'payment.failed'
  AND created_at > NOW() - INTERVAL '24 hours';
```

**4. Webhook Errors:**
```sql
SELECT
  event_type,
  verify_reason,
  process_error,
  created_at
FROM webhook_events
WHERE provider = 'dodo'
  AND (verified = false OR status = 'error')
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🎉 You're Ready to Launch!

Once all checklist items are complete, you can:

1. **Announce on your website/social media**
2. **Update your marketing materials** to mention the 7-day trial on Starter plan
3. **Monitor the first few signups closely** (check Supabase after each one)
4. **Set up email notifications** (optional - can add later):
   - Welcome email after signup
   - Trial ending reminder (day 5 of trial)
   - Payment receipt
   - Cancellation confirmation

---

## 📞 Quick Reference

**Production URLs:**
- **Pricing:** https://arbhunter.dev/pricing
- **Billing:** https://arbhunter.dev/account/billing
- **Webhook:** https://arbhunter.dev/api/webhooks/dodo

**Production Credentials:**
- **Webhook Secret:** `whsec_FGM1opGKhIezuweIej6FGPFO+39asIES`
- **Starter Product:** `pdt_0NWV3SOf6otuU24rEfq5V` ($39/mo, 7-day trial)
- **Pro Product:** `pdt_0NWV9AZSQcyZejKlJxyJ4` ($99/mo)
- **Agency Product:** `pdt_0NWV9H6zF7EYVJKfORNIF` ($249/mo)

**Support:**
- **Dodo Support:** support@dodopayments.com
- **Dodo Dashboard:** https://app.dodopayments.com
- **Dodo Docs:** https://docs.dodopayments.com

---

## 🔥 Next Steps After Launch

1. **Day 1-3:** Monitor every signup, check webhooks
2. **Day 4-7:** Start analyzing conversion rates
3. **Week 2:** Set up email notifications
4. **Week 3:** A/B test pricing (if needed)
5. **Week 4:** Review metrics, plan optimizations

---

**You've built a solid billing system!** 🎊

The integration is production-ready. Just complete the remaining steps above and you'll be accepting payments.

Good luck with your launch! 🚀
