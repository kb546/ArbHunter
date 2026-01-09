# 🧪 QUICK TEST GUIDE - AI AGENTS V2

**Status**: ✅ Ready to test  
**Endpoint**: `/api/v3/generate-batch`

---

## 🚀 **FASTEST WAY TO TEST**

### **1. Start Dev Server**
```bash
cd /Users/billkamanzi/Documents/ArbHunter
npm run dev
```

### **2. Test API (5 Ads)**
```bash
curl -X POST http://localhost:3000/api/v3/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "KFC careers",
    "geo": "US",
    "targetAudience": "Job seekers",
    "batchSize": 5,
    "model": "auto"
  }'
```

### **3. Watch Terminal Logs**
You'll see:
```
🚀 BATCH ORCHESTRATOR V2 - AI AGENTS PIPELINE
🎯 Agent 1: Variation Strategist
✅ 5 unique strategies planned
✍️  Agent 2: Copywriting Batch
✅ 5 unique copy variations written
🎨 Agent 3: Visual Designer
✅ 5 unique visual designs created
🔧 Agent 4: Prompt Engineer
✅ 5 optimized Gemini prompts engineered
📸 Gemini Batch Generation
✅ 5 images generated
✅ Agent 5: Quality Control
✅ Quality assessment complete
🎉 BATCH GENERATION COMPLETE!
```

---

## 📊 **EXPECTED OUTPUT**

### **Success Response**
```json
{
  "variations": [
    {
      "id": "var-1704672000000-0",
      "imageUrl": "data:image/jpeg;base64,...",
      "headline": "KFC IS HIRING NOW",
      "subheadline": "Weekly pay, flexible hours, start this week",
      "cta": "APPLY NOW",
      "visualStyle": "minimal",
      "copyTone": "professional",
      "predictedCTR": 7.2,
      "visualScore": 92,
      "brandScore": 95,
      "textScore": 88,
      "overallScore": 91,
      "model": "gemini-3-pro-image-preview",
      "strengths": ["Strong headline", "Excellent brand consistency"],
      "weaknesses": ["CTA could be more urgent"],
      "recommendations": ["Test more urgent CTA"],
      ...
    }
    // ... 4 more variations
  ],
  "totalCost": 0.17,
  "totalTime": 65000,
  "metadata": {
    "niche": "KFC careers",
    "geo": "US",
    "brand": {
      "name": "KFC",
      "detected": true
    },
    "batchSize": 5,
    "modelUsed": "gemini-3-pro-image-preview",
    "abTestPairs": [
      ["var-...-0", "var-...-1"],
      ["var-...-2", "var-...-3"]
    ],
    "aiAgentsUsed": true,
    "costBreakdown": {
      "agent1": 0.01,
      "agent2": 0.02,
      "agent3": 0.01,
      "agent4": 0.01,
      "agent5": 0.02,
      "imageGeneration": 0.10,
      "total": 0.17
    }
  }
}
```

---

## 🧪 **TEST SCENARIOS**

### **Test 1: Small Batch (5 ads)**
```bash
curl -X POST http://localhost:3000/api/v3/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "KFC careers",
    "geo": "US",
    "batchSize": 5
  }'
```
**Expected**: 5 unique ads, ~$0.085, ~35s

### **Test 2: Medium Batch (10 ads)**
```bash
curl -X POST http://localhost:3000/api/v3/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "McDonald's hiring",
    "geo": "UK",
    "batchSize": 10
  }'
```
**Expected**: 10 unique ads, ~$0.17, ~65s

### **Test 3: Large Batch (20 ads)**
```bash
curl -X POST http://localhost:3000/api/v3/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "Online loans",
    "geo": "US",
    "targetAudience": "People with bad credit",
    "batchSize": 20
  }'
```
**Expected**: 20 unique ads, ~$0.34, ~120s

### **Test 4: Fast Mode (Cheaper)**
```bash
curl -X POST http://localhost:3000/api/v3/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "Uber Eats driver",
    "geo": "CA",
    "batchSize": 5,
    "model": "fast"
  }'
```
**Expected**: 5 ads with `gemini-2.5-flash-image`, ~$0.06

### **Test 5: Pro Mode (Best Quality)**
```bash
curl -X POST http://localhost:3000/api/v3/generate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "niche": "Luxury watches",
    "geo": "AE",
    "batchSize": 5,
    "model": "pro"
  }'
```
**Expected**: 5 ads with `gemini-3-pro-image-preview`, ~$0.10

---

## 🐛 **TROUBLESHOOTING**

### **Issue: OpenAI API Error**
```
❌ Variation Strategist failed: OpenAI API error
⚠️  Falling back to template strategies
```
**Solution**: This is expected! System falls back to templates. Ads still generated.

### **Issue: Gemini API Error**
```
❌ Image generation failed
```
**Solution**: Check `GEMINI_API_KEY` in `.env.local`

### **Issue: Slow Generation**
```
Total time: 120000ms (2 minutes)
```
**Causes**:
- Large batch size (20 ads)
- Network latency
- Gemini API rate limits

**Solutions**:
- Use smaller batches (5-10 ads)
- Switch to "fast" mode
- Check internet connection

---

## 📋 **VALIDATION CHECKLIST**

After testing, verify:

- [ ] All 5 agents executed successfully
- [ ] Each ad has unique headline/subheadline/CTA
- [ ] Visual scores are 80-100
- [ ] Brand scores are 85-100 (if brand detected)
- [ ] Total cost is correct ($0.017 per ad)
- [ ] A/B test pairs are recommended
- [ ] Images are generated (base64 or URLs)
- [ ] No TypeScript errors in terminal
- [ ] Response time < 2 minutes

---

## 🎯 **WHAT TO LOOK FOR**

### **Good Signs** ✅
- Different headlines for each ad
- Different visual styles mentioned
- Different CTAs
- Unique prompts (check `prompt` field)
- Scores vary between ads
- A/B pairs recommended
- Cost breakdown included

### **Red Flags** ❌
- Same headline repeated
- All scores identical
- No A/B pairs
- Cost = $0 (fallback mode)
- All ads look identical
- Missing fields in response

---

## 💡 **PRO TIPS**

1. **Start Small**: Test with 5 ads first
2. **Check Logs**: Terminal logs show full AI agent pipeline
3. **Save Images**: Base64 images can be large, save to files
4. **Compare Variations**: Look for true uniqueness
5. **Test Brands**: Try "KFC careers", "McDonald's hiring", "Uber Eats driver"

---

## 🔄 **ITERATE & IMPROVE**

Based on test results:
1. Adjust agent prompts if quality is low
2. Tune cost/quality tradeoff (fast vs. pro)
3. Add more brands to brand-intelligence.service.ts
4. Refine A/B test pair logic
5. Optimize agent execution (parallel vs. sequential)

---

## 📞 **NEED HELP?**

Check these files:
- `services/agents-v2/*.service.ts` - Individual agents
- `services/batch-orchestrator.service.ts` - Full pipeline
- `app/api/v3/generate-batch/route.ts` - API endpoint
- `DAY2_COMPLETE.md` - Full documentation

---

**Happy Testing! 🚀**


