'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
}) {
  const { creatives, copies } = props;

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

