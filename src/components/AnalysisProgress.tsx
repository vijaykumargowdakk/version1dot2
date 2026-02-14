import { useEffect, useState } from 'react';
import { ImageIcon, Brain, FileText, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const steps = [
  { id: 'extract', label: 'Extracting Images', icon: ImageIcon },
  { id: 'analyze', label: 'Analyzing with AI', icon: Brain },
  { id: 'report', label: 'Generating Report', icon: FileText },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

interface AnalysisProgressProps {
  currentStep: number;
}

export function AnalysisProgress({ currentStep }: AnalysisProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const targetProgress = ((currentStep + 1) / steps.length) * 100;
    const timer = setTimeout(() => setProgress(targetProgress), 100);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div className="w-full max-w-2xl mx-auto glass-card rounded-2xl p-8">
      <div className="relative mb-8">
        <Progress value={progress} className="h-2 bg-muted" />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStep;
          const isComplete = index < currentStep;

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-300",
                isActive && "bg-primary/10 scale-105",
                isComplete && "opacity-60"
              )}
            >
              <div
                className={cn(
                  "relative w-12 h-12 rounded-full flex items-center justify-center transition-all",
                  isActive && "bg-primary text-primary-foreground",
                  isComplete && "bg-success/20 text-success",
                  !isActive && !isComplete && "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                {isActive && (
                  <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center",
                  isActive && "text-primary",
                  !isActive && "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
