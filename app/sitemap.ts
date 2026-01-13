import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://arbhunter.dev';

  const now = new Date();

  // Public/marketing routes only (avoid auth-gated app routes).
  const routes = [
    '/',
    '/pricing',
    '/contact',
    '/terms',
    '/privacy',
    '/refund-policy',
  ];

  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : 0.6,
  }));
}

