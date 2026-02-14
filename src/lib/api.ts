import { supabase } from '@/integrations/supabase/client';
import { PARTS_MASTER_LIST, type InspectionPart, type Inspection } from '@/types/inspection';

interface AnalysisResult {
  code: string;
  name?: string;
  status: 'GOOD' | 'DAMAGED' | 'NOT_VISIBLE';
  severity?: 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE';
  visual_evidence?: string;
  confidence?: number;
  notes?: string;
}

interface AnalyzeResponse {
  analysis: InspectionPart[];
  vehicleName?: string;
  vehicleSummary?: string;
  imageUrls: string[];
  healthScore: number;
  inspectionId?: string;
}

// Helper to bypass strict typing for tables not yet in generated types
function fromTable(table: string) {
  return (supabase as any).from(table);
}

export async function analyzeVehicle(url: string, imageUrls?: string[]): Promise<AnalyzeResponse> {
  console.log('Calling analyze-vehicle function...');
  
  const { data, error } = await supabase.functions.invoke('analyze-vehicle', {
    body: { url, imageUrls },
  });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error(error.message || 'Failed to analyze vehicle');
  }

  if (data?.error) {
    console.error('Analysis error:', data.error);
    throw new Error(data.error);
  }

  const rawAnalysis: AnalysisResult[] = data?.analysis || [];
  
  const analysis: InspectionPart[] = PARTS_MASTER_LIST.map(part => {
    const result = rawAnalysis.find(a => a.code === part.code);
    return {
      code: part.code,
      name: result?.name || part.name,
      status: result?.status || 'NOT_VISIBLE',
      severity: result?.severity,
      visual_evidence: result?.visual_evidence,
      confidence: result?.confidence,
      notes: result?.notes,
    };
  });

  return {
    analysis,
    vehicleName: data?.vehicleName,
    vehicleSummary: data?.vehicleSummary,
    imageUrls: data?.imageUrls || imageUrls || [],
    healthScore: data?.healthScore || analysis.filter(p => p.status === 'GOOD').length,
    inspectionId: data?.inspectionId,
  };
}

export async function getInspectionHistory(userId?: string): Promise<Inspection[]> {
  const allInspections: Inspection[] = [];

  const { data: demoData, error: demoError } = await fromTable('inspections')
    .select('*')
    .is('user_id', null)
    .order('created_at', { ascending: false });

  if (demoError) {
    console.error('Failed to fetch demo inspections:', demoError);
  } else if (demoData) {
    allInspections.push(...(demoData as any[]).map((item: any) => ({
      id: item.id,
      created_at: item.created_at,
      vehicle_url: item.vehicle_url,
      vehicle_name: item.vehicle_name,
      vin: item.vin,
      thumbnail_url: item.thumbnail_url,
      image_urls: item.image_urls || [],
      health_score: item.health_score,
      inspection_data: (item.inspection_data as InspectionPart[]) || [],
      isDemo: true,
    })));
  }

  if (userId) {
    const { data: userData, error: userError } = await fromTable('user_inspections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (userError) {
      console.error('Failed to fetch user inspections:', userError);
    } else if (userData) {
      allInspections.push(...(userData as any[]).map((item: any) => ({
        id: item.id,
        created_at: item.created_at,
        vehicle_url: item.vehicle_url,
        vehicle_name: item.vehicle_name,
        vin: item.vin,
        thumbnail_url: item.thumbnail_url,
        image_urls: item.image_urls || [],
        health_score: item.health_score,
        inspection_data: (item.inspection_data as InspectionPart[]) || [],
        isDemo: false,
      })));
    }
  }

  return allInspections.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) as Inspection[];
}

export async function getInspectionById(id: string, userId?: string): Promise<Inspection | null> {
  if (userId) {
    const { data: userData, error: userError } = await fromTable('user_inspections')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!userError && userData) {
      const item = userData as any;
      return {
        id: item.id,
        created_at: item.created_at,
        vehicle_url: item.vehicle_url,
        vehicle_name: item.vehicle_name,
        vin: item.vin,
        thumbnail_url: item.thumbnail_url,
        image_urls: item.image_urls || [],
        health_score: item.health_score,
        inspection_data: (item.inspection_data as InspectionPart[]) || [],
        isDemo: false,
      } as Inspection;
    }
  }

  const { data, error } = await fromTable('inspections')
    .select('*')
    .eq('id', id)
    .is('user_id', null)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch inspection:', error);
    return null;
  }

  if (!data) return null;

  const item = data as any;
  return {
    id: item.id,
    created_at: item.created_at,
    vehicle_url: item.vehicle_url,
    vehicle_name: item.vehicle_name,
    vin: item.vin,
    thumbnail_url: item.thumbnail_url,
    image_urls: item.image_urls || [],
    health_score: item.health_score,
    inspection_data: (item.inspection_data as InspectionPart[]) || [],
    isDemo: true,
  } as Inspection;
}
