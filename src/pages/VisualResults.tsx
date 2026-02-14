import { useState, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Download, Filter, ArrowLeft, ExternalLink, AlertTriangle, Eye, TrendingUp, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
    case 'SEVERE': return 'bg-destructive text-destructive-foreground';
    case 'MODERATE': return 'bg-orange-500 text-white';
    case 'MINOR': return 'bg-yellow-500 text-white';
    case 'NONE': return 'bg-success text-success-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getSeverityLabel = (severity?: PartSeverity) => {
  if (!severity) return null;
  return severity.charAt(0) + severity.slice(1).toLowerCase();
};

const getConfidenceColor = (confidence?: number) => {
  if (confidence === undefined) return 'text-muted-foreground';
  if (confidence >= 0.8) return 'text-success';
  if (confidence >= 0.5) return 'text-yellow-500';
  return 'text-destructive';
};

export default function VisualResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewTab, setViewTab] = useState<string>('visual-map');
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]);
  const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const { vehicleUrl, vehicleName, vehicleSummary, imageUrls, parts = [], inspectionId } = (location.state as LocationState) || {};

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
    const wsData = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inspection Report');
    XLSX.writeFile(wb, `vehicle-inspection-${Date.now()}.xlsx`);
  };

  const handleMapPartClick = useCallback((code: string) => {
    setActiveFilter('all');
    setSearchQuery('');
    setOpenAccordionItems(prev => prev.includes(code) ? prev : [...prev, code]);
    setViewTab('detailed-list');
    // Scroll after tab switch renders
    setTimeout(() => {
      accordionRefs.current[code]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
  }, []);

  if (!vehicleUrl || parts.length === 0) {
    return <Navigate to="/" replace />;
  }

  return (
    <MainLayout>
      <TooltipProvider>
        <div className="container py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/history')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {vehicleName || 'Inspection Report'}
              </h1>
              <a
                href={vehicleUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                View original listing <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Summary Banner */}
          {vehicleSummary && (
            <Card className="mb-6 border-primary/30 bg-primary/5">
              <CardContent className="py-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">AI Assessment Summary</p>
                  <p className="text-sm text-muted-foreground">{vehicleSummary}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left Panel - Image Gallery */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Visual Evidence ({imageUrls?.length || 0} images)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {(imageUrls || []).map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(url)}
                        className="relative aspect-video rounded-lg overflow-hidden group border border-border hover:border-primary transition-colors"
                      >
                        <img src={url} alt={`Vehicle image ${idx + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-3 space-y-6">
              {/* Score Card */}
              <Card className="glass-card border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Health Score</p>
                      <p className="text-4xl font-bold">
                        <span className="text-success">{score.good}</span>
                        <span className="text-muted-foreground">/27</span>
                        <span className="text-lg ml-2 text-muted-foreground font-normal">Parts Good</span>
                      </p>
                    </div>
                    <Button onClick={exportToExcel} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />Export Excel
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-2xl font-bold text-success">{score.good}</p>
                      <p className="text-xs text-muted-foreground">Good</p>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-2xl font-bold text-destructive">{score.damaged}</p>
                      <p className="text-xs text-muted-foreground">Damaged</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted border border-border">
                      <p className="text-2xl font-bold text-muted-foreground">{score.notVisible}</p>
                      <p className="text-xs text-muted-foreground">Not Visible</p>
                    </div>
                  </div>

                  {(severityStats.severe > 0 || severityStats.moderate > 0 || avgConfidence !== null) && (
                    <div className="pt-4 border-t border-border">
                      <div className="flex flex-wrap gap-4">
                        {severityStats.severe > 0 && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {severityStats.severe} Severe
                          </Badge>
                        )}
                        {severityStats.moderate > 0 && (
                          <Badge className="bg-orange-500 hover:bg-orange-600 gap-1">
                            {severityStats.moderate} Moderate
                          </Badge>
                        )}
                        {severityStats.minor > 0 && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600 gap-1">
                            {severityStats.minor} Minor
                          </Badge>
                        )}
                        {avgConfidence !== null && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-2 text-sm">
                                <TrendingUp className={cn("h-4 w-4", getConfidenceColor(avgConfidence))} />
                                <span className={getConfidenceColor(avgConfidence)}>
                                  {Math.round(avgConfidence * 100)}% avg confidence
                                </span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Average AI confidence across all evaluated parts</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* View Mode Tabs */}
              <Tabs value={viewTab} onValueChange={setViewTab}>
                <TabsList className="w-full justify-start bg-muted/50">
                  <TabsTrigger value="visual-map" className="gap-2">
                    <Eye className="h-4 w-4" /> Visual Map
                  </TabsTrigger>
                  <TabsTrigger value="detailed-list" className="gap-2">
                    <Filter className="h-4 w-4" /> Detailed List
                  </TabsTrigger>
                </TabsList>

                {/* Visual Map Tab */}
                <TabsContent value="visual-map">
                  <Card className="glass-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Interactive Part Map</CardTitle>
                      <p className="text-xs text-muted-foreground">Click any hotspot to view part details</p>
                    </CardHeader>
                    <CardContent>
                      <CarMap parts={parts} onPartClick={handleMapPartClick} />
                      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-success inline-block" /> Good</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-destructive inline-block" /> Damaged</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-muted-foreground/50 inline-block" /> Not Visible</span>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Detailed List Tab */}
                <TabsContent value="detailed-list">
                  {/* Search */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search parts by name or code..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 bg-muted/50 border-border"
                    />
                  </div>

                  {/* Filter Tabs */}
                  <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as FilterTab)} className="mb-4">
                    <TabsList className="w-full justify-start bg-muted/50">
                      <TabsTrigger value="all" className="gap-2">
                        <Filter className="h-4 w-4" /> All ({parts.length})
                      </TabsTrigger>
                      <TabsTrigger value="damaged">Damaged ({score.damaged})</TabsTrigger>
                      <TabsTrigger value="good">Good ({score.good})</TabsTrigger>
                      <TabsTrigger value="unknown">Unknown ({score.notVisible})</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Accordion */}
                  <Card className="glass-card">
                    <CardContent className="p-0">
                      <Accordion
                        type="multiple"
                        className="w-full"
                        value={openAccordionItems}
                        onValueChange={setOpenAccordionItems}
                      >
                        {filteredParts.map((part, idx) => (
                          <AccordionItem
                            key={part.code}
                            value={part.code}
                            ref={(el) => { accordionRefs.current[part.code] = el as HTMLDivElement | null; }}
                            className={cn(
                              "animate-slide-in border-b last:border-b-0",
                              part.status === 'DAMAGED' && "bg-destructive/5"
                            )}
                            style={{ animationDelay: `${idx * 20}ms` }}
                          >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                              <div className="flex items-center gap-4 flex-1 text-left">
                                <span className="font-mono text-xs text-muted-foreground w-14">{part.code}</span>
                                <span className="font-medium flex-1">{part.name}</span>
                                <div className="flex items-center gap-2">
                                  {part.severity && part.severity !== 'NONE' && (
                                    <Badge className={cn("text-xs", getSeverityColor(part.severity))}>
                                      {getSeverityLabel(part.severity)}
                                    </Badge>
                                  )}
                                  <StatusBadge status={part.status} />
                                  {part.confidence !== undefined && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1">
                                          <Eye className={cn("h-3 w-3", getConfidenceColor(part.confidence))} />
                                          <span className={cn("text-xs", getConfidenceColor(part.confidence))}>
                                            {Math.round(part.confidence * 100)}%
                                          </span>
                                        </div>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>AI confidence: {Math.round(part.confidence * 100)}%</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                              <div className="pl-14 space-y-3">
                                {(part.visual_evidence || part.notes) && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Visual Evidence</p>
                                    <p className="text-sm text-foreground">{part.visual_evidence || part.notes}</p>
                                  </div>
                                )}
                                {part.confidence !== undefined && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Confidence Level</p>
                                    <div className="flex items-center gap-3">
                                      <Progress value={part.confidence * 100} className="h-2 flex-1" />
                                      <span className={cn("text-sm font-medium", getConfidenceColor(part.confidence))}>
                                        {Math.round(part.confidence * 100)}%
                                      </span>
                                    </div>
                                  </div>
                                )}
                                <PartFeedback
                                  inspectionId={inspectionId || null}
                                  partCode={part.code}
                                  userId={user?.id || null}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Lightbox */}
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl p-0 bg-transparent border-none">
              {selectedImage && (
                <img src={selectedImage} alt="Vehicle detail" className="w-full h-auto rounded-lg" />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </TooltipProvider>
    </MainLayout>
  );
}
