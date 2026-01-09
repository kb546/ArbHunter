'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, TrendingUp, Users } from 'lucide-react';
import type { CompetitorAd } from '@/services/competitors.service';

interface CompetitorAnalysisProps {
  geo: string;
  niche: string;
}

export function CompetitorAnalysis({ geo, niche }: CompetitorAnalysisProps) {
  const [competitors, setCompetitors] = useState<CompetitorAd[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [metaLibraryUrl, setMetaLibraryUrl] = useState('');
  const [dataSource, setDataSource] = useState<'apify' | 'playwright' | 'mock'>('mock');

  useEffect(() => {
    fetchCompetitors();
  }, [geo, niche]);

  const fetchCompetitors = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ geo, niche }),
      });

      const data = await response.json();
      if (data.success) {
        setCompetitors(data.data.competitors || []);
        setMetaLibraryUrl(data.data.meta_library_url || '');
        setDataSource(data.data.data_source || 'mock');
      }
    } catch (error) {
      console.error('Error fetching competitors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🎯 Competitor Analysis</CardTitle>
          <CardDescription>Loading competitor data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-4xl">⏳</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topCompetitors = competitors.slice(0, 10);

  return (
    <div className="space-y-4">
      {/* Header with Meta Ads Library Link */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Competitor Analysis
              </CardTitle>
              <CardDescription>
                {competitors.length} active advertisers found for "{niche}" in {geo}
                {dataSource && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {dataSource === 'apify' && '🔑 Apify Data'}
                    {dataSource === 'playwright' && '🎭 Browser Data'}
                    {dataSource === 'mock' && '🎭 Demo Data'}
                  </Badge>
                )}
              </CardDescription>
            </div>
            {metaLibraryUrl && (
              <Button asChild variant="default">
                <a href={metaLibraryUrl} target="_blank" rel="noopener noreferrer">
                  View in Meta Ads Library
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Competitor List */}
      <div className="grid gap-4">
        {topCompetitors.map((competitor, idx) => (
          <Card key={competitor.page_id} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-4">
                {/* Advertiser Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      #{idx + 1}
                    </Badge>
                    <h4 className="font-semibold text-lg">{competitor.advertiser_name}</h4>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {competitor.active_ads_count} active {competitor.active_ads_count === 1 ? 'ad' : 'ads'}
                    </span>
                    {competitor.first_seen && (
                      <span>Running since {competitor.first_seen}</span>
                    )}
                  </div>

                  {/* Platforms */}
                  <div className="flex gap-2">
                    {competitor.platforms.map((platform, platformIdx) => (
                      <Badge key={`${competitor.page_id}-${platform}-${platformIdx}`} variant="secondary" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>

                  {/* Ad Preview */}
                  {competitor.ad_preview && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-md border">
                      <p className="text-sm font-medium mb-1">Sample Ad:</p>
                      {competitor.ad_preview.headline && (
                        <p className="text-sm font-semibold text-primary">
                          {competitor.ad_preview.headline}
                        </p>
                      )}
                      {competitor.ad_preview.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {competitor.ad_preview.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-2">
                        {competitor.ad_preview.cta && (
                          <Badge variant="outline" className="text-xs">
                            CTA: {competitor.ad_preview.cta}
                          </Badge>
                        )}
                        {competitor.ad_preview.image_url && (
                          <a
                            href={competitor.ad_preview.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View Landing Page →
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <Button asChild variant="outline" size="sm">
                  <a
                    href={competitor.ad_library_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Ads
                    <ExternalLink className="ml-2 h-3 w-3" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* View More */}
      {competitors.length > 10 && (
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              Showing top 10 of {competitors.length} advertisers.{' '}
              <a
                href={metaLibraryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                View all in Meta Ads Library →
              </a>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {competitors.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">💡 Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              • <strong>Most Active:</strong> {competitors[0].advertiser_name} with{' '}
              {competitors[0].active_ads_count} ads
            </p>
            <p>
              • <strong>Average Ads:</strong>{' '}
              {Math.round(
                (competitors.reduce((sum, c) => sum + c.active_ads_count, 0) /
                  competitors.length) *
                  10
              ) / 10}{' '}
              ads per advertiser
            </p>
            <p>
              • <strong>Market Activity:</strong>{' '}
              {competitors.length < 10
                ? 'Low competition - good opportunity!'
                : competitors.length < 20
                ? 'Moderate competition - test carefully'
                : 'High competition - need strong creative'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

