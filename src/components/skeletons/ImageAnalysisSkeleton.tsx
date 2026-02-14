import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImageAnalysisSkeletonProps {
  className?: string;
}

export function ImageAnalysisSkeleton({ className }: ImageAnalysisSkeletonProps) {
  return (
    <Card className={cn("glass-card overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Visual Evidence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative aspect-video rounded-lg overflow-hidden bg-muted"
            >
              <div className="absolute inset-0 shimmer-effect" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalyzingImageOverlay() {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">Analyzing structural integrity...</p>
      <p className="text-xs text-muted-foreground">AI inspection in progress</p>
    </div>
  );
}
