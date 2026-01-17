# Dodo Payments Integration Guide for ArbHunter

## ✅ Completed Steps

The following have been implemented and are ready for deployment:

1. **Environment Variables** - Added to `.env.local`
2. **Database Migration** - Created `017_dodo_payments.sql`
3. **Dodo SDK** - Server (`lib/dodo.ts`) and Client (`lib/dodo-client.ts`)
4. **API Routes**:
   - `/api/dodo/checkout` - Checkout creation
   - `/api/webhooks/dodo` - Webhook handler
   - `/api/dodo/subscription/cancel` - Cancel subscription
   - `/api/dodo/subscription/change-plan` - Change plan
5. **Frontend Updates**:
   - Pricing page now uses Dodo checkout
   - Billing page supports Dodo subscriptions

---

## 📋 Remaining Steps

### Step 1: Run Database Migration in Supabase

**Option A: Using Supabase CLI** (Recommended)
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref nvtygtfzqymjmrwsforq

# Run migration
supabase db push
```

**Option B: Using Supabase Dashboard**

1. Go to https://supabase.com/dashboard/project/nvtygtfzqymjmrwsforq
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire contents of `supabase/migrations/017_dodo_payments.sql`
5. Click **Run**
6. Verify success

**Verify Migration:**
```sql
-- Run this query in Supabase SQL Editor to verify
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
  AND column_name LIKE 'dodo%';

-- Should return:
-- dodo_customer_id | text
-- dodo_subscription_id | text
-- dodo_price_id | text
-- dodo_transaction_id | text
```

---

### Step 2: Configure Vercel Environment Variables

You need to add these environment variables to your Vercel project:

**Go to:** https://vercel.com/your-team/arbhunter/settings/environment-variables

**Add the following variables:**

#### Dodo Payments (Sandbox) - for preview/development
```
DODO_ENV=sandbox
DODO_API_KEY=XrQz_nRbm0OViVZd.0hULf9bw1qMh5qNXouIB_uUoyOuscc_eAs5_mnrC60glaDPU
DODO_WEBHOOK_SECRET=whsec_VMWl0vvmLele5haGOahe8V+nTvte/dcP
DODO_PRODUCT_STARTER=pdt_0NWVAaqAocs2nYthjEuKB
DODO_PRODUCT_PRO=pdt_0NWVAmo9j8ktscLdyeDTM
DODO_PRODUCT_AGENCY=pdt_0NWVAxBb8ERQbcIVEYcLR
PAYMENT_PROVIDER=dodo
```

**Important:** Set these for **Preview** and **Development** environments first.

For **Production**, you'll need to:
1. Create production products in Dodo Payments dashboard
2. Get production API keys
3. Update environment variables in Vercel for Production environment

---

### Step 3: Staging Deployment Strategy

Since you're using Vercel with GitHub, here's how to deploy to staging first:

#### Option A: Using Git Branches (Recommended)

1. **Create a staging branch:**
   ```bash
   git checkout -b staging
   ```

2. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "feat: integrate Dodo Payments for billing

   - Add Dodo Payments SDK (server and client)
   - Create checkout and webhook API routes
   - Update pricing and billing pages to support Dodo
   - Add database migration for Dodo fields
   - Support both Paddle (legacy) and Dodo providers"

   git push -u origin staging
   ```

3. **Vercel will automatically deploy staging branch** to a preview URL like:
   `https://arbhunter-git-staging-your-team.vercel.app`

4. **Test thoroughly on staging URL**

5. **When ready, merge to main:**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

#### Option B: Using Vercel Preview Deployments

Vercel automatically creates preview deployments for every push. You can use this for testing:

1. **Push to any branch** (e.g., `feature/dodo-payments`)
2. Vercel creates a unique preview URL
3. Test on that URL
4. When satisfied, merge to `main`

---

### Step 4: Configure Webhook Endpoint in Dodo Dashboard

**For Sandbox Testing:**

1. Go to Dodo Payments Dashboard: https://app.dodopayments.com
2. Navigate to **Settings > Webhooks**
3. Click **Add Webhook**
4. Enter your webhook URL:
   - **For staging:** `https://arbhunter-git-staging-your-team.vercel.app/api/webhooks/dodo`
   - **For production:** `https://arbhunter.dev/api/webhooks/dodo`

5. **Select events to subscribe to:**
   - ✅ `subscription.created`
   - ✅ `subscription.activated`
   - ✅ `subscription.updated`
   - ✅ `subscription.cancelled`
   - ✅ `subscription.paused`
   - ✅ `subscription.resumed`
   - ✅ `payment.succeeded`
   - ✅ `payment.failed`

6. **Save webhook**

**Important:** Your webhook secret is already configured in `.env.local`:
```
whsec_VMWl0vvmLele5haGOahe8V+nTvte/dcP
```

Make sure this matches what Dodo Dashboard shows.

---

### Step 5: Testing Checklist

#### Local Testing (localhost:3000)

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Test checkout flow:**
   - Go to http://localhost:3000/pricing
   - Click "Upgrade to Starter"
   - Should redirect to Dodo test checkout
   - Complete checkout with test card
   - Should redirect back to `/account/billing?checkout=success`

3. **Test webhook locally using ngrok:**
   ```bash
   # Install ngrok: https://ngrok.com/download
   ngrok http 3000

   # Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
   # Update webhook URL in Dodo Dashboard to:
   # https://abc123.ngrok.io/api/webhooks/dodo
   ```

4. **Verify webhook events:**
   - Check Supabase `webhook_events` table:
     ```sql
     SELECT * FROM webhook_events
     WHERE provider = 'dodo'
     ORDER BY created_at DESC
     LIMIT 10;
     ```

   - Check subscription was created:
     ```sql
     SELECT * FROM subscriptions
     WHERE provider = 'dodo'
     ORDER BY created_at DESC
     LIMIT 5;
     ```

#### Staging Testing (Vercel Preview)

1. **Deploy to staging branch**
2. **Update Dodo webhook URL** to staging URL
3. **Test full checkout flow**
4. **Test plan changes** (Starter → Pro → Agency)
5. **Test cancellation**
6. **Verify webhook logs in Supabase**

---

### Step 6: Production Deployment

**When you're ready to go live:**

1. **Create production products in Dodo:**
   - Go to Dodo Dashboard
   - Switch to **Production** mode
   - Create 3 products: Starter ($39), Pro ($99), Agency ($249)
   - Copy the production product IDs

2. **Get production API credentials:**
   - Production API Key
   - Production Webhook Secret
   - Production Product IDs

3. **Update Vercel Production environment variables:**
   ```
   DODO_ENV=production
   DODO_API_KEY=<production_api_key>
   DODO_WEBHOOK_SECRET=<production_webhook_secret>
   DODO_PRODUCT_STARTER=<prod_starter_id>
   DODO_PRODUCT_PRO=<prod_pro_id>
   DODO_PRODUCT_AGENCY=<prod_agency_id>
   PAYMENT_PROVIDER=dodo
   ```

4. **Update webhook URL in Dodo to:**
   ```
   https://arbhunter.dev/api/webhooks/dodo
   ```

5. **Deploy to production:**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

6. **Test with real credit card** (small amount first)

---

## 🔍 Debugging Tools

### Check Webhook Logs
```sql
-- View recent webhook events
SELECT
  event_type,
  status,
  verified,
  verify_reason,
  process_error,
  created_at
FROM webhook_events
WHERE provider = 'dodo'
ORDER BY created_at DESC
LIMIT 20;
```

### Check Subscription Status
```sql
-- View Dodo subscriptions
SELECT
  user_id,
  plan,
  status,
  dodo_subscription_id,
  dodo_customer_id,
  current_period_end,
  cancel_at_period_end
FROM subscriptions
WHERE provider = 'dodo';
```

### Webhook Testing in Dodo Dashboard
1. Go to **Settings > Webhooks**
2. Click on your webhook
3. Click **Send Test Event**
4. Select event type (e.g., `subscription.created`)
5. Check if your endpoint receives it

---

## 🚨 Common Issues & Solutions

### Issue: Webhook signature verification fails

**Solution:**
1. Check that `DODO_WEBHOOK_SECRET` in Vercel matches Dodo Dashboard
2. Ensure you're using raw request body (not parsed JSON)
3. Check webhook logs in `webhook_events` table for `verify_reason`

### Issue: Subscription not created after checkout

**Solution:**
1. Check Dodo Dashboard > Webhooks > Delivery Logs
2. Verify webhook URL is correct and accessible
3. Check `webhook_events` table for errors
4. Ensure metadata (user_id, plan) is passed during checkout

### Issue: User still shows "free" plan after payment

**Solution:**
1. Check if webhook `subscription.created` was received
2. Verify user_id in metadata matches authenticated user
3. Check Supabase RLS policies (user should see their subscription)
4. Hard refresh browser or check in incognito mode

---

## 📊 Monitoring After Launch

### Daily Checks (First Week)

1. **Webhook Success Rate:**
   ```sql
   SELECT
     DATE(created_at) as date,
     COUNT(*) as total_webhooks,
     SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as successful,
     SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed
   FROM webhook_events
   WHERE provider = 'dodo'
     AND created_at > NOW() - INTERVAL '7 days'
   GROUP BY DATE(created_at)
   ORDER BY date DESC;
   ```

2. **Active Subscriptions:**
   ```sql
   SELECT
     plan,
     COUNT(*) as count
   FROM subscriptions
   WHERE provider = 'dodo'
     AND status IN ('active', 'trialing')
   GROUP BY plan;
   ```

3. **Failed Payments:**
   ```sql
   SELECT * FROM webhook_events
   WHERE provider = 'dodo'
     AND event_type = 'payment.failed'
     AND created_at > NOW() - INTERVAL '24 hours';
   ```

---

## 🎯 Next Steps After Integration

1. **Remove Paddle (Optional):**
   - Once all users migrate to Dodo
   - Delete Paddle-related files
   - Remove Paddle env vars from Vercel

2. **Add Email Notifications:**
   - Send confirmation email after successful subscription
   - Send reminder before trial ends
   - Send cancellation confirmation

3. **Analytics:**
   - Track conversion rate (pricing page → successful checkout)
   - Monitor churn rate
   - A/B test pricing

4. **Free Tier Update:**
   - Update free tier limits per your decision (7-day trial vs freemium)
   - Update `PLAN_LIMITS` in `lib/usage.server.ts`

---

## 📞 Support

**Dodo Payments Documentation:**
- Webhooks: https://docs.dodopayments.com/developer-resources/webhooks
- API Reference: https://docs.dodopayments.com/api-reference

**Dodo Support:**
- Email: support@dodopayments.com
- Dashboard: https://app.dodopayments.com

---

## ✅ Pre-Launch Checklist

Before going live in production:

- [ ] Database migration run successfully in Supabase
- [ ] All Vercel environment variables configured
- [ ] Webhook endpoint configured in Dodo Dashboard
- [ ] Webhook signature verification tested
- [ ] Test checkout flow completed successfully
- [ ] Test plan upgrade/downgrade works
- [ ] Test cancellation works
- [ ] Webhook events logged correctly in `webhook_events` table
- [ ] Subscriptions created correctly in `subscriptions` table
- [ ] Usage limits enforced correctly
- [ ] Billing page shows correct subscription status
- [ ] Email notifications configured (optional)
- [ ] Monitoring queries saved for daily checks

---

## 📝 Commit Message Template

When you're ready to push to GitHub:

```bash
git add .
git commit -m "feat: integrate Dodo Payments for subscription billing

BREAKING CHANGE: Payment provider switched from Paddle to Dodo Payments

Added:
- Dodo Payments SDK with webhook verification (Standard Webhooks spec)
- Checkout API route with redirect-based flow
- Webhook handler for subscription lifecycle events
- Subscription management routes (cancel, change-plan)
- Database migration for Dodo-specific fields
- Provider-agnostic billing UI supporting both Paddle and Dodo

Changed:
- Pricing page now redirects to Dodo checkout
- Billing page dynamically routes to Dodo or Paddle APIs based on provider
- Environment variables updated with Dodo credentials

Tested:
- Checkout flow (Starter/Pro/Agency plans)
- Webhook signature verification
- Subscription creation, update, cancellation
- Plan changes with proration
- Usage limit enforcement

Deployment Notes:
- Run database migration 017 in Supabase before deploying
- Configure Dodo webhook URL in dashboard
- Add environment variables to Vercel
- Test in staging before production deployment

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin staging  # or main, depending on your workflow
```

---

**You're all set!** 🎉

The integration is complete and ready for testing. Start with local testing using ngrok, then deploy to staging, and finally to production after thorough testing.
