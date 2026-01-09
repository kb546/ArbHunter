'use client';

/**
 * SORA-INSPIRED PRESET SELECTOR
 * 
 * Beautiful visual preset selector inspired by OpenAI's SORA interface
 * Allows users to choose creative style for their ad generation
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import type { PresetName } from '@/services/presets/presets.config';
import { getAllPresets } from '@/services/presets/presets.config';

interface PresetSelectorProps {
  selected: PresetName;
  onChange: (preset: PresetName) => void;
}

export function PresetSelector({ selected, onChange }: PresetSelectorProps) {
  const presets = getAllPresets();

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-semibold">Creative Style Preset</Label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Choose a preset or go with "None" for full creative control
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map((preset) => {
          const isSelected = selected === preset.id;
          
          return (
            <Card
              key={preset.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected
                  ? 'ring-2 ring-purple-500 border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'hover:border-gray-400 dark:hover:border-gray-600'
              }`}
              onClick={() => onChange(preset.id)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{preset.icon}</span>
                    <div>
                      <h3 className="font-bold text-base">{preset.name}</h3>
                      {preset.id === 'none' && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          Recommended for pros
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {preset.description}
                </p>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                    Best For:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {preset.bestFor.slice(0, 3).map((use, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="text-xs px-2 py-0.5"
                      >
                        {use}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected preset details */}
      {selected && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-2xl">
                {presets.find(p => p.id === selected)?.icon}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-purple-900 dark:text-purple-100">
                  Selected: {presets.find(p => p.id === selected)?.name}
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  {presets.find(p => p.id === selected)?.description}
                </p>
              </div>
              <Badge className="bg-purple-500 text-white">Active</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


