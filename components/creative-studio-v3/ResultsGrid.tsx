'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Heart, Eye, Trophy, Filter, ArrowDownToLine } from 'lucide-react';
import type { BrandKit, CampaignData, GeneratedCreativeV3 } from '@/types/creative-studio';

interface ResultsGridProps {
  creatives: GeneratedCreativeV3[];
  brandKit: BrandKit;
  campaignData: CampaignData;
  qcMeta?: { attempts: number; bestVariationId?: string | null } | null;
}

export function ResultsGrid({ creatives, brandKit, campaignData, qcMeta }: ResultsGridProps) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-gray-900">Generated Creatives</h2>
            {qcMeta?.attempts ? (
              <Badge variant="outline" className="bg-white">
                QC {qcMeta.attempts === 1 ? 'passed' : 'regenerated'} • {qcMeta.attempts} attempt{qcMeta.attempts === 1 ? '' : 's'}
              </Badge>
            ) : null}
          </div>
          <p className="text-sm text-gray-600 mt-1">
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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCreatives.map((creative, idx) => (
          <Card
            key={creative.id}
            className="overflow-hidden group hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => setSelectedCreative(creative)}
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100">
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
                <Badge variant="secondary" className="bg-white/90 text-xs">
                  {creative.model === 'gemini-2.5-flash-image' ? '⚡ Fast' : '💎 Pro'}
                </Badge>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-5">
              {/* CTR Score */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Predicted CTR</span>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${
                    creative.predictedCTR >= 8 ? 'text-green-600' :
                    creative.predictedCTR >= 5 ? 'text-yellow-600' :
                    'text-gray-600'
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
                  <div className="text-lg font-bold text-gray-900">{creative.visualScore}</div>
                  <div className="text-xs text-gray-600">Visual</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{creative.brandScore}</div>
                  <div className="text-xs text-gray-600">Brand</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-gray-900">{creative.textScore}</div>
                  <div className="text-xs text-gray-600">Text</div>
                </div>
              </div>

              {/* QC Summary (minimal) */}
              <div className="mb-4 flex items-start justify-between gap-2">
                <div className="text-xs text-gray-600">
                  QC Score:{' '}
                  <span className="font-semibold text-gray-900">
                    {typeof creative.qcOverallScore === 'number'
                      ? Math.round(creative.qcOverallScore)
                      : Math.round((creative.visualScore + creative.brandScore + creative.textScore) / 3)}
                    /100
                  </span>
                </div>
                {Array.isArray(creative.qcIssues) && creative.qcIssues.length > 0 ? (
                  <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 max-w-[65%] line-clamp-2">
                    {creative.qcIssues.join(' • ')}
                  </div>
                ) : null}
              </div>

              {/* Copy */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">
                  {creative.headline}
                </p>
                {creative.subheadline && (
                  <p className="text-xs text-gray-600 line-clamp-1 mb-2">
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
            className="max-w-4xl w-full bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image */}
              <div className="aspect-square bg-gray-100">
                <img
                  src={selectedCreative.imageUrl}
                  alt={selectedCreative.headline}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {selectedCreative.headline}
                </h3>
                {selectedCreative.subheadline && (
                  <p className="text-gray-700 mb-6">{selectedCreative.subheadline}</p>
                )}

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Predicted CTR</p>
                    <p className="text-3xl font-bold text-indigo-600">
                      {selectedCreative.predictedCTR.toFixed(1)}%
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Visual</p>
                      <p className="text-xl font-bold">{selectedCreative.visualScore}/100</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Brand</p>
                      <p className="text-xl font-bold">{selectedCreative.brandScore}/100</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Text</p>
                      <p className="text-xl font-bold">{selectedCreative.textScore}/100</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium text-gray-600 mb-2">Model Used</p>
                    <Badge>
                      {selectedCreative.model === 'gemini-2.5-flash-image'
                        ? '⚡ Nano Banana (Fast)'
                        : '💎 Nano Banana Pro'}
                    </Badge>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
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

