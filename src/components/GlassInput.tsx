import { useState } from 'react';
import { Link2, ScanLine, ImagePlus, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface GlassInputProps {
  onAnalyze: (url: string, imageUrls?: string[]) => void;
  isLoading?: boolean;
}

export function GlassInput({ onAnalyze, isLoading }: GlassInputProps) {
  const [url, setUrl] = useState('');
  const [showManualImages, setShowManualImages] = useState(false);
  const [manualImageUrls, setManualImageUrls] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
      {/* Glassmorphism Container */}
      <div 
        className={cn(
          "bg-background/40 backdrop-blur-md border rounded-xl p-2 transition-all duration-300",
          isFocused 
            ? "border-primary/50 ring-2 ring-primary/20 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.3)]" 
            : "border-foreground/10 hover:border-foreground/20"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="url"
              placeholder="Paste vehicle URL (IAAI, Copart, or any auction site)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className={cn(
                "h-12 pl-12 pr-4 text-base bg-transparent border-0",
                "focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground/60"
              )}
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={!isValidUrl || isLoading}
            className={cn(
              "h-12 px-6 font-semibold",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "shadow-lg hover:shadow-xl hover:shadow-primary/20",
              "transition-all duration-300",
              "disabled:opacity-50 disabled:shadow-none"
            )}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {isLoading ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </div>

      {/* Manual Images Toggle */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setShowManualImages(!showManualImages)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-foreground/5"
        >
          {showManualImages ? (
            <X className="h-4 w-4" />
          ) : (
            <ImagePlus className="h-4 w-4" />
          )}
          {showManualImages ? 'Hide manual images' : 'Add images manually'}
        </button>
      </div>

      {/* Manual Images Input */}
      {showManualImages && (
        <div className="animate-fade-in bg-background/40 backdrop-blur-md border border-foreground/10 rounded-xl p-4">
          <Textarea
            placeholder="Paste image URLs (one per line)..."
            value={manualImageUrls}
            onChange={(e) => setManualImageUrls(e.target.value)}
            className="min-h-[100px] bg-transparent border-foreground/10 text-sm focus:ring-primary/20"
            disabled={isLoading}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            Use this if automatic image extraction fails.
          </p>
        </div>
      )}
    </form>
  );
}
