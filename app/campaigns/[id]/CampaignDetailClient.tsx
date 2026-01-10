'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Image as ImageIcon, Loader2, Star } from 'lucide-react';

type CopyRow = {
  id: string;
  headline: string;
  primary_text: string;
  call_to_action?: string | null;
  generated_at?: string;
};

export function CampaignDetailClient(props: {
  campaignId: string;
}) {
  const { campaignId } = props;
  const [loading, setLoading] = React.useState(true);
  const [variations, setVariations] = React.useState<
    Array<{
      id: string;
      campaign_id: string;
      creative_id: string;
      copy_id: string;
      variation_name?: string | null;
      status: 'untested' | 'testing' | 'winner' | 'loser';
      is_control?: boolean | null;
      predicted_winner?: boolean | null;
      is_favorite?: boolean | null;
      tags?: string[] | null;
    }>
  >([]);
  const [copies, setCopies] = React.useState<CopyRow[]>([]);
  const [busyById, setBusyById] = React.useState<Record<string, boolean>>({});
  const [tagDraftById, setTagDraftById] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    // filled after fetch
    return init;
  });

  const copyById = React.useMemo(() => new Map(copies.map((c) => [c.id, c])), [copies]);

  const [creativeCache, setCreativeCache] = React.useState<
    Record<
      string,
      | { state: 'idle' }
      | { state: 'loading' }
      | { state: 'loaded'; image_url: string }
      | { state: 'error' }
    >
  >({});

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [vRes, cRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}/variations`),
          fetch(`/api/campaigns/${campaignId}/copies`),
        ]);
        const vData = await vRes.json().catch(() => ({}));
        const cData = await cRes.json().catch(() => ({}));
        if (!cancelled) {
          setVariations(Array.isArray(vData.variations) ? vData.variations : []);
          setCopies(Array.isArray(cData.copies) ? cData.copies : []);
          setTagDraftById(() => {
            const init: Record<string, string> = {};
            for (const v of (Array.isArray(vData.variations) ? vData.variations : [])) init[v.id] = (v.tags || []).join(', ');
            return init;
          });
        }
      } catch (e: any) {
        toast.error('Failed to load campaign assets', { description: e?.message || String(e) });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  async function loadCreativeImage(creativeId: string) {
    const existing = creativeCache[creativeId];
    if (existing?.state === 'loading' || existing?.state === 'loaded') return;
    setCreativeCache((m) => ({ ...m, [creativeId]: { state: 'loading' } }));
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/creative/${creativeId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Failed (HTTP ${res.status})`);
      setCreativeCache((m) => ({ ...m, [creativeId]: { state: 'loaded', image_url: data.creative.image_url } }));
    } catch {
      setCreativeCache((m) => ({ ...m, [creativeId]: { state: 'error' } }));
    }
  }

  async function markWinner(variationId: string) {
    if (busyById[variationId]) return;
    setBusyById((m) => ({ ...m, [variationId]: true }));
    // Optimistic update
    setVariations((prev) =>
      prev.map((v) =>
        v.id === variationId
          ? { ...v, status: 'winner', predicted_winner: true, is_favorite: true }
          : { ...v, status: 'loser', predicted_winner: false }
      )
    );
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/variations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_winner', variationId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed (HTTP ${res.status})`);
      if (Array.isArray(data.variations)) setVariations(data.variations);
      toast.success('Winner saved');
    } catch (e: any) {
      // Revert to server truth
      try {
        const res = await fetch(`/api/campaigns/${campaignId}/variations`);
        const data = await res.json().catch(() => ({}));
        if (res.ok && Array.isArray(data.variations)) setVariations(data.variations);
      } catch {
        // ignore
      }
      toast.error('Failed to mark winner', { description: e?.message || String(e) });
    } finally {
      setBusyById((m) => ({ ...m, [variationId]: false }));
    }
  }

  async function toggleFavorite(variationId: string, is_favorite: boolean) {
    if (busyById[variationId]) return;
    setBusyById((m) => ({ ...m, [variationId]: true }));
    setVariations((prev) => prev.map((v) => (v.id === variationId ? { ...v, is_favorite } : v)));
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/variations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_favorite', variationId, is_favorite }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed (HTTP ${res.status})`);
      if (data.variation?.id) {
        setVariations((prev) => prev.map((v) => (v.id === data.variation.id ? data.variation : v)));
      }
    } catch (e: any) {
      // Revert
      setVariations((prev) => prev.map((v) => (v.id === variationId ? { ...v, is_favorite: !is_favorite } : v)));
      toast.error('Failed to update favorite', { description: e?.message || String(e) });
    } finally {
      setBusyById((m) => ({ ...m, [variationId]: false }));
    }
  }

  async function setTags(variationId: string, tagsCsv: string) {
    if (busyById[variationId]) return;
    const tags = tagsCsv
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    try {
      setBusyById((m) => ({ ...m, [variationId]: true }));
      const res = await fetch(`/api/campaigns/${campaignId}/variations`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_tags', variationId, tags }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed (HTTP ${res.status})`);
      if (data.variation?.id) {
        setVariations((prev) => prev.map((v) => (v.id === data.variation.id ? data.variation : v)));
      }
      toast.success('Tags saved');
    } catch (e: any) {
      toast.error('Failed to save tags', { description: e?.message || String(e) });
    } finally {
      setBusyById((m) => ({ ...m, [variationId]: false }));
    }
  }

  function exportCopiesCsv() {
    const headers = ['id', 'headline', 'primary_text', 'call_to_action'];
    const rows = copies.map((c) => [
      c.id,
      c.headline,
      (c.primary_text || '').replace(/\n/g, ' ').slice(0, 800),
      c.call_to_action || '',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-copies-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold text-gray-900">Variations</div>
          <div className="text-sm text-gray-600">{variations.length} linked variants</div>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-gray-600 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading variations…
          </div>
        ) : variations.length === 0 ? (
          <div className="text-sm text-gray-600 mt-2">No variations yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {variations.map((v) => {
              const cp = copyById.get(v.copy_id);
              const creativeState = creativeCache[v.creative_id]?.state || 'idle';
              return (
                <div key={v.id} className="rounded-lg border bg-white p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-full lg:w-40">
                      {creativeState === 'loaded' ? (
                        <img
                          src={(creativeCache[v.creative_id] as any).image_url}
                          alt="creative"
                          className="w-full aspect-square object-cover rounded-md border"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => loadCreativeImage(v.creative_id)}
                          className="w-full aspect-square rounded-md border bg-gray-50 flex flex-col items-center justify-center text-sm text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          {creativeState === 'loading' ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <>
                              <ImageIcon className="h-5 w-5 mb-2 text-gray-500" />
                              Load preview
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-gray-900">{v.variation_name || v.id.slice(0, 6)}</div>
                          <Badge variant="outline">{String(v.status).toUpperCase()}</Badge>
                          {v.predicted_winner ? <Badge>Predicted winner</Badge> : null}
                        </div>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                          onClick={() => toggleFavorite(v.id, !v.is_favorite)}
                          disabled={Boolean(busyById[v.id])}
                        >
                          <Star className={`h-4 w-4 ${v.is_favorite ? 'fill-yellow-400 text-yellow-500' : 'text-gray-400'}`} />
                          Favorite
                        </button>
                      </div>

                      <div className="text-sm text-gray-900 font-medium">{cp?.headline || '—'}</div>
                      <div className="text-sm text-gray-700">{cp?.primary_text || '—'}</div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button
                          variant="outline"
                          className="sm:w-auto"
                          onClick={() => markWinner(v.id)}
                          disabled={Boolean(busyById[v.id])}
                        >
                          Set as winner
                        </Button>
                        <div className="flex-1">
                          <Input
                            value={tagDraftById[v.id] ?? ''}
                            placeholder="Tags (comma separated)"
                            onChange={(e) => setTagDraftById((m) => ({ ...m, [v.id]: e.target.value }))}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                setTags(v.id, (e.target as HTMLInputElement).value);
                              }
                            }}
                            disabled={Boolean(busyById[v.id])}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            Winner = the variation you plan to run as your control. Press Enter to save tags.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-sm text-gray-600">
          {variations.length} variations • {copies.length} copies
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCopiesCsv} disabled={copies.length === 0}>
            Export copies CSV
          </Button>
        </div>
      </div>

      <Card className="p-4 sm:p-5">
        <div className="font-semibold text-gray-900">Creatives</div>
        <div className="text-sm text-gray-600 mt-2">
          Previews are loaded on-demand per variation to keep campaign pages fast.
        </div>
      </Card>

      <Card className="p-4 sm:p-5">
        <div className="font-semibold text-gray-900">Copies</div>
        {copies.length === 0 ? (
          <div className="text-sm text-gray-600 mt-2">No copies yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {copies.map((c) => (
              <div key={c.id} className="rounded-lg border bg-white p-4">
                <div className="font-medium text-gray-900">{c.headline}</div>
                <div className="text-sm text-gray-700 mt-1">{c.primary_text}</div>
                {c.call_to_action ? <div className="text-xs text-gray-500 mt-2">CTA: {c.call_to_action}</div> : null}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

