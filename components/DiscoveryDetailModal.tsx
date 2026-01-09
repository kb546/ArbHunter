'use client';

import { Discovery } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScoreIndicator } from '@/components/ScoreIndicator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CompetitorAnalysis } from '@/components/CompetitorAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DiscoveryDetailModalProps {
  discovery: Discovery | null;
  open: boolean;
  onClose: () => void;
}

export function DiscoveryDetailModal({ discovery, open, onClose }: DiscoveryDetailModalProps) {
  const router = useRouter();

  if (!discovery) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateCampaign = () => {
    // Navigate to Creative Studio with pre-filled data
    const params = new URLSearchParams({
      discovery: discovery.id,
      niche: discovery.niche,
      geo: discovery.geo,
    });
    router.push(`/creative-studio?${params.toString()}`);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl flex items-center gap-3">
                <ScoreIndicator score={discovery.margin_score} size="lg" />
                <span>{discovery.niche}</span>
              </DialogTitle>
              <DialogDescription>
                {discovery.geo} • Discovered {formatDate(discovery.created_at)}
              </DialogDescription>
            </div>
            <Button
              onClick={handleCreateCampaign}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="analysis" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis">📊 Analysis</TabsTrigger>
            <TabsTrigger value="competitors">🎯 Competitors</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-6 mt-4">
          {/* Score Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">⚡ Score Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                The margin score is calculated from three key factors:
              </p>

              {/* Trend Velocity Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Trend Velocity</span>
                  <span className="text-sm text-muted-foreground">0-40 points</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${(discovery.margin_score / 100) * 100}%`, maxWidth: '40%' }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">
                    ~{Math.round((discovery.margin_score / 100) * 40)}
                  </span>
                </div>
              </div>

              {/* Competition Density Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">Competition Density</span>
                  <span className="text-sm text-muted-foreground">0-30 points</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                      style={{ width: `${(discovery.margin_score / 100) * 100}%`, maxWidth: '30%' }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">
                    ~{Math.round((discovery.margin_score / 100) * 30)}
                  </span>
                </div>
              </div>

              {/* CPC/RPM Spread Bar */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">CPC/RPM Spread</span>
                  <span className="text-sm text-muted-foreground">0-30 points</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                      style={{ width: `${(discovery.margin_score / 100) * 100}%`, maxWidth: '30%' }}
                    />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">
                    ~{Math.round((discovery.margin_score / 100) * 30)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-2">
                💡 Higher scores in each category indicate better arbitrage potential
              </p>
            </CardContent>
          </Card>

          {/* AI Reasoning */}
          {discovery.ai_reasoning && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🤖 AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{discovery.ai_reasoning}</p>
              </CardContent>
            </Card>
          )}

          {/* Trend Velocity */}
          {discovery.trend_velocity && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">📈 Trend Velocity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Search Volume</p>
                    <p className="text-2xl font-bold">
                      {discovery.trend_velocity.search_volume.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Growth Rate</p>
                    <p
                      className={`text-2xl font-bold ${
                        discovery.trend_velocity.growth_rate > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {discovery.trend_velocity.growth_rate > 0 ? '+' : ''}
                      {discovery.trend_velocity.growth_rate.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Peak Interest</p>
                    <p className="text-2xl font-bold">{discovery.trend_velocity.peak_interest}/100</p>
                  </div>
                </div>

                {/* Related Keywords */}
                {discovery.trend_velocity.related_keywords &&
                  discovery.trend_velocity.related_keywords.length > 0 && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-semibold mb-2">Related Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {discovery.trend_velocity.related_keywords.map((keyword, idx) => (
                          <Badge key={idx} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        💡 Use these keywords for ad copy variations and expansion
                      </p>
                    </div>
                  )}
              </CardContent>
            </Card>
          )}

          {/* Competition Data */}
          {discovery.competition_data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">🎯 Competition Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Active Advertisers</p>
                    <p className="text-2xl font-bold">
                      {discovery.competition_data.advertiser_count}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Average CPC</p>
                    <p className="text-2xl font-bold">
                      ${discovery.competition_data.avg_cpc.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Competition Level</p>
                    <Badge
                      variant={
                        discovery.competition_data.competition_level === 'low'
                          ? 'default'
                          : discovery.competition_data.competition_level === 'medium'
                          ? 'secondary'
                          : 'destructive'
                      }
                      className="text-base px-3 py-1"
                    >
                      {discovery.competition_data.competition_level.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm font-semibold mb-2">Market Saturation</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${discovery.competition_data.market_saturation}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">
                      {discovery.competition_data.market_saturation}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {discovery.competition_data.market_saturation < 30
                      ? '✅ Low saturation - good opportunity to enter'
                      : discovery.competition_data.market_saturation < 60
                      ? '⚠️ Moderate saturation - test carefully'
                      : '❌ High saturation - crowded market'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendation */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-lg">💡 Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">
                {discovery.margin_score >= 80 && (
                  <>
                    <strong className="text-green-600">LAUNCH IMMEDIATELY</strong> - This is an
                    excellent opportunity with high profit potential. Start with an aggressive budget
                    and scale quickly.
                  </>
                )}
                {discovery.margin_score >= 60 && discovery.margin_score < 80 && (
                  <>
                    <strong className="text-blue-600">GOOD OPPORTUNITY</strong> - Solid potential for
                    profitability. Launch with a moderate budget and monitor performance closely for
                    the first 48 hours.
                  </>
                )}
                {discovery.margin_score >= 40 && discovery.margin_score < 60 && (
                  <>
                    <strong className="text-yellow-600">TEST CAREFULLY</strong> - Moderate
                    opportunity with some risk. Start with a small test budget ($50-100) and optimize
                    your creative before scaling.
                  </>
                )}
                {discovery.margin_score >= 20 && discovery.margin_score < 40 && (
                  <>
                    <strong className="text-orange-600">HIGH RISK</strong> - Low margin potential.
                    Only proceed if you have specific advantages (existing audience, better
                    creative, lower costs).
                  </>
                )}
                {discovery.margin_score < 20 && (
                  <>
                    <strong className="text-red-600">AVOID</strong> - This opportunity is likely
                    unprofitable. Focus your resources on higher-scoring niches instead.
                  </>
                )}
              </p>
            </CardContent>
          </Card>
          </TabsContent>

          <TabsContent value="competitors" className="mt-4">
            <CompetitorAnalysis geo={discovery.geo} niche={discovery.niche} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

