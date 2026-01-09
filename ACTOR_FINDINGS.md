# Apify Actor Test Results - January 6, 2026

## 🚨 CRITICAL FINDING

The `whoareyouanas/meta-ad-scraper` actor **IS FUNDAMENTALLY BROKEN**.

### Problem:
- **Ignores country parameter**: Asked for ZA, scraped US instead
- **Returns wrong results**: "KFC careers" returns Loop earplugs
- **Not fixed by paid plan**: Still broken even with Starter subscription

### Evidence:
```
Input: { searchQuery: "KFC careers", countries: ["ZA"] }
Actual URL: .../country=US&...&view_all_page_id=517850318391712
Results: Loop earplugs, Test pave, etc. (NOT KFC)
```

## Tested Actors

### 1. ❌ whoareyouanas/meta-ad-scraper
- **Cost**: $10/1000 ads ($0.0001/ad)
- **Speed**: 65 seconds
- **Status**: BROKEN - Ignores parameters
- **Verdict**: DO NOT USE

### 2. ❌ apip1/facebook-ad-library-scraper  
- **Cost**: $14.99/month
- **Status**: Actor not found
- **Verdict**: Doesn't exist

### 3. ⚠️ scraper-engine/facebook-ads-library-scraper
- **Cost**: $15.99/month + usage
- **Status**: Requires rental (free trial expired)
- **Verdict**: NEEDS TESTING - Likely the best option

## 🎯 Recommendation

### Option A: Rent scraper-engine actor (RECOMMENDED)
1. Go to: https://console.apify.com/actors/LsmYF0nv6Jb7G1vbx
2. Click "Rent Actor" ($15.99/month)
3. We'll test it immediately

**Why:** It's a professional actor with proper parameter handling.

### Option B: Build our own scraper
- Use Bright Data or Oxylabs residential proxies
- Build custom Playwright scraper
- More control, but more work
- Cost: ~$500/month for proxies

### Option C: Use Meta Official API
- Apply for Meta Marketing API access
- Requires business verification
- Takes 1-2 weeks approval
- Most accurate and reliable
- Cost: Free (with rate limits)

## Next Steps

**IMMEDIATE ACTION:**
1. Rent `scraper-engine/facebook-ads-library-scraper` for $15.99/month
2. Test it thoroughly
3. If it works → integrate it into ArbHunter
4. If it doesn't work → Switch to Option B or C

**Total Monthly Cost Estimate:**
- Apify Starter: $39/month
- scraper-engine rental: $15.99/month  
- Compute units: ~$20-30/month
- **Total: ~$75-85/month**

This is reasonable for a functioning SaaS MVP.


