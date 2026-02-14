import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, Car, AlertCircle, CheckCircle2, XCircle, LogIn } from 'lucide-react';
import { ExportHistoryButton } from '@/components/ExportHistoryButton';
import { getInspectionHistory } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { Inspection } from '@/types/inspection';
import { cn } from '@/lib/utils';

function HistoryCard({ inspection, onClick }: { inspection: Inspection; onClick: () => void }) {
  const healthPercent = inspection.health_score ? Math.round((inspection.health_score / 27) * 100) : 0;
  const damagedCount = inspection.inspection_data.filter(p => p.status === 'DAMAGED').length;

  return (
    <Card 
      className="glass-card cursor-pointer hover:border-primary/30 transition-all duration-300 group overflow-hidden"
      onClick={onClick}
    >
      <div className="aspect-video relative overflow-hidden bg-muted">
        {inspection.thumbnail_url ? (
          <img 
            src={inspection.thumbnail_url} 
            alt={inspection.vehicle_name || 'Vehicle'} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            healthPercent >= 70 ? "bg-success text-success-foreground" :
            healthPercent >= 40 ? "bg-warning text-warning-foreground" :
            "bg-destructive text-destructive-foreground"
          )}>
            {inspection.health_score}/27
          </span>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-foreground truncate mb-1">
          {inspection.vehicle_name || 'Unknown Vehicle'}
        </h3>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-success" />
            {inspection.health_score} good
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-destructive" />
            {damagedCount} damaged
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(inspection.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </CardContent>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="glass-card overflow-hidden">
          <Skeleton className="aspect-video" />
          <CardContent className="p-4 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function History() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      // Wait for auth to be determined
      if (authLoading) return;
      
      try {
        const data = await getInspectionHistory(user?.id);
        setInspections(data);
      } catch (err) {
        console.error('Failed to fetch history:', err);
        setError('Failed to load inspection history');
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [user?.id, authLoading]);

  const handleCardClick = (inspection: Inspection) => {
    navigate('/results', {
      state: {
        vehicleUrl: inspection.vehicle_url,
        vehicleName: inspection.vehicle_name,
        imageUrls: inspection.image_urls,
        parts: inspection.inspection_data,
        inspectionId: inspection.id,
      },
    });
  };

  return (
    <MainLayout>
      <div className="container py-12 relative z-50">
        {/* Guest Banner */}
        {!isAuthenticated && !authLoading && (
          <Alert className="mb-6 bg-primary/10 border-primary/20 backdrop-blur-sm">
            <LogIn className="h-4 w-4 text-primary" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-foreground">
                Viewing public demo scans. <span className="text-muted-foreground">Login to save your own vehicle reports.</span>
              </span>
              <Link 
                to="/login" 
                className="ml-4 px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Login
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Glassmorphism Container */}
        <div className="bg-background/60 backdrop-blur-md border border-border/30 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Inspection History</h1>
              <p className="text-muted-foreground mt-1">
                {isAuthenticated 
                  ? 'Your vehicle inspections and public demo scans'
                  : 'Public demo scans - login to save your own reports'
                }
              </p>
            </div>
            {!loading && inspections.length > 0 && (
              <div className="flex items-center gap-3">
                <ExportHistoryButton inspections={inspections} />
                <span className="text-sm text-muted-foreground">
                  {inspections.length} inspection{inspections.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
          
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <Card className="glass-card">
              <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-foreground">Failed to load</h2>
                <p className="text-muted-foreground max-w-md">{error}</p>
              </CardContent>
            </Card>
          ) : inspections.length === 0 ? (
            <Card className="glass-card">
              <CardContent className="py-16 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-foreground">No scans yet</h2>
                <p className="text-muted-foreground max-w-md">
                  Your vehicle inspection history will appear here. Start by analyzing your first vehicle!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inspections.map((inspection) => (
                <HistoryCard 
                  key={inspection.id} 
                  inspection={inspection} 
                  onClick={() => handleCardClick(inspection)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
