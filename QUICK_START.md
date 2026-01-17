# Quick Start: Your Specific Questions Answered

## 1. How to Run Migration 017 in Production Supabase

### Easiest Method (Supabase Dashboard):

1. **Open Supabase SQL Editor:**
   - Go to: https://supabase.com/dashboard/project/nvtygtfzqymjmrwsforq/sql

2. **Create New Query:**
   - Click **"New Query"** button

3. **Copy Migration SQL:**
   - Open file: `supabase/migrations/017_dodo_payments.sql`
   - Copy the entire contents (Ctrl+A, Ctrl+C)

4. **Paste and Run:**
   - Paste into SQL Editor
   - Click **"Run"** button (or press Ctrl+Enter)

5. **Verify Success:**
   Run this verification query:
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'subscriptions'
     AND column_name LIKE 'dodo%';
   ```

   You should see 4 new columns:
   - `dodo_customer_id` (text)
   - `dodo_subscription_id` (text)
   - `dodo_price_id` (text)
   - `dodo_transaction_id` (text)

✅ **Done!** Your database now supports Dodo Payments.

---

## 2. Vercel Environment Variables Configuration

### Step-by-Step:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com (log in)
   - Select your **ArbHunter** project
   - Click **Settings** tab
   - Click **Environment Variables** in sidebar

2. **Add Each Variable:**

   Click **"Add New"** button and enter these one by one:

   **For Preview/Development environments (test first):**

   | Name | Value | Environments |
   |------|-------|--------------|
   | `DODO_ENV` | `sandbox` | Preview, Development |
   | `DODO_API_KEY` | `XrQz_nRbm0OViVZd.0hULf9bw1qMh5qNXouIB_uUoyOuscc_eAs5_mnrC60glaDPU` | Preview, Development |
   | `DODO_WEBHOOK_SECRET` | `whsec_VMWl0vvmLele5haGOahe8V+nTvte/dcP` | Preview, Development |
   | `DODO_PRODUCT_STARTER` | `pdt_0NWVAaqAocs2nYthjEuKB` | Preview, Development |
   | `DODO_PRODUCT_PRO` | `pdt_0NWVAmo9j8ktscLdyeDTM` | Preview, Development |
   | `DODO_PRODUCT_AGENCY` | `pdt_0NWVAxBb8ERQbcIVEYcLR` | Preview, Development |
   | `PAYMENT_PROVIDER` | `dodo` | Preview, Development |

   **Important:**
   - Check only **Preview** and **Development** boxes for now
   - Leave **Production** unchecked until you're ready to go live
   - Click **Save** after each variable

3. **Verify Setup:**
   - You should see 7 new environment variables
   - Each should show "Preview, Development" under "Environments"

4. **Redeploy (if needed):**
   - Vercel will automatically redeploy when you push new code
   - Or manually trigger: **Deployments** tab → **•••** → **Redeploy**

✅ **Done!** Vercel now has Dodo credentials for testing.

---

## 3. How to Deploy to Staging First

### Option A: Git Branch Strategy (Recommended)

```bash
# 1. Create staging branch from main
git checkout -b staging

# 2. Commit all Dodo integration code
git add .
git commit -m "feat: integrate Dodo Payments"

# 3. Push to GitHub
git push -u origin staging
```

**What happens:**
- Vercel automatically detects new branch
- Creates preview deployment at: `https://arbhunter-git-staging-yourusername.vercel.app`
- You can test on this URL before merging to main

**When ready to deploy to production:**
```bash
git checkout main
git merge staging
git push origin main
```

### Option B: Use Vercel Preview Deployments

**Every git push creates a preview URL automatically:**

```bash
# Push to any branch
git add .
git commit -m "feat: integrate Dodo Payments"
git push

# Check Vercel dashboard for preview URL
```

Vercel comment on GitHub PR will show: `✅ Preview: https://arbhunter-xyz.vercel.app`

---

## 4. Ensure Claude Can Push to Repo

Your repository is **already configured correctly** for Claude to push:

- ✅ Remote: `https://github.com/kb546/ArbHunter.git`
- ✅ Git user: `tech-decoder` (`bill@ltv.so`)
- ✅ Git credentials configured

**To allow me (Claude) to push on your behalf:**

You need to provide a GitHub Personal Access Token (PAT):

### Create GitHub Token:

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Set name: `Vercel Deployment - Claude`
4. Set expiration: `30 days`
5. Check scopes:
   - ✅ `repo` (Full control of private repositories)
6. Click **"Generate token"**
7. **Copy the token** (starts with `ghp_...`)

### Configure Git Credentials:

```bash
# Option 1: Store credentials temporarily for this session
git config credential.helper cache

# Option 2: Or provide token when pushing
git push https://YOUR_TOKEN@github.com/kb546/ArbHunter.git staging
```

**Alternatively:** You can push manually using your own credentials, which is **recommended for security**.

---

## 5. Checkout Page vs. Redirect URL Strategy

### Your Question: Should you set up a checkout page or use redirect URL?

**My Recommendation: Use Redirect URL (already implemented)**

**Why:**

✅ **Simpler** - No custom checkout page needed
✅ **Secure** - Dodo handles payment securely
✅ **Mobile-friendly** - Works better on mobile browsers
✅ **Less maintenance** - Dodo updates checkout UI automatically
✅ **PCI Compliant** - You don't handle payment data

**How it works (already coded):**

1. User clicks "Upgrade to Starter" on pricing page
2. API creates payment link with metadata (user_id, plan)
3. User redirects to Dodo hosted checkout: `https://test.checkout.dodopayments.com/buy/pdt_XXX`
4. User completes payment on Dodo's secure page
5. Dodo redirects back to: `https://arbhunter.dev/account/billing?checkout=success`
6. Your webhook receives `subscription.created` event
7. Database updated with subscription
8. User sees updated billing status

**If you prefer custom checkout page:**

You'd need to:
- Create custom UI matching your brand
- Use Dodo Elements (their payment form components)
- More complexity, more maintenance

**Verdict:** Stick with redirect URL approach. It's battle-tested and simpler.

---

## 6. Summary: What to Do Next

### Today (30 minutes):

1. ✅ Run database migration in Supabase (5 min)
2. ✅ Add environment variables to Vercel (10 min)
3. ✅ Push code to `staging` branch (5 min)
4. ✅ Update webhook URL in Dodo Dashboard to staging URL (5 min)
5. ✅ Test checkout flow on staging (5 min)

### This Week:

- Test all flows thoroughly on staging
- Fix any bugs discovered
- Monitor webhook logs
- Prepare for production launch

### When Ready for Production:

- Create production Dodo products
- Get production API keys
- Update Vercel Production env vars
- Update webhook URL to `arbhunter.dev`
- Merge staging to main
- Monitor closely for first 24 hours

---

## 7. Testing Commands

### Start Local Dev Server:
```bash
cd /Users/billkamanzi/Documents/ArbHunter
npm run dev
```

### Test Webhook Locally (using ngrok):
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Expose to internet
npx ngrok http 3000

# Copy ngrok URL and update in Dodo Dashboard:
# https://abc123.ngrok.io/api/webhooks/dodo
```

### Check Logs:
```bash
# View Next.js logs
# They'll show "[Dodo Webhook]" and "[Dodo Checkout]" messages

# Check Supabase webhook events (in SQL Editor):
SELECT * FROM webhook_events
WHERE provider = 'dodo'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🚀 Ready to Deploy?

**Checklist before pushing to staging:**

- [ ] Read full guide in `DODO_INTEGRATION_GUIDE.md`
- [ ] Database migration ready to run
- [ ] Vercel env vars list prepared
- [ ] Understand redirect checkout flow
- [ ] Know how to check webhook logs

**When ready, run:**

```bash
git add .
git commit -m "feat: integrate Dodo Payments for subscription billing"
git push origin staging  # Creates preview deployment
```

Then follow the testing checklist in the main guide!

---

Good luck! 🎉 The integration is solid and ready to test.
