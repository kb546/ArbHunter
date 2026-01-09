'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Check, Palette } from 'lucide-react';
import type { BrandKit } from '@/types/creative-studio';

interface BrandSetupCardProps {
  onBrandSetup: (brand: BrandKit) => void;
  initialBrand?: BrandKit | null;
}

export function BrandSetupCard({ onBrandSetup, initialBrand }: BrandSetupCardProps) {
  const [brandName, setBrandName] = useState(initialBrand?.name || '');
  const [logo, setLogo] = useState<string | null>(
    typeof initialBrand?.logo === 'string' ? initialBrand.logo : null
  );
  const [primaryColor, setPrimaryColor] = useState(initialBrand?.colors.primary || '#4F46E5');
  const [secondaryColor, setSecondaryColor] = useState(initialBrand?.colors.secondary || '#8B5CF6');
  const [isCompleted, setIsCompleted] = useState(!!initialBrand);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
        // Auto-extract colors (simplified - just use defaults for now)
        // In production, you'd use a library like colorthief
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!brandName) {
      alert('Please enter a brand name');
      return;
    }

    const brandKit: BrandKit = {
      name: brandName,
      logo: logo || undefined,
      colors: {
        primary: primaryColor,
        secondary: secondaryColor,
      },
      savedAt: new Date().toISOString(),
    };

    onBrandSetup(brandKit);
    setIsCompleted(true);
  };

  return (
    <Card className="p-8 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold">
              1
            </span>
            Your Brand
          </h2>
          <p className="text-sm text-gray-600 mt-1 ml-10">
            Upload your logo and we'll extract brand colors automatically
          </p>
        </div>
        {isCompleted && (
          <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
            <Check className="h-5 w-5" />
            Completed
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Logo Upload */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            Brand Logo
          </Label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 transition-all aspect-square flex items-center justify-center"
          >
            {logo ? (
              <img src={logo} alt="Brand logo" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Upload Logo</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>

        {/* Brand Details */}
        <div className="space-y-5">
          <div>
            <Label htmlFor="brandName" className="text-sm font-medium text-gray-700 mb-2 block">
              Brand Name
            </Label>
            <Input
              id="brandName"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="e.g., KFC, McDonald's"
              className="h-11"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Brand Colors
            </Label>
            <div className="space-y-3">
              {/* Primary Color */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      placeholder="#4F46E5"
                      className="h-11 font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">Primary</p>
                  </div>
                </div>
              </div>

              {/* Secondary Color */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      placeholder="#8B5CF6"
                      className="h-11 font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">Secondary</p>
                  </div>
                </div>
              </div>
            </div>

            {logo && (
              <Button
                variant="outline"
                size="sm"
                className="mt-3 w-full"
                onClick={() => {
                  // In production, use a color extraction library
                  alert('Color auto-detection coming soon!');
                }}
              >
                <Palette className="h-4 w-4 mr-2" />
                Auto-detect from logo
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!brandName}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 h-11"
        >
          {isCompleted ? 'Update Brand Kit' : 'Save Brand Kit'}
        </Button>
      </div>
    </Card>
  );
}


