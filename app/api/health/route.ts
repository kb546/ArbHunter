import { NextResponse } from 'next/server';

/**
 * Health check endpoint - verifies which services are configured
 * Does NOT expose actual API keys for security
 */
export async function GET() {
  const services = {
    // Database
    supabase: {
      configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      url_present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      key_present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      service_role_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    },
    
    // AI Providers
    ai: {
      openai: !!process.env.OPENAI_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY,
      claude: !!process.env.ANTHROPIC_API_KEY,
    },
    
    // Data APIs
    data_apis: {
      google_trends: !!process.env.GOOGLE_TRENDS_API_KEY,
      apify: !!process.env.APIFY_API_KEY,
    },

    // Billing
    billing: {
      paddle_env: process.env.PADDLE_ENV || null,
      paddle_api_key_present: !!process.env.PADDLE_API_KEY,
      paddle_webhook_secret_present: !!process.env.PADDLE_WEBHOOK_SECRET,
      paddle_products_present: !!(
        process.env.PADDLE_PRODUCT_STARTER &&
        process.env.PADDLE_PRODUCT_PRO &&
        process.env.PADDLE_PRODUCT_AGENCY
      ),
    },
  };

  // Determine overall status
  const hasAnyAI = services.ai.openai || services.ai.gemini || services.ai.claude;
  const hasDatabase = services.supabase.configured;
  const hasDataAPIs = services.data_apis.google_trends && services.data_apis.apify;

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services,
    summary: {
      database: hasDatabase ? '✅ Connected' : '⚠️  Using in-memory storage',
      ai_provider: hasAnyAI ? '✅ AI available' : '⚠️  Using mock AI',
      data_apis: hasDataAPIs ? '✅ Real data enabled' : '⚠️  Using mock data',
    },
    recommendations: [
      ...(!hasDatabase ? ['Consider setting up Supabase for persistent storage'] : []),
      ...(!hasAnyAI ? ['Add at least one AI API key (OpenAI, Gemini, or Claude)'] : []),
      ...(!services.data_apis.google_trends ? ['Add Google Trends API for real trend data'] : []),
      ...(!services.data_apis.apify ? ['Add Apify API for real Meta Ad Library data'] : []),
    ],
  });
}


