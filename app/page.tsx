'use client';

import { useState, useEffect } from 'react';
import { DiscoveryForm } from '@/components/DiscoveryForm';
import { BatchDiscovery } from '@/components/BatchDiscovery';
import { ResultsTable } from '@/components/ResultsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Discovery } from '@/types';
import { toast } from 'sonner';
import { openPaddleCheckout } from '@/lib/paddle-client';

export default function Home() {
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch existing discoveries on mount
  useEffect(() => {
    fetchDiscoveries();
  }, []);

  // If Paddle redirects back with ?_ptxn=txn_..., open overlay checkout automatically.
  useEffect(() => {
    const url = new URL(window.location.href);
    const txn = url.searchParams.get('_ptxn');
    if (!txn) return;

    (async () => {
      try {
        console.log('[PADDLE] Detected _ptxn in URL, attempting to open overlay checkout:', txn);
        await openPaddleCheckout(txn);
        // Remove the param to avoid reopening on refresh
        url.searchParams.delete('_ptxn');
        window.history.replaceState({}, '', url.toString());
      } catch (e) {
        console.error('Failed to open Paddle checkout from _ptxn:', e);
        toast.error('Billing error: could not open Paddle checkout', {
          description:
            (e as any)?.message ||
            'Most common cause: NEXT_PUBLIC_PADDLE_CLIENT_TOKEN missing in Vercel Production env vars.',
        });
      }
    })();
  }, []);

  const fetchDiscoveries = async () => {
    try {
      setIsFetching(true);
      const response = await fetch('/api/discoveries');
      const data = await response.json();

      if (data.success && data.data) {
        setDiscoveries(data.data);
      }
    } catch (error) {
      console.error('Error fetching discoveries:', error);
    } finally {
      setIsFetching(false);
    }
  };

  const handleDiscover = async (geo: string, niche: string) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ geo, niche }),
      });

      const data = await response.json();

      if (response.status === 429) {
        toast.error('Usage limit reached', {
          description: data.error || 'You have reached your monthly discovery limit. Upgrade to continue.',
          action: {
            label: 'View plans',
            onClick: () => (window.location.href = '/account/billing'),
          } as any,
        });
        return;
      }

      if (data.success && data.data) {
        setDiscoveries((prev) => [data.data, ...prev]);
        toast.success(`Discovery complete! Margin Score: ${data.data.margin_score}`, {
          description: `Found opportunity for ${niche} in ${geo}`,
        });
      } else {
        toast.error('Discovery failed', {
          description: data.error || 'An unknown error occurred',
        });
      }
    } catch (error) {
      console.error('Error running discovery:', error);
      toast.error('Discovery failed', {
        description: 'Failed to connect to the API',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchDiscover = async (geo: string, niches: string[]) => {
    setIsLoading(true);
    let successCount = 0;
    let failCount = 0;

    toast.info(`Starting batch discovery`, {
      description: `Analyzing ${niches.length} niches in ${geo}...`,
    });

    try {
      // Process niches sequentially to avoid rate limiting
      for (const niche of niches) {
        try {
          const response = await fetch('/api/discover', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ geo, niche }),
          });

          const data = await response.json();

          if (response.status === 429) {
            toast.error('Usage limit reached', {
              description: data.error || 'You have reached your monthly discovery limit. Upgrade to continue.',
              action: {
                label: 'View plans',
                onClick: () => (window.location.href = '/account/billing'),
              } as any,
            });
            break;
          }

          if (data.success && data.data) {
            setDiscoveries((prev) => [data.data, ...prev]);
            successCount++;
          } else {
            failCount++;
          }

          // Small delay to prevent overwhelming the system
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error discovering ${niche}:`, error);
          failCount++;
        }
      }

      // Show summary toast
      if (successCount > 0) {
        toast.success('Batch discovery complete!', {
          description: `Successfully analyzed ${successCount} of ${niches.length} niches`,
        });
      } else {
        toast.error('Batch discovery failed', {
          description: 'All discoveries failed. Please try again.',
        });
      }
    } catch (error) {
      console.error('Error in batch discovery:', error);
      toast.error('Batch discovery failed', {
        description: 'An unexpected error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    // Convert to CSV
    const headers = ['Margin Score', 'GEO', 'Niche', 'Search Volume', 'Growth Rate', 'Competition', 'Date'];
    const rows = discoveries.map((d) => [
      d.margin_score,
      d.geo,
      d.niche,
      d.trend_velocity?.search_volume || 0,
      d.trend_velocity?.growth_rate || 0,
      d.competition_data?.competition_level || 'unknown',
      new Date(d.created_at).toISOString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arbhunter-discoveries-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Export complete', {
      description: 'Your discoveries have been exported to CSV',
    });
  };

  const handleClearResults = () => {
    if (confirm(`Are you sure you want to clear all ${discoveries.length} discoveries? This cannot be undone.`)) {
      setDiscoveries([]);
      toast.success('Results cleared', {
        description: 'All discovery results have been removed',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              ArbHunter
            </span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover profitable ad arbitrage opportunities with AI-powered intelligence
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-[450px_1fr]">
          {/* Discovery Forms */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <Tabs defaultValue="single" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="single">Single Discovery</TabsTrigger>
                <TabsTrigger value="batch">Batch Discovery</TabsTrigger>
              </TabsList>
              <TabsContent value="single" className="mt-4">
                <DiscoveryForm onSubmit={handleDiscover} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="batch" className="mt-4">
                <BatchDiscovery onSubmit={handleBatchDiscover} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Results Table */}
          <div>
            {isFetching ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-4xl mb-4">⏳</div>
                  <p className="text-muted-foreground">Loading discoveries...</p>
                </div>
              </div>
            ) : (
              <ResultsTable 
                discoveries={discoveries} 
                onExport={handleExport} 
                onClear={handleClearResults}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            ArbHunter MVP - Opportunity Sniffer Module
          </p>
        </div>
      </div>
    </div>
  );
}
