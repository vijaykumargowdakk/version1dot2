import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function ResultsTableSkeleton() {
  return (
    <Card className="glass-card">
      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-4"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              {/* Part code */}
              <Skeleton className="h-4 w-14 flex-shrink-0" />
              
              {/* Part name */}
              <Skeleton className="h-4 flex-1 max-w-48" />
              
              {/* Status badge */}
              <Skeleton className="h-6 w-20 rounded-full" />
              
              {/* Confidence */}
              <Skeleton className="h-4 w-10" />
              
              {/* Chevron */}
              <Skeleton className="h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
