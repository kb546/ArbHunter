'use client';

import { useState } from 'react';
import { Discovery } from '@/types';
import { ScoreIndicator } from '@/components/ScoreIndicator';
import { DiscoveryDetailModal } from '@/components/DiscoveryDetailModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface ResultsTableProps {
  discoveries: Discovery[];
  onExport?: () => void;
  onClear?: () => void;
}

export function ResultsTable({ discoveries, onExport, onClear }: ResultsTableProps) {
  const [sortField, setSortField] = useState<'margin_score' | 'created_at'>('margin_score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedDiscovery, setSelectedDiscovery] = useState<Discovery | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const sortedDiscoveries = [...discoveries].sort((a, b) => {
    const aValue = sortField === 'margin_score' ? a.margin_score : new Date(a.created_at).getTime();
    const bValue = sortField === 'margin_score' ? b.margin_score : new Date(b.created_at).getTime();

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  const toggleSort = (field: 'margin_score' | 'created_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCompetitionLevel = (data?: any) => {
    if (!data?.competition_level) return 'Unknown';
    const level = data.competition_level;
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const handleRowClick = (discovery: Discovery) => {
    setSelectedDiscovery(discovery);
    setDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setDetailModalOpen(false);
    setTimeout(() => setSelectedDiscovery(null), 200);
  };

  if (discoveries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Discovery Results</CardTitle>
          <CardDescription>Your discovery runs will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">
              No discoveries yet. Run your first opportunity scan above!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Discovery Results</CardTitle>
            <CardDescription>
              {discoveries.length} {discoveries.length === 1 ? 'opportunity' : 'opportunities'} found
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {onClear && discoveries.length > 0 && (
              <Button variant="destructive" size="sm" onClick={onClear}>
                Clear All
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile: card list (prevents overlap) */}
        <div className="md:hidden space-y-3">
          {sortedDiscoveries.map((discovery) => (
            <button
              key={discovery.id}
              type="button"
              onClick={() => handleRowClick(discovery)}
              className="w-full text-left rounded-lg border bg-white p-4 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{discovery.niche}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {discovery.geo} • {formatDate(discovery.created_at)}
                  </div>
                </div>
                <div className="shrink-0">
                  <ScoreIndicator score={discovery.margin_score} size="sm" />
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-muted-foreground">Search vol</div>
                  <div className="font-medium text-gray-900">
                    {discovery.trend_velocity?.search_volume?.toLocaleString?.() || '—'}
                  </div>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <div className="text-muted-foreground">Growth</div>
                  <div className="font-medium text-gray-900">
                    {typeof discovery.trend_velocity?.growth_rate === 'number'
                      ? `${discovery.trend_velocity.growth_rate > 0 ? '+' : ''}${discovery.trend_velocity.growth_rate.toFixed(1)}%`
                      : '—'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Desktop: scrollable table */}
        <div className="hidden md:block rounded-md border overflow-x-auto">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button
                    onClick={() => toggleSort('margin_score')}
                    className="flex items-center gap-1 font-semibold hover:text-primary"
                  >
                    Margin Score
                    {sortField === 'margin_score' && (sortDirection === 'desc' ? ' ↓' : ' ↑')}
                  </button>
                </TableHead>
                <TableHead>GEO</TableHead>
                <TableHead>Niche</TableHead>
                <TableHead>Trend Velocity</TableHead>
                <TableHead>Related Keywords</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>
                  <button
                    onClick={() => toggleSort('created_at')}
                    className="flex items-center gap-1 font-semibold hover:text-primary"
                  >
                    Discovered
                    {sortField === 'created_at' && (sortDirection === 'desc' ? ' ↓' : ' ↑')}
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedDiscoveries.map((discovery) => (
                <TableRow
                  key={discovery.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(discovery)}
                >
                  <TableCell>
                    <ScoreIndicator score={discovery.margin_score} size="sm" />
                  </TableCell>
                  <TableCell className="font-medium">{discovery.geo}</TableCell>
                  <TableCell>{discovery.niche}</TableCell>
                  <TableCell>
                    {discovery.trend_velocity ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {discovery.trend_velocity.search_volume.toLocaleString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {discovery.trend_velocity.growth_rate > 0 ? '+' : ''}
                          {discovery.trend_velocity.growth_rate.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {discovery.trend_velocity?.related_keywords &&
                    discovery.trend_velocity.related_keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {discovery.trend_velocity.related_keywords.slice(0, 2).map((keyword, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {discovery.trend_velocity.related_keywords.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{discovery.trend_velocity.related_keywords.length - 2}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getCompetitionLevel(discovery.competition_data)}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(discovery.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Detail Modal */}
      <DiscoveryDetailModal
        discovery={selectedDiscovery}
        open={detailModalOpen}
        onClose={handleCloseModal}
      />
    </Card>
  );
}
