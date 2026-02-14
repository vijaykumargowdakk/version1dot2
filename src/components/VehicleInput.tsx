import { useState } from 'react';
import { Link2, ScanLine, ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface VehicleInputProps {
  onAnalyze: (url: string, imageUrls?: string[]) => void;
  isLoading?: boolean;
}

export function VehicleInput({ onAnalyze, isLoading }: VehicleInputProps) {
  const [url, setUrl] = useState('');
  const [showManualImages, setShowManualImages] = useState(false);
  const [manualImageUrls, setManualImageUrls] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    const imageUrls = manualImageUrls
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.length > 0);
    
    onAnalyze(url, imageUrls.length > 0 ? imageUrls : undefined);
  };

  const isValidUrl = url.includes('iaai.com') || url.includes('copart.com') || url.includes('http');

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-4">
      <div className="glass-card rounded-2xl p-6 border-primary/20">
        <div className="relative">
          <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="url"
            placeholder="Paste vehicle URL (IAAI, Copart, or any auction site)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className={cn(
              "h-14 pl-12 pr-4 text-base bg-muted/50 border-border",
              "focus:ring-2 focus:ring-primary/30 focus:border-primary",
              "placeholder:text-muted-foreground/60"
            )}
            disabled={isLoading}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowManualImages(!showManualImages)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showManualImages ? (
              <X className="h-4 w-4" />
            ) : (
              <ImagePlus className="h-4 w-4" />
            )}
            {showManualImages ? 'Hide manual images' : 'Add images manually'}
          </button>
        </div>

        {showManualImages && (
          <div className="mt-4 animate-fade-in">
            <Textarea
              placeholder="Paste image URLs (one per line)..."
              value={manualImageUrls}
              onChange={(e) => setManualImageUrls(e.target.value)}
              className="min-h-[120px] bg-muted/50 border-border text-sm"
              disabled={isLoading}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Use this if automatic image extraction fails. Paste direct image URLs from the vehicle listing.
            </p>
          </div>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={!isValidUrl || isLoading}
        className={cn(
          "w-full h-14 text-base font-semibold",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-300",
          "disabled:opacity-50 disabled:shadow-none"
        )}
      >
        <ScanLine className="mr-2 h-5 w-5" />
        {isLoading ? 'Analyzing...' : 'Analyze Vehicle'}
      </Button>
    </form>
  );
}
