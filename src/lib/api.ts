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
  
  // Map the AI analysis results to our parts list
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

  // Always fetch public demo scans from inspections table
  const { data: demoData, error: demoError } = await supabase
    .from('inspections')
    .select('*')
    .is('user_id', null)
    .order('created_at', { ascending: false });

  if (demoError) {
    console.error('Failed to fetch demo inspections:', demoError);
  } else if (demoData) {
    allInspections.push(...demoData.map(item => ({
      id: item.id,
      created_at: item.created_at,
      vehicle_url: item.vehicle_url,
      vehicle_name: item.vehicle_name,
      vin: item.vin,
      thumbnail_url: item.thumbnail_url,
      image_urls: item.image_urls || [],
      health_score: item.health_score,
      inspection_data: (item.inspection_data as unknown as InspectionPart[]) || [],
      isDemo: true,
    })));
  }

  // If user is logged in, also fetch their personal scans from user_inspections table
  if (userId) {
    const { data: userData, error: userError } = await supabase
      .from('user_inspections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (userError) {
      console.error('Failed to fetch user inspections:', userError);
    } else if (userData) {
      allInspections.push(...userData.map(item => ({
        id: item.id,
        created_at: item.created_at,
        vehicle_url: item.vehicle_url,
        vehicle_name: item.vehicle_name,
        vin: item.vin,
        thumbnail_url: item.thumbnail_url,
        image_urls: item.image_urls || [],
        health_score: item.health_score,
        inspection_data: (item.inspection_data as unknown as InspectionPart[]) || [],
        isDemo: false,
      })));
    }
  }

  // Sort all inspections by created_at descending
  return allInspections.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) as Inspection[];
}

export async function getInspectionById(id: string, userId?: string): Promise<Inspection | null> {
  // First try user_inspections if user is logged in
  if (userId) {
    const { data: userData, error: userError } = await supabase
      .from('user_inspections')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (!userError && userData) {
      return {
        id: userData.id,
        created_at: userData.created_at,
        vehicle_url: userData.vehicle_url,
        vehicle_name: userData.vehicle_name,
        vin: userData.vin,
        thumbnail_url: userData.thumbnail_url,
        image_urls: userData.image_urls || [],
        health_score: userData.health_score,
        inspection_data: (userData.inspection_data as unknown as InspectionPart[]) || [],
        isDemo: false,
      } as Inspection;
    }
  }

  // Fall back to demo inspections table
  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .eq('id', id)
    .is('user_id', null)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch inspection:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    created_at: data.created_at,
    vehicle_url: data.vehicle_url,
    vehicle_name: data.vehicle_name,
    vin: data.vin,
    thumbnail_url: data.thumbnail_url,
    image_urls: data.image_urls || [],
    health_score: data.health_score,
    inspection_data: (data.inspection_data as unknown as InspectionPart[]) || [],
    isDemo: true,
  } as Inspection;
}
