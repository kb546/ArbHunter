'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trophy, Link2, Eye, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import type { GeneratedCreativeV3 } from '@/types/creative-studio';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';

interface BatchResultsGridProps {
  creatives: GeneratedCreativeV3[];
  batchMetadata?: {
    totalCost: number;
    totalTime: number;
    abTestPairs?: Array<[string, string]>;
    aiAgentsUsed?: boolean;
  };
}

export function BatchResultsGrid({ creatives, batchMetadata }: BatchResultsGridProps) {
  const [selectedAd, setSelectedAd] = useState<GeneratedCreativeV3 | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Trigger confetti on mount (celebrate batch completion!)
  useState(() => {
    if (creatives.length >= 5) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  });

  // Find A/B pair for an ad
  const findABPair = (adId: string): string | null => {
    if (!batchMetadata?.abTestPairs) return null;
    
    for (const [idA, idB] of batchMetadata.abTestPairs) {
      if (idA === adId) return idB;
      if (idB === adId) return idA;
    }
    return null;
  };

  // Check if ad is in an A/B pair
  const isInABPair = (adId: string): boolean => {
    return findABPair(adId) !== null;
  };

  // Download single image
  const downloadImage = async (creative: GeneratedCreativeV3) => {
    try {
      const response = await fetch(creative.imageUrl);
      const blob = await response.blob();
      saveAs(blob, `${creative.headline.slice(0, 30)}.png`);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Export all ads as ZIP
  const exportAllAsZip = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      
      // Create folders
      const imagesFolder = zip.folder('images');
      
      // Add images
      for (let i = 0; i < creatives.length; i++) {
        const creative = creatives[i];
        const response = await fetch(creative.imageUrl);
        const blob = await response.blob();
        imagesFolder?.file(`ad-${i + 1}.png`, blob);
      }
      
      // Add metadata CSV
      const csvHeader = 'Ad #,Headline,Subheadline,CTA,Predicted CTR,Visual Score,Brand Score,Text Score,Overall Score,Model,Generated At\n';
      const csvRows = creatives.map((c, i) => 
        `${i + 1},"${c.headline}","${c.subheadline || ''}","${c.cta || ''}",${c.predictedCTR},${c.visualScore},${c.brandScore},${c.textScore},${(c.visualScore + c.brandScore + c.textScore) / 3},${c.model},${c.generatedAt}`
      ).join('\n');
      zip.file('ad-copy.csv', csvHeader + csvRows);
      
      // Add metadata JSON
      const metadata = {
        batchSize: creatives.length,
        totalCost: batchMetadata?.totalCost || 0,
        totalTime: batchMetadata?.totalTime || 0,
        aiAgentsUsed: batchMetadata?.aiAgentsUsed || false,
        abTestPairs: batchMetadata?.abTestPairs || [],
        creatives: creatives.map((c, i) => ({
          id: i + 1,
          headline: c.headline,
          subheadline: c.subheadline,
          cta: c.cta,
          predictedCTR: c.predictedCTR,
          visualScore: c.visualScore,
          brandScore: c.brandScore,
          textScore: c.textScore,
          model: c.model,
        })),
        exportedAt: new Date().toISOString(),
      };
      zip.file('metadata.json', JSON.stringify(metadata, null, 2));
      
      // Generate ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `batch-ads-${Date.now()}.zip`);
      
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate best ad (highest overall score)
  const bestAdIndex = creatives.reduce((bestIdx, current, idx, arr) => {
    const currentOverall = (current.visualScore + current.brandScore + current.textScore) / 3;
    const bestOverall = (arr[bestIdx].visualScore + arr[bestIdx].brandScore + arr[bestIdx].textScore) / 3;
    return currentOverall > bestOverall ? idx : bestIdx;
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-lg">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-green-600" />
                Batch Generation Complete!
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {creatives.length} unique ads generated
                {batchMetadata?.aiAgentsUsed && ' • 5 AI Agents Used'}
              </p>
            </div>
            <Button
              onClick={exportAllAsZip}
              disabled={isExporting}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isExporting ? (
                <>Exporting...</>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export All (ZIP)
                </>
              )}
            </Button>
          </div>

          {/* Summary Stats */}
          {batchMetadata && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600">Total Cost</p>
                <p className="text-lg font-bold text-gray-900">${batchMetadata.totalCost.toFixed(4)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600">Time Taken</p>
                <p className="text-lg font-bold text-gray-900">{(batchMetadata.totalTime / 1000).toFixed(1)}s</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600">Per Ad Cost</p>
                <p className="text-lg font-bold text-gray-900">${(batchMetadata.totalCost / creatives.length).toFixed(4)}</p>
              </div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <p className="text-xs text-gray-600">A/B Pairs</p>
                <p className="text-lg font-bold text-gray-900">{batchMetadata.abTestPairs?.length || 0}</p>
              </div>
            </div>
          )}
        </div>

        {/* Results Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creatives.map((creative, index) => {
              const isBest = index === bestAdIndex;
              const abPairId = findABPair(creative.id);
              const isInPair = isInABPair(creative.id);
              const overallScore = Math.round((creative.visualScore + creative.brandScore + creative.textScore) / 3);

              return (
                <motion.div
                  key={creative.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  <Card className={`overflow-hidden group hover:shadow-xl transition-all duration-300 ${
                    isInPair ? 'ring-2 ring-purple-500' : ''
                  }`}>
                    {/* Best Ad Badge */}
                    {isBest && (
                      <div className="absolute top-3 left-3 z-10">
                        <Badge className="bg-yellow-500 text-white shadow-lg flex items-center gap-1 px-3 py-1">
                          <Trophy className="w-3 h-3" />
                          Best Ad
                        </Badge>
                      </div>
                    )}

                    {/* A/B Pair Badge */}
                    {isInPair && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 flex items-center gap-1 px-2 py-1">
                          <Link2 className="w-3 h-3" />
                          A/B
                        </Badge>
                      </div>
                    )}

                    {/* Image */}
                    <div className="aspect-square relative bg-gray-100">
                      <img
                        src={creative.imageUrl}
                        alt={creative.headline}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedAd(creative)}
                          className="text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(creative)}
                          className="text-white bg-green-600 hover:bg-green-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      {/* Headline */}
                      <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
                        {creative.headline}
                      </h3>

                      {/* Subheadline */}
                      {creative.subheadline && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {creative.subheadline}
                        </p>
                      )}

                      {/* CTA */}
                      {creative.cta && (
                        <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                          {creative.cta}
                        </Button>
                      )}

                      {/* Scores */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300 text-xs">
                          CTR: {creative.predictedCTR.toFixed(1)}%
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                          Quality: {overallScore}/100
                        </Badge>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300 text-xs">
                          {creative.model === 'gemini-3-pro-image-preview' ? 'Pro' : 'Fast'}
                        </Badge>
                      </div>

                      {/* Detailed Scores */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Visual</p>
                          <p className="text-sm font-semibold text-gray-800">{creative.visualScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Brand</p>
                          <p className="text-sm font-semibold text-gray-800">{creative.brandScore}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Text</p>
                          <p className="text-sm font-semibold text-gray-800">{creative.textScore}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Ad Detail Modal (optional, can be added later) */}
      {selectedAd && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAd(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Ad Details</h2>
                <Button variant="ghost" onClick={() => setSelectedAd(null)}>
                  ✕
                </Button>
              </div>
              <img src={selectedAd.imageUrl} alt={selectedAd.headline} className="w-full rounded-lg mb-4" />
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700">Headline</h3>
                  <p className="text-gray-900">{selectedAd.headline}</p>
                </div>
                {selectedAd.subheadline && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Subheadline</h3>
                    <p className="text-gray-900">{selectedAd.subheadline}</p>
                  </div>
                )}
                {selectedAd.cta && (
                  <div>
                    <h3 className="font-semibold text-gray-700">Call to Action</h3>
                    <p className="text-gray-900">{selectedAd.cta}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm">Visual Score</h3>
                    <p className="text-2xl font-bold text-blue-600">{selectedAd.visualScore}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm">Brand Score</h3>
                    <p className="text-2xl font-bold text-green-600">{selectedAd.brandScore}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm">Text Score</h3>
                    <p className="text-2xl font-bold text-purple-600">{selectedAd.textScore}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 text-sm">Predicted CTR</h3>
                    <p className="text-2xl font-bold text-yellow-600">{selectedAd.predictedCTR.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}


