# Staging Deployment Test Checklist

## ✅ Completed Steps

1. ✅ Database migration fixed and ready to run
2. ✅ Code committed to `staging` branch
3. ✅ Pushed to GitHub
4. ✅ Vercel environment variables configured (Preview/Development)
5. ✅ Webhook endpoint configured in Dodo Dashboard

---

## 🔄 Next Steps (Do These Now)

### Step 1: Run Database Migration in Supabase (5 minutes)

1. Go to: https://supabase.com/dashboard/project/nvtygtfzqymjmrwsforq/sql
2. Click **"New Query"**
3. Copy the **FIXED** migration SQL from the file `/supabase/migrations/017_dodo_payments.sql`
4. Paste and click **"Run"**

**Expected result:** "Success. No rows returned"

**Verify it worked:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
  AND column_name LIKE 'dodo%';
```

You should see:
- `dodo_customer_id` | text
- `dodo_subscription_id` | text
- `dodo_price_id` | text
- `dodo_transaction_id` | text

---

### Step 2: Wait for Vercel Deployment (2-3 minutes)

1. Go to: https://vercel.com/dashboard
2. Check your **ArbHunter** project
3. Look for the **staging** branch deployment
4. Wait until status shows: **✅ Ready**

**Your staging URL will be:**
```
https://arbhunter-git-staging-bikamanzigmailcoms-projects.vercel.app
```

Or check the Vercel dashboard for the exact URL.

---

### Step 3: Verify Webhook is Configured in Dodo

1. Go to Dodo Dashboard: https://app.dodopayments.com
2. Navigate to **Settings → Webhooks**
3. Verify you have a webhook with:
   - **URL:** `https://arbhunter-git-staging-bikamanzigmailcoms-projects.vercel.app/api/webhooks/dodo`
   - **Events subscribed:** All subscription events (created, updated, cancelled, etc.)
   - **Status:** Active

If not, click **"Add Webhook"** and configure it now.

---

### Step 4: Test Checkout Flow (10 minutes)

#### 4.1 Test Starter Plan Checkout

1. **Go to pricing page:**
   ```
   https://arbhunter-git-staging-bikamanzigmailcoms-projects.vercel.app/pricing
   ```

2. **Click "Upgrade to Starter"**
   - Should redirect to Dodo test checkout
   - URL should be: `https://test.checkout.dodopayments.com/buy/pdt_0NWVAaqAocs2nYthjEuKB`

3. **Complete checkout with test card:**
   - **Card number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g., `12/28`)
   - **CVC:** Any 3 digits (e.g., `123`)
   - **Email:** Your real email (you'll get confirmation)
   - **Name:** Test User

4. **After successful payment:**
   - Should redirect back to: `/account/billing?checkout=success`
   - Page should show "Finalizing your upgrade"
   - After a few seconds, should show "Upgrade complete"
   - Should display:
     - Plan: **STARTER**
     - Status: **ACTIVE** or **TRIALING**

#### 4.2 Verify in Database

Go to Supabase SQL Editor and run:

```sql
-- Check subscription was created
SELECT
  user_id,
  provider,
  plan,
  status,
  dodo_subscription_id,
  dodo_customer_id,
  current_period_end
FROM subscriptions
WHERE provider = 'dodo'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected result:**
- You should see your subscription
- `provider` = 'dodo'
- `plan` = 'starter'
- `status` = 'active' or 'trialing'
- `dodo_subscription_id` should have a value

#### 4.3 Verify Webhook Events

```sql
-- Check webhook events were received
SELECT
  event_type,
  status,
  verified,
  verify_reason,
  created_at
FROM webhook_events
WHERE provider = 'dodo'
ORDER BY created_at DESC
LIMIT 5;
```

**Expected result:**
- At least 1 event (probably `subscription.created` or `subscription.activated`)
- `status` = 'processed'
- `verified` = true
- `verify_reason` = 'Valid signature'

---

### Step 5: Test Plan Change (5 minutes)

1. **Go to billing page:**
   ```
   https://arbhunter-git-staging-bikamanzigmailcoms-projects.vercel.app/account/billing
   ```

2. **Click "Change to Pro"** or similar button
   - Should show success toast
   - Page should reload
   - Plan should update to **PRO**

3. **Verify in database:**
   ```sql
   SELECT plan, status, dodo_price_id
   FROM subscriptions
   WHERE provider = 'dodo'
   ORDER BY updated_at DESC
   LIMIT 1;
   ```

---

### Step 6: Test Cancellation (5 minutes)

1. **On billing page, click "Cancel Subscription"**
   - Confirm the dialog
   - Should show success toast
   - Page should reload
   - Should show: "Your subscription will be cancelled at the end of the billing period"

2. **Verify in database:**
   ```sql
   SELECT status, cancel_at_period_end
   FROM subscriptions
   WHERE provider = 'dodo'
   ORDER BY updated_at DESC
   LIMIT 1;
   ```

   **Expected:**
   - `cancel_at_period_end` = true
   - `status` might still be 'active' (until period ends)

---

## 🐛 Troubleshooting

### Issue: Checkout button doesn't work

**Check:**
1. Browser console for errors (F12 → Console tab)
2. Network tab: Look for `/api/dodo/checkout` request
3. Check if it returns `checkoutUrl`

**Fix:**
- Verify environment variables are set in Vercel
- Check that you're on the staging preview URL (not localhost)

---

### Issue: Webhook not received (subscription not created)

**Check:**
1. Dodo Dashboard → Webhooks → Delivery Logs
2. Look for delivery attempts to your webhook URL
3. Check response code (should be 200)

**Common issues:**
- ❌ Webhook URL is wrong (check it's the staging URL + `/api/webhooks/dodo`)
- ❌ Webhook secret doesn't match environment variable
- ❌ Environment variables not deployed to Preview environment

**Fix:**
1. Go to Vercel → Project → Settings → Environment Variables
2. Verify `DODO_WEBHOOK_SECRET` is set for **Preview** environment
3. Verify it matches the signing secret in Dodo Dashboard
4. Redeploy if needed: Vercel → Deployments → ••• → Redeploy

---

### Issue: Signature verification fails

**Check webhook_events table:**
```sql
SELECT verify_reason, process_error
FROM webhook_events
WHERE provider = 'dodo' AND verified = false
ORDER BY created_at DESC
LIMIT 1;
```

**Common issues:**
- Webhook secret mismatch
- CORS issues (should not happen with server route)

**Fix:**
- Double-check `DODO_WEBHOOK_SECRET` in Vercel matches Dodo Dashboard
- Check Dodo Dashboard → Webhooks → Your webhook → Signing Secret

---

### Issue: "Unauthorized" when clicking checkout

**Cause:** Not logged in

**Fix:**
1. Go to `/auth/login` on staging URL
2. Log in with your account
3. Try checkout again

---

## ✅ Success Criteria

After testing, you should have:

- ✅ Successfully completed a test checkout
- ✅ Subscription created in `subscriptions` table with `provider = 'dodo'`
- ✅ At least one webhook event in `webhook_events` table with `verified = true`
- ✅ Billing page shows correct plan and status
- ✅ Plan change works
- ✅ Cancellation works

---

## 📊 Monitoring Queries

Save these for ongoing monitoring:

### Daily Active Subscriptions
```sql
SELECT
  plan,
  COUNT(*) as count,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
  SUM(CASE WHEN status = 'trialing' THEN 1 ELSE 0 END) as trialing
FROM subscriptions
WHERE provider = 'dodo'
GROUP BY plan;
```

### Webhook Success Rate (Last 24 Hours)
```sql
SELECT
  COUNT(*) as total_webhooks,
  SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed,
  ROUND(100.0 * SUM(CASE WHEN status = 'processed' THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM webhook_events
WHERE provider = 'dodo'
  AND created_at > NOW() - INTERVAL '24 hours';
```

### Recent Checkouts (Last 7 Days)
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as new_subscriptions,
  STRING_AGG(DISTINCT plan, ', ') as plans
FROM subscriptions
WHERE provider = 'dodo'
  AND created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🚀 When Ready for Production

After successful staging testing:

1. **Create production Dodo products** (same prices, but in production mode)
2. **Get production API credentials** from Dodo Dashboard
3. **Update Vercel environment variables** for **Production** environment:
   - `DODO_ENV=production`
   - `DODO_API_KEY=<production_key>`
   - `DODO_WEBHOOK_SECRET=<production_secret>`
   - `DODO_PRODUCT_STARTER=<prod_id>`
   - `DODO_PRODUCT_PRO=<prod_id>`
   - `DODO_PRODUCT_AGENCY=<prod_id>`

4. **Update webhook URL in Dodo** to: `https://arbhunter.dev/api/webhooks/dodo`

5. **Merge to main:**
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```

6. **Test with real card** (small amount first)

7. **Monitor for 48 hours** using the monitoring queries above

---

## 📞 Need Help?

**If you encounter issues:**

1. Check browser console (F12)
2. Check Dodo Dashboard → Webhooks → Delivery Logs
3. Check Supabase `webhook_events` table
4. Check Vercel deployment logs

**Common commands:**

```bash
# Check current branch
git branch

# Switch to staging
git checkout staging

# Pull latest changes
git pull origin staging

# Check Vercel deployment status
# (Go to Vercel dashboard in browser)
```

---

## 🎯 Current Status

- [x] Code deployed to `staging` branch
- [x] Vercel environment variables configured
- [x] Webhook endpoint configured in Dodo
- [ ] **← YOU ARE HERE:** Run database migration in Supabase
- [ ] Test checkout flow on staging URL
- [ ] Verify webhooks working
- [ ] Ready for production

---

**Next immediate action:** Run the database migration in Supabase SQL Editor!
