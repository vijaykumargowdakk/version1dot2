import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { GlassInput } from '@/components/GlassInput';
import { StatusFooter } from '@/components/StatusFooter';
import { AnalysisProgress } from '@/components/AnalysisProgress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { analyzeVehicle } from '@/lib/api';


export default function Index() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, loading } = useAuth();

  const handleAnalyze = async (url: string, imageUrls?: string[]) => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please sign in to analyze vehicles.',
      });
      navigate('/login');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep(0);

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setAnalysisStep(1);
      
      console.log('Starting AI analysis...');
      const result = await analyzeVehicle(url, imageUrls);
      
      setAnalysisStep(2);
      await new Promise(resolve => setTimeout(resolve, 400));
      setAnalysisStep(3);
      
      setTimeout(() => {
        navigate('/results', {
          state: {
            vehicleUrl: url,
            vehicleName: result.vehicleName,
            vehicleSummary: result.vehicleSummary,
            imageUrls: result.imageUrls,
            parts: result.analysis,
            inspectionId: result.inspectionId,
          },
        });
      }, 500);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'Could not analyze the vehicle. Please try again.',
        variant: 'destructive',
      });
      setIsAnalyzing(false);
    }
  };

  return (
    <MainLayout>
      {/* Hero Section - pointer-events-none on container, auto on interactive elements */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-4 relative z-50 pointer-events-none">
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center animate-fade-in pointer-events-auto">
            <AnalysisProgress currentStep={analysisStep} />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto animate-fade-in">
            {/* Title with Gradient */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              <span className="text-foreground">
                Vehicle Inspection
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mt-4 mb-8">
              Analyze salvage vehicles with our Custom Built Vision AI. Get detailed damage assessments 
              across 27 critical components in seconds.
            </p>

            {/* Glassmorphism Input - pointer-events-auto to make it clickable */}
            <div className="w-full max-w-2xl pointer-events-auto">
              <GlassInput onAnalyze={handleAnalyze} isLoading={isAnalyzing || loading} />
            </div>
          </div>
        )}
      </div>

      {/* Status Footer - pointer-events-auto */}
      {!isAnalyzing && (
        <div className="pointer-events-auto">
          <StatusFooter />
        </div>
      )}
    </MainLayout>
  );
}
