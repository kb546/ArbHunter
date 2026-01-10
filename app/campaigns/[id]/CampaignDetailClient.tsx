'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Star } from 'lucide-react';

type CreativeRow = {
  id: string;
  image_url: string;
  prompt: string;
  model?: string | null;
  cost?: number | null;
  generated_at?: string;
};

type CopyRow = {
  id: string;
  headline: string;
  primary_text: string;
  call_to_action?: string | null;
  generated_at?: string;
};

export function CampaignDetailClient(props: {
  creatives: CreativeRow[];
  copies: CopyRow[];
  variations: Array<{
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
  }>;
  campaignId: string;
}) {
  const { creatives, copies, campaignId } = props;
  const [variations, setVariations] = React.useState(props.variations);
  const [busyById, setBusyById] = React.useState<Record<string, boolean>>({});
  const [tagDraftById, setTagDraftById] = React.useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const v of props.variations) init[v.id] = (v.tags || []).join(', ');
    return init;
  });

  const creativeById = new Map(creatives.map((c) => [c.id, c]));
  const copyById = new Map(copies.map((c) => [c.id, c]));

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

  function exportCreativesCsv() {
    const headers = ['id', 'image_url', 'model', 'cost', 'prompt'];
    const rows = creatives.map((c) => [
      c.id,
      c.image_url,
      c.model || '',
      c.cost ?? '',
      (c.prompt || '').replace(/\n/g, ' ').slice(0, 500),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-creatives-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold text-gray-900">Variations</div>
          <div className="text-sm text-gray-600">{variations.length} linked variants</div>
        </div>

        {variations.length === 0 ? (
          <div className="text-sm text-gray-600 mt-2">No variations yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {variations.map((v) => {
              const cr = creativeById.get(v.creative_id);
              const cp = copyById.get(v.copy_id);
              return (
                <div key={v.id} className="rounded-lg border bg-white p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="w-full lg:w-40">
                      {cr?.image_url ? (
                        <img src={cr.image_url} alt="creative" className="w-full aspect-square object-cover rounded-md border" />
                      ) : (
                        <div className="w-full aspect-square rounded-md border bg-gray-50" />
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
                        <Button variant="outline" onClick={() => markWinner(v.id)} disabled={Boolean(busyById[v.id])}>
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
          {creatives.length} creatives • {copies.length} copies
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCreativesCsv} disabled={creatives.length === 0}>
            Export creatives CSV
          </Button>
          <Button variant="outline" onClick={exportCopiesCsv} disabled={copies.length === 0}>
            Export copies CSV
          </Button>
        </div>
      </div>

      <Card className="p-5">
        <div className="font-semibold text-gray-900">Creatives</div>
        {creatives.length === 0 ? (
          <div className="text-sm text-gray-600 mt-2">No creatives yet. Generate some from Creative Studio.</div>
        ) : (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {creatives.map((c) => (
              <div key={c.id} className="rounded-lg border bg-white overflow-hidden">
                <img src={c.image_url} alt="creative" className="w-full aspect-square object-cover" />
                <div className="p-3 space-y-1">
                  <div className="text-xs text-gray-500">
                    {c.model || 'model'} {typeof c.cost === 'number' ? `• $${c.cost.toFixed(4)}` : ''}
                  </div>
                  <div className="text-xs text-gray-700 line-clamp-3">{c.prompt}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
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

