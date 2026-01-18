# Opportunity Sniffer Page - Rebuild Notes

## What the Feature ACTUALLY Does (Based on Code Audit)

### Input:
- **GEO** (country code, e.g., "US", "ZA")
- **NICHE** (topic/keyword, e.g., "DHL jobs")

### Process:
1. **getTrendData()**  - Fetches real Google Trends data
   - search_volume (number)
   - growth_rate (percentage)
   - peak_interest (0-100)
   - related_keywords (array)

2. **getCompetitionData()** - Fetches Meta advertising data
   - advertiser_count (number of competitors)
   - avg_cpc (average cost per click in dollars)
   - competition_level ('low' | 'medium' | 'high')
   - market_saturation (0-100)

3. **calculateMarginScore()** - Calculates preliminary score
   - Based on trend velocity, competition density, CPC/RPM spread
   - Returns score 0-100

4. **analyzeOpportunity()** - AI analysis with Claude
   - Adjusts score based on context
   - Provides reasoning
   - Returns adjusted_score (0-100)

### Output:
- **Discovery** object with:
  - margin_score (0-100)
  - trend_velocity (search data)
  - competition_data (Meta data)
  - ai_reasoning (Claude's analysis)

## What I Cannot Claim:
- ❌ "200%+ search spikes" - Not tracked in code
- ❌ "94% accuracy" - No validation data exists
- ❌ "150+ countries monitored" - Not validated
- ❌ "50,000+ opportunities discovered" - No user data yet
- ❌ "4.8/5 rating" - No reviews exist
- ❌ "2-minute average" - Not tracked

## What I CAN Claim (Truthfully):
- ✅ Real-time Google Trends integration
- ✅ Meta advertising competition data
- ✅ AI-powered margin score (0-100)
- ✅ Growth rate analysis
- ✅ Competition level detection (low/medium/high)
- ✅ Average CPC data from Meta
- ✅ Related keywords discovery
- ✅ AI reasoning for each opportunity

## Honest Value Propositions:
1. **Stop Guessing** - Real data from Google Trends + Meta, not hunches
2. **See Competition Clearly** - Know advertiser count and CPC before you spend
3. **AI-Scored Opportunities** - Claude analyzes trend + competition to score viability
4. **Find Related Keywords** - Discover variations you hadn't considered
5. **Compare Markets** - Test different GEOs against same niche

## Accurate Features to Highlight:
- Google Trends integration (real search volume data)
- Meta advertising insights (real CPC and competition)
- AI scoring with reasoning (not just a number, Claude explains why)
- Growth rate tracking (see if interest is rising or falling)
- Competition density (low/medium/high + exact advertiser count)

## Emojis to Remove:
- All of them - use Lucide icons instead
