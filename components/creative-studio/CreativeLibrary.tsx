'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Image as ImageIcon, FileText, Download, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Campaign, GeneratedCreative, GeneratedCopy } from '@/types/creative-studio';

interface CreativeLibraryProps {
  campaign: Campaign;
}

export function CreativeLibrary({ campaign }: CreativeLibraryProps) {
  const [creatives, setCreatives] = useState<GeneratedCreative[]>([]);
  const [copies, setCopies] = useState<GeneratedCopy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, [campaign.id]);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      // Fetch images
      const imagesRes = await fetch(`/api/campaigns/${campaign.id}/creatives`);
      if (imagesRes.ok) {
        const imagesData = await imagesRes.json();
        setCreatives(imagesData.creatives || []);
      }

      // Fetch copies
      const copiesRes = await fetch(`/api/campaigns/${campaign.id}/copies`);
      if (copiesRes.ok) {
        const copiesData = await copiesRes.json();
        setCopies(copiesData.copies || []);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
      toast.error('Failed to load creative library');
    } finally {
      setIsLoading(false);
    }
  };

  const exportAll = () => {
    toast.info('Export functionality coming soon!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Creative Library</h2>
          <p className="text-slate-600 mt-1">
            All assets for <span className="font-semibold">{campaign.name}</span>
          </p>
        </div>
        <Button onClick={exportAll} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ImageIcon className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{creatives.length}</p>
              <p className="text-sm text-slate-600">Generated Images</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{copies.length}</p>
              <p className="text-sm text-slate-600">Copy Variations</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Sparkles className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{creatives.length * copies.length}</p>
              <p className="text-sm text-slate-600">Possible Combinations</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Assets Tabs */}
      <Tabs defaultValue="images" className="space-y-4">
        <TabsList>
          <TabsTrigger value="images">Images ({creatives.length})</TabsTrigger>
          <TabsTrigger value="copy">Copy ({copies.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="images">
          {creatives.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {creatives.map((creative) => (
                <Card key={creative.id} className="overflow-hidden">
                  <div className="aspect-square bg-slate-100">
                    <img
                      src={creative.image_url}
                      alt={creative.prompt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-slate-600 line-clamp-2">{creative.prompt}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <div className="flex flex-col items-center justify-center py-12">
                <ImageIcon className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500">No images generated yet</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="copy">
          {copies.length > 0 ? (
            <div className="space-y-3">
              {copies.map((copy, index) => (
                <Card key={copy.id || index} className="p-4">
                  <div className="space-y-2">
                    <p className="font-bold">{copy.headline}</p>
                    <p className="text-sm text-slate-700">{copy.primary_text}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <div className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-500">No copy generated yet</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}


