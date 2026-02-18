import { useState, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Download, ArrowLeft, ExternalLink, AlertTriangle, Eye, Search, Maximize2, XCircle, HelpCircle, Activity, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { PartFeedback } from '@/components/PartFeedback';
import { CarMap } from '@/components/CarMap';
import type { InspectionPart, PartSeverity } from '@/types/inspection';

// --- STYLES FOR ELEGANT SCROLLBARS ---
const scrollbarStyles = `
  .custom-scroll-area::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scroll-area::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scroll-area::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 20px;
    transition: background-color 0.2s;
  }
  .custom-scroll-area:hover::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.5);
  }
`;

type FilterTab = 'all' | 'damaged' | 'good' | 'unknown';

interface LocationState {
  vehicleUrl?: string;
  vehicleName?: string;
  vehicleSummary?: string;
  imageUrls?: string[];
  parts?: InspectionPart[];
  inspectionId?: string;
}

const getSeverityColor = (severity?: PartSeverity) => {
  switch (severity) {
    case 'SEVERE': return 'bg-destructive/15 text-destructive border-destructive/20';
    case 'MODERATE': return 'bg-orange-500/15 text-orange-600 border-orange-500/20';
    case 'MINOR': return 'bg-yellow-500/15 text-yellow-600 border-yellow-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getSeverityLabel = (severity?: PartSeverity) => {
  if (!severity) return null;
  return severity.charAt(0) + severity.slice(1).toLowerCase();
};

const getConfidenceColor = (confidence?: number) => {
  if (confidence === undefined) return 'text-muted-foreground';
  if (confidence >= 0.8) return 'text-success border-success/30 bg-success/10';
  if (confidence >= 0.5) return 'text-yellow-600 border-yellow-500/30 bg-yellow-500/10';
  return 'text-destructive border-destructive/30 bg-destructive/10';
};

export default function VisualResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { vehicleUrl, vehicleName, vehicleSummary, imageUrls, parts = [], inspectionId } = (location.state as LocationState) || {};

  // Stats Logic
  const score = useMemo(() => ({
    good: parts.filter(p => p.status === 'GOOD').length,
    damaged: parts.filter(p => p.status === 'DAMAGED').length,
    notVisible: parts.filter(p => p.status === 'NOT_VISIBLE').length,
  }), [parts]);

  const severityStats = useMemo(() => ({
    severe: parts.filter(p => p.severity === 'SEVERE').length,
    moderate: parts.filter(p => p.severity === 'MODERATE').length,
    minor: parts.filter(p => p.severity === 'MINOR').length,
  }), [parts]);

  const avgConfidence = useMemo(() => {
    const partsWithConfidence = parts.filter(p => p.confidence !== undefined);
    if (partsWithConfidence.length === 0) return null;
    return partsWithConfidence.reduce((sum, p) => sum + (p.confidence || 0), 0) / partsWithConfidence.length;
  }, [parts]);

  const filteredParts = useMemo(() => {
    let result = parts;
    switch (activeFilter) {
      case 'damaged': result = result.filter(p => p.status === 'DAMAGED'); break;
      case 'good': result = result.filter(p => p.status === 'GOOD'); break;
      case 'unknown': result = result.filter(p => p.status === 'NOT_VISIBLE'); break;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
    }
    return result;
  }, [parts, activeFilter, searchQuery]);

  const exportToExcel = () => {
    const headers = ['Part Code', 'Part Name', 'Status', 'Severity', 'Visual Evidence', 'Confidence'];
    const rows = parts.map(p => [
      p.code, p.name, p.status, p.severity || '',
      p.visual_evidence || p.notes || '',
      p.confidence !== undefined ? `${Math.round(p.confidence * 100)}%` : ''
    ]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inspection Report');
    XLSX.writeFile(wb, `vehicle-inspection-${Date.now()}.xlsx`);
  };

  const handleMapPartClick = useCallback((code: string) => {
    setActiveFilter('all');
    setSearchQuery('');
    setOpenAccordionItems(prev => prev.includes(code) ? prev : [...prev, code]);
    setTimeout(() => {
      accordionRefs.current[code]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }, []);

  if (!vehicleUrl || parts.length === 0) return <Navigate to="/" replace />;

  return (
    <MainLayout>
      <style>{scrollbarStyles}</style>
      <TooltipProvider>
        {/* Full Viewport Container */}
        <div className="container h-[calc(100vh-4rem)] py-4 flex flex-col gap-4 max-w-[1920px]">
          
          {/* --- HEADER --- */}
          <div className="flex items-center justify-between flex-shrink-0 bg-background/80 backdrop-blur-md p-2 rounded-xl border border-border/40 shadow-sm z-10">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/history')} className="hover:bg-muted">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight flex items-center gap-2">
                  {vehicleName || 'Inspection Report'}
                  <a href={vehicleUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </h1>
                <p className="text-xs text-muted-foreground">AI Visual Assessment</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
                <Button onClick={exportToExcel} variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> <span className="hidden sm:inline">Export</span>
                </Button>
            </div>
          </div>

          {/* --- MAIN LAYOUT GRID --- */}
          {/* UPDATED GRID: Images (3) | Map (3) | Score+List (6) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
            
            {/* COLUMN 1: VISUAL EVIDENCE (Images) - 3/12 Width */}
            <div className="lg:col-span-4 flex flex-col h-full min-h-0 bg-card/40 rounded-xl border border-border/50 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border/40 bg-muted/20 backdrop-blur-sm flex justify-between items-center shrink-0">
                    <h2 className="font-semibold text-sm flex items-center gap-2">
                        Visual Evidence
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{imageUrls?.length || 0}</Badge>
                    </h2>
                </div>
                {/* Scrollable Area */}
                <div className="flex-1 overflow-y-auto custom-scroll-area p-2">
                    <div className="grid grid-cols-2 gap-2">
                    {(imageUrls || []).map((url, idx) => (
                        <button
                        key={idx}
                        onClick={() => { setSelectedImage(url); setZoomScale(1); }}
                        className={cn(
                            "group relative w-full rounded-md overflow-hidden bg-muted aspect-video border border-transparent hover:border-primary/50 transition-all duration-300",
                            // Make the first image span full width for emphasis
                            idx === 0 && "col-span-2 aspect-[2/1]" 
                        )}
                        >
                        <div className="absolute top-2 left-2 z-20 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/20 shadow-sm">
                            #{idx + 1}
                        </div>
                        <img 
                            src={url} 
                            alt={`Evidence ${idx + 1}`} 
                            referrerPolicy="no-referrer" 
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Maximize2 className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 drop-shadow-md" />
                        </div>
                        </button>
                    ))}
                    </div>
                </div>
            </div>

            {/* COLUMN 2: INTERACTIVE MAP - REDUCED TO 3/12 Width (TIGHT FIT) */}
            {/* Removed header and legend to maximize space for image */}
            <div className="lg:col-span-3 flex flex-col h-full min-h-0 bg-card/60 rounded-xl border border-border/50 shadow-sm overflow-hidden relative">
               
               {/* Map Container - Full Height/Width with Padding-0 */}
               <div className="flex-1 flex items-center justify-center p-0 bg-gradient-to-b from-transparent to-muted/5 relative overflow-hidden">
                  {/* Background Grid Pattern (Subtle) */}
                  <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  
                  {/* CarMap Wrapper */}
                  <div className="h-full w-full flex items-center justify-center relative">
                     <CarMap parts={parts} onPartClick={handleMapPartClick} className="h-full w-auto" />
                  </div>
               </div>
            </div>

            {/* COLUMN 3: STATS & LIST - INCREASED TO 6/12 Width (REPURPOSED SPACE) */}
            <div className="lg:col-span-5 flex flex-col h-full gap-4 min-h-0">
                
                {/* 3a. HEALTH SCORE CARD */}
                <Card className="glass-card border-primary/20 flex-shrink-0 shadow-sm">
                    <CardContent className="py-3 px-4">
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <div className="flex items-baseline gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Health Score</span>
                                <span className="text-2xl font-bold">
                                    <span className="text-success">{score.good}</span>
                                    <span className="text-muted-foreground text-lg">/27</span>
                                </span>
                            </div>
                            {avgConfidence !== null && (
                                <div className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1", getConfidenceColor(avgConfidence))}>
                                    <Eye className="h-3 w-3" /> {Math.round(avgConfidence * 100)}% Conf.
                                </div>
                            )}
                        </div>

                        {/* Status Grid - Clickable Filters */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                             <button
                               onClick={() => setActiveFilter(activeFilter === 'good' ? 'all' : 'good')}
                               className={cn(
                                 "p-2 rounded border text-center cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95",
                                 activeFilter === 'good'
                                   ? "bg-success/20 border-success/50 ring-1 ring-success/40 shadow-sm"
                                   : "bg-success/10 border-success/20 hover:bg-success/20 hover:border-success/40"
                               )}
                             >
                                <p className="text-lg font-bold text-success leading-none">{score.good}</p>
                                <p className="text-[9px] text-muted-foreground uppercase font-semibold mt-1">Good</p>
                             </button>
                             <button
                               onClick={() => setActiveFilter(activeFilter === 'damaged' ? 'all' : 'damaged')}
                               className={cn(
                                 "p-2 rounded border text-center cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95",
                                 activeFilter === 'damaged'
                                   ? "bg-destructive/20 border-destructive/50 ring-1 ring-destructive/40 shadow-sm"
                                   : "bg-destructive/10 border-destructive/20 hover:bg-destructive/20 hover:border-destructive/40"
                               )}
                             >
                                <p className="text-lg font-bold text-destructive leading-none">{score.damaged}</p>
                                <p className="text-[9px] text-muted-foreground uppercase font-semibold mt-1">Damaged</p>
                             </button>
                             <button
                               onClick={() => setActiveFilter(activeFilter === 'unknown' ? 'all' : 'unknown')}
                               className={cn(
                                 "p-2 rounded border text-center cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95",
                                 activeFilter === 'unknown'
                                   ? "bg-muted border-foreground/30 ring-1 ring-foreground/20 shadow-sm"
                                   : "bg-muted border-border hover:bg-muted/80 hover:border-foreground/20"
                               )}
                             >
                                <p className="text-lg font-bold text-muted-foreground leading-none">{score.notVisible}</p>
                                <p className="text-[9px] text-muted-foreground uppercase font-semibold mt-1">Unknown</p>
                             </button>
                        </div>

                        {/* Severity Badges */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                             {/* Severe */}
                             {(severityStats.severe > 0 || true) && (
                                 <Badge variant={severityStats.severe > 0 ? "destructive" : "outline"} className={cn("text-[10px] h-5 px-1.5 gap-1", severityStats.severe === 0 && "text-muted-foreground border-dashed bg-transparent opacity-60")}>
                                    <AlertTriangle className="h-3 w-3" /> {severityStats.severe} Severe
                                 </Badge>
                             )}

                             {/* Moderate */}
                             <Badge className={cn("text-[10px] h-5 px-1.5 gap-1", severityStats.moderate > 0 ? "bg-orange-500 hover:bg-orange-600 text-white" : "bg-transparent border border-dashed text-muted-foreground shadow-none opacity-60 pointer-events-none")}>
                                <Activity className="h-3 w-3" /> {severityStats.moderate} Moderate
                             </Badge>

                             {/* Minor */}
                             <Badge className={cn("text-[10px] h-5 px-1.5 gap-1", severityStats.minor > 0 ? "bg-yellow-500 hover:bg-yellow-600 text-white" : "bg-transparent border border-dashed text-muted-foreground shadow-none opacity-60 pointer-events-none")}>
                                <Info className="h-3 w-3" /> {severityStats.minor} Minor
                             </Badge>

                             {/* Unknown */}
                             <Badge variant="outline" className={cn("text-[10px] h-5 px-1.5 gap-1 text-muted-foreground", score.notVisible === 0 && "opacity-60 border-dashed")}>
                                <HelpCircle className="h-3 w-3" /> {score.notVisible} Unknown
                             </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* 3b. PARTS LIST */}
                <div className="flex-1 flex flex-col min-h-0 bg-card/40 rounded-xl border border-border/50 shadow-sm overflow-hidden">
                    <div className="px-3 py-2 border-b border-border/40 bg-muted/20 backdrop-blur-sm shrink-0 space-y-2">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                <Input
                                    placeholder="Search parts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 h-8 text-xs bg-background/50 border-border/50 focus-visible:ring-1"
                                />
                            </div>
                            <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterTab)} className="w-auto">
                                <TabsList className="h-8 p-0.5 bg-background/50 border border-border/50">
                                    <TabsTrigger value="all" className="text-[10px] px-2.5 h-7">All</TabsTrigger>
                                    <TabsTrigger value="damaged" className="text-[10px] px-2.5 h-7">Issues</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scroll-area bg-background/20">
                        <Accordion
                            type="multiple"
                            className="w-full"
                            value={openAccordionItems}
                            onValueChange={setOpenAccordionItems}
                        >
                            {filteredParts.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground text-sm">
                                    <p>No parts found matching filters.</p>
                                </div>
                            ) : (
                                filteredParts.map((part) => (
                                    <AccordionItem
                                        key={part.code}
                                        value={part.code}
                                        ref={(el) => { accordionRefs.current[part.code] = el as HTMLDivElement | null; }}
                                        className={cn(
                                            "border-b border-border/40 transition-colors",
                                            part.status === 'DAMAGED' ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-muted/30"
                                        )}
                                    >
                                        <AccordionTrigger className="px-3 py-2.5 hover:no-underline group">
                                            <div className="flex items-center gap-3 flex-1 min-w-0 text-left">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full shrink-0 shadow-sm",
                                                    part.status === 'GOOD' ? "bg-success" : 
                                                    part.status === 'DAMAGED' ? "bg-destructive animate-pulse" : "bg-muted-foreground/30"
                                                )} />
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <span className={cn("text-xs font-medium truncate", part.status === 'DAMAGED' && "text-destructive font-semibold")}>
                                                            {part.name}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-mono opacity-50 ml-2">
                                                            {part.code}
                                                        </span>
                                                    </div>
                                                    {(part.severity && part.severity !== 'NONE') || (part.confidence) ? (
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            {part.severity && part.severity !== 'NONE' && (
                                                                <Badge variant="outline" className={cn("text-[9px] px-1 py-0 h-4 border", getSeverityColor(part.severity))}>
                                                                    {getSeverityLabel(part.severity)}
                                                                </Badge>
                                                            )}
                                                            {part.confidence && (
                                                                <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                                                    <Eye className="w-2.5 h-2.5" /> {Math.round(part.confidence * 100)}%
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-3 pb-3 pt-0 bg-transparent">
                                            <div className="pl-5 pt-2 border-l border-border/30 ml-1 space-y-2">
                                                {(part.visual_evidence || part.notes) ? (
                                                    <div className="bg-muted/30 p-2 rounded-md border border-border/30">
                                                        <p className="text-[10px] font-bold text-muted-foreground mb-0.5 uppercase tracking-wider">AI Analysis</p>
                                                        <p className="text-xs text-foreground/90 leading-relaxed">
                                                            {part.visual_evidence || part.notes}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <p className="text-[10px] text-muted-foreground italic">No specific visual defects noted.</p>
                                                )}
                                                
                                                <PartFeedback
                                                    inspectionId={inspectionId || null}
                                                    partCode={part.code}
                                                    userId={user?.id || null}
                                                />
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))
                            )}
                        </Accordion>
                    </div>
                </div>

            </div>

          </div>

          {/* LIGHTBOX OVERLAY */}
          <Dialog open={!!selectedImage} onOpenChange={(open) => { if (!open) { setSelectedImage(null); setZoomScale(1); } }}>
            <DialogContent className="max-w-[90vw] md:max-w-4xl p-0 bg-transparent border-none shadow-none flex items-center justify-center">
              {selectedImage && (
                <div
                  className="relative group overflow-hidden rounded-lg"
                  onWheel={(e) => {
                    e.preventDefault();
                    setZoomScale(prev => Math.min(5, Math.max(1, prev - e.deltaY * 0.001)));
                  }}
                >
                    <img
                        src={selectedImage}
                        alt="Vehicle detail"
                        className="w-full h-[80vh] object-contain shadow-2xl bg-black/50 backdrop-blur-sm transition-transform duration-100"
                        style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
                    />
                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-4 right-4 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        onClick={() => { setSelectedImage(null); setZoomScale(1); }}
                    >
                        <XCircle className="h-5 w-5" />
                    </Button>
                    {zoomScale > 1 && (
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                        {Math.round(zoomScale * 100)}%
                      </div>
                    )}
                </div>
              )}
            </DialogContent>
          </Dialog>

        </div>
      </TooltipProvider>
    </MainLayout>
  );
}