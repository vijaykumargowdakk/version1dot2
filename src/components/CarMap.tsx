
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { InspectionPart, PartCode, PartSeverity } from '@/types/inspection';

const PART_COORDINATES: Record<string, { top: number; left: number; label: string; name: string }> = {
  "FBR":   { top: 3,  left: 40, label: "FBR",   name: "Front Bumper" },
  "BBF":   { top: 3,  left: 60, label: "BBF",   name: "Bumper Bar Front" },
  "GRL":   { top: 9, left: 50, label: "GRL",   name: "Grill" },
  "HLP-L": { top: 8, left: 26, label: "HLP-L", name: "Head Lamp Left" },
  "HLP-R": { top: 8, left: 74, label: "HLP-R", name: "Head Lamp Right" },
  "HOD":   { top: 18, left: 50, label: "HOD",   name: "Hood" },
  "ENG":   { top: 29, left: 50, label: "ENG",   name: "Engine" },
  "FEN-L": { top: 20, left: 23, label: "FEN-L", name: "Fender Left" },
  "FEN-R": { top: 20, left: 77, label: "FEN-R", name: "Fender Right" },
  "FAX":   { top: 34, left: 40, label: "FAX",   name: "Front Axle Assembly" },
  "TRA":   { top: 34, left: 60, label: "TRA",   name: "Transmission" },
  "UCM":   { top: 39, left: 50, label: "UCM",   name: "UnderCarriage X-Member" },
  "BAG":   { top: 44, left: 50, label: "BAG",   name: "AirBag" },
  "DMR-L": { top: 32, left: 21,  label: "DMR-L", name: "Door Mirror Left" },
  "DMR-R": { top: 32, left: 79, label: "DMR-R", name: "Door Mirror Right" },
  "FDR-L": { top: 42, left: 21, label: "FDR-L", name: "Front Door Left" },
  "FDR-R": { top: 42, left: 79, label: "FDR-R", name: "Front Door Right" },
  "RDR-L": { top: 58, left: 21, label: "RDR-L", name: "Rear Door Left" },
  "RDR-R": { top: 58, left: 79, label: "RDR-R", name: "Rear Door Right" },
  "QTR-L": { top: 77, left: 21, label: "QTR-L", name: "Quarter Panel Left" },
  "QTR-R": { top: 77, left: 79, label: "QTR-R", name: "Quarter Panel Right" },
  "RAX":   { top: 68, left: 50, label: "RAX",   name: "Rear Axle Assembly" },
  "LID":   { top: 82, left: 50, label: "LID",   name: "Trunk Lid / Tail Gate" },
  "TLP-L": { top: 88, left: 23, label: "TLP-L", name: "Tail Lamp Left" },
  "TLP-R": { top: 88, left: 76, label: "TLP-R", name: "Tail Lamp Right" },
  "BBR":   { top: 93, left: 42, label: "BBR",   name: "Bumper Bar Rear" },
  "RBR":   { top: 93, left: 58, label: "RBR",   name: "Rear Bumper" },
};

// Updated to include text colors for better contrast
const getHotspotColor = (status: string) => {
  switch (status) {
    case 'DAMAGED': return 'bg-destructive border-destructive shadow-destructive/40 text-white';
    case 'GOOD': return 'bg-success border-success shadow-success/40 text-white';
    default: return 'bg-muted-foreground/80 border-muted-foreground text-white';
  }
};

const getSeverityLabel = (severity?: PartSeverity) => {
  if (!severity || severity === 'NONE') return null;
  return severity.charAt(0) + severity.slice(1).toLowerCase();
};

interface CarMapProps {
  parts: InspectionPart[];
  onPartClick: (code: string) => void;
  className?: string; // ADDED optional className
}

export function CarMap({ parts, onPartClick, className }: CarMapProps) {
  const partMap = new Map(parts.map(p => [p.code, p]));

  return (
    // UPDATED: Use inline-block to shrink-wrap the image for correct percentage positioning
    // Passing "h-full" in className will make this container fill the parent height
    <div className={cn("relative inline-block", className)}>
      <img
        src="/car-overlay.png"
        alt="Top-down car diagram"
        // UPDATED: h-full w-auto ensures it scales by height but maintains aspect ratio
        className="block h-full w-auto max-w-none rounded-xl border border-border"
      />
      {Object.entries(PART_COORDINATES).map(([code, coord]) => {
        const part = partMap.get(code as PartCode);
        const status = part?.status || 'NOT_VISIBLE';
        const severity = part?.severity;

        return (
          <Tooltip key={code}>
            <TooltipTrigger asChild>
              <button
                onClick={() => onPartClick(code)}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 transition-all",
                  "hover:scale-110 hover:z-20 shadow-md cursor-pointer",
                  "flex items-center justify-center px-1.5 py-0.5 rounded-full border text-[15px] font-bold leading-none whitespace-nowrap",
                  getHotspotColor(status)
                )}
                style={{ top: `${coord.top}%`, left: `${coord.left}%` }}
                aria-label={`${coord.name} - ${status}`}
              >
                {coord.label}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="z-50">
              <p className="font-medium">{coord.name}</p>
              <p className="text-xs text-muted-foreground">
                {status}{severity && severity !== 'NONE' ? ` • ${getSeverityLabel(severity)}` : ''}
              </p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}