'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Download, Heart, Eye, Trophy, Filter, ArrowDownToLine } from 'lucide-react';
import type { BrandKit, CampaignData, GeneratedCreativeV3 } from '@/types/creative-studio';
import type { PolicyCheckResult } from '@/services/policy-compliance.service';

interface ResultsGridProps {
  creatives: GeneratedCreativeV3[];
  brandKit: BrandKit;
  campaignData: CampaignData;
  qcMeta?: { attempts: number; bestVariationId?: string | null } | null;
  policy?: PolicyCheckResult | null;
}

export function ResultsGrid({ creatives, brandKit, campaignData, qcMeta, policy }: ResultsGridProps) {
  const [selectedCreative, setSelectedCreative] = useState<GeneratedCreativeV3 | null>(null);

  const handleDownload = (creative: GeneratedCreativeV3) => {
    // Download image
    const link = document.createElement('a');
    link.href = creative.imageUrl;
    link.download = `${brandKit.name}-${campaignData.type}-${creative.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    creatives.forEach((creative, idx) => {
      setTimeout(() => handleDownload(creative), idx * 500);
    });
  };

  // Sort by predicted CTR
  const sortedCreatives = [...creatives].sort((a, b) => b.predictedCTR - a.predictedCTR);
  const policyById = new Map((policy?.perCreative || []).map((p) => [p.id, p]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-foreground">Generated Creatives</h2>
            {qcMeta?.attempts ? (
              <Badge variant="outline" className="bg-transparent">
                QC {qcMeta.attempts === 1 ? 'passed' : 'regenerated'} • {qcMeta.attempts} attempt{qcMeta.attempts === 1 ? '' : 's'}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {sortedCreatives.length} ad{sortedCreatives.length !== 1 ? 's' : ''} ready for download
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownloadAll}>
            <ArrowDownToLine className="h-4 w-4 mr-2" />
            Download All
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Policy warnings (non-blocking) */}
      {policy && policy.overallRisk !== 'low' ? (
        <Card className="p-4 border border-amber-500/25 bg-amber-500/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/15 border border-amber-500/25 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  Policy risk: {policy.overallRisk.toUpperCase()}
                </div>
                {policy.issues?.length ? (
                  <div className="text-xs text-muted-foreground mt-1">
                    {policy.issues.slice(0, 4).join(' • ')}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground mt-1">
                    Potential policy issues detected. Consider the “Platform Compliant” preset.
                  </div>
                )}
              </div>
            </div>
            <Badge variant="outline" className="bg-transparent">
              {policy.provider === 'openai' ? 'AI check' : 'Heuristic'}
            </Badge>
          </div>
        </Card>
      ) : null}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCreatives.map((creative, idx) => (
          <Card
            key={creative.id}
            className="overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedCreative(creative)}
          >
            {/* Image */}
            <div className="relative aspect-square bg-muted">
              <img
                src={creative.imageUrl}
                alt={creative.headline}
                className="w-full h-full object-cover"
              />

              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(creative);
                  }}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('Favorite feature coming soon!');
                  }}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(creative.imageUrl, '_blank');
                  }}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>

              {/* Best Badge */}
              {idx === 0 && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-green-500 text-white shadow-lg">
                    <Trophy className="h-3 w-3 mr-1" />
                    Best
                  </Badge>
                </div>
              )}

              {/* Model Badge */}
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-[color:var(--card)]/90 text-xs">
                  {creative.model === 'gemini-2.5-flash-image' ? 'Fast' : 'Pro'}
                </Badge>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-5">
              {/* CTR Score */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">Predicted CTR</span>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${
                    creative.predictedCTR >= 8 ? 'text-green-600' :
                    creative.predictedCTR >= 5 ? 'text-yellow-600' :
                    'text-muted-foreground'
                  }`}>
                    {creative.predictedCTR.toFixed(1)}%
                  </div>
                  {idx === 0 && (
                    <span className="text-xs text-green-600 font-medium">Highest</span>
                  )}
                </div>
              </div>

              {/* Quality Scores */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{creative.visualScore}</div>
                  <div className="text-xs text-muted-foreground">Visual</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{creative.brandScore}</div>
                  <div className="text-xs text-muted-foreground">Brand</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-foreground">{creative.textScore}</div>
                  <div className="text-xs text-muted-foreground">Text</div>
                </div>
              </div>

              {/* QC Summary (minimal) */}
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  QC Score:{' '}
                  <span className="font-semibold text-foreground">
                    {typeof creative.qcOverallScore === 'number'
                      ? Math.round(creative.qcOverallScore)
                      : Math.round((creative.visualScore + creative.brandScore + creative.textScore) / 3)}
                    /100
                  </span>
                </div>
                {Array.isArray(creative.qcIssues) && creative.qcIssues.length > 0 ? (
                  <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1 max-w-[65%] line-clamp-2">
                    {creative.qcIssues.join(' • ')}
                  </div>
                ) : null}
              </div>

              {/* Policy badge (per creative) */}
              {policyById.get(creative.id)?.risk && policyById.get(creative.id)?.risk !== 'low' ? (
                <div className="mb-4">
                  <Badge variant="outline" className="bg-transparent border-amber-500/30 text-amber-700 dark:text-amber-300">
                    Policy: {String(policyById.get(creative.id)?.risk).toUpperCase()}
                  </Badge>
                </div>
              ) : null}

              {/* Copy */}
              <div className="pt-4 border-t border-border">
                <p className="text-sm font-semibold text-foreground mb-1 line-clamp-2">
                  {creative.headline}
                </p>
                {creative.subheadline && (
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                    {creative.subheadline}
                  </p>
                )}
                {creative.cta && (
                  <Badge variant="outline" className="text-xs">
                    {creative.cta}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Preview Modal (if needed) */}
      {selectedCreative && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedCreative(null)}
        >
          <div
            className="max-w-4xl w-full bg-card rounded-xl overflow-hidden border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="aspect-square bg-muted">
                <img
                  src={selectedCreative.imageUrl}
                  alt={selectedCreative.headline}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="p-5 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-3">
                  {selectedCreative.headline}
                </h3>
                {selectedCreative.subheadline && (
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{selectedCreative.subheadline}</p>
                )}

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Predicted CTR</p>
                    <p className="text-2xl sm:text-3xl font-semibold text-[color:var(--primary)]">
                      {selectedCreative.predictedCTR.toFixed(1)}%
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Visual</p>
                      <p className="text-xl font-bold">{selectedCreative.visualScore}/100</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Brand</p>
                      <p className="text-xl font-bold">{selectedCreative.brandScore}/100</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Text</p>
                      <p className="text-xl font-bold">{selectedCreative.textScore}/100</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Model Used</p>
                    <Badge>
                      {selectedCreative.model === 'gemini-2.5-flash-image'
                        ? 'Nano Banana (Fast)'
                        : 'Nano Banana Pro'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleDownload(selectedCreative)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedCreative(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

