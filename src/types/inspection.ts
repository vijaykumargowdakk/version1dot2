export type PartCode = 
  | 'FBR' | 'BBF' | 'HLP-L' | 'GRL' | 'HLP-R' | 'FEN-L' | 'HOD' | 'FEN-R' | 'ENG' 
  | 'TRA' | 'FAX' | 'UCM' | 'DMR-L' | 'BAG' | 'DMR-R' | 'FDR-L' | 'FDR-R' | 'RDR-L' 
  | 'RDR-R' | 'QTR-L' | 'QTR-R' | 'RAX' | 'TLP-L' | 'TLP-R' | 'LID' | 'RBR' | 'BBR';

export type PartStatus = 'GOOD' | 'DAMAGED' | 'NOT_VISIBLE';

export type PartSeverity = 'NONE' | 'MINOR' | 'MODERATE' | 'SEVERE';

export interface InspectionPart {
  code: PartCode;
  name: string;
  status: PartStatus;
  severity?: PartSeverity;
  visual_evidence?: string;
  confidence?: number;
  notes?: string; // Legacy field, now replaced by visual_evidence
}

export interface PartDefinition {
  id: number;
  code: PartCode;
  name: string;
}

export const PARTS_MASTER_LIST: PartDefinition[] = [
  { id: 1, code: 'FBR', name: 'Front Bumper Bar' },
  { id: 2, code: 'BBF', name: 'Bumper Bar Front' },
  { id: 3, code: 'HLP-L', name: 'Head Lamp Left' },
  { id: 4, code: 'GRL', name: 'Grill' },
  { id: 5, code: 'HLP-R', name: 'Head Lamp Right' },
  { id: 6, code: 'FEN-L', name: 'Fender Left' },
  { id: 7, code: 'HOD', name: 'Hood' },
  { id: 8, code: 'FEN-R', name: 'Fender Right' },
  { id: 9, code: 'ENG', name: 'Engine' },
  { id: 10, code: 'TRA', name: 'Transmission' },
  { id: 11, code: 'FAX', name: 'Front Axle Assembly' },
  { id: 12, code: 'UCM', name: 'UnderCarriage X-Member' },
  { id: 13, code: 'DMR-L', name: 'Door Mirror - Left' },
  { id: 14, code: 'BAG', name: 'AirBag' },
  { id: 15, code: 'DMR-R', name: 'Door Mirror - Right' },
  { id: 16, code: 'FDR-L', name: 'Front Door Left' },
  { id: 17, code: 'FDR-R', name: 'Front Door Right' },
  { id: 18, code: 'RDR-L', name: 'Rear Door Left' },
  { id: 19, code: 'RDR-R', name: 'Rear Door Right' },
  { id: 20, code: 'QTR-L', name: 'Quarter Panel Left' },
  { id: 21, code: 'QTR-R', name: 'Quarter Panel Right' },
  { id: 22, code: 'RAX', name: 'Rear Axle Assembly' },
  { id: 23, code: 'TLP-L', name: 'Tail Lamp Left' },
  { id: 24, code: 'TLP-R', name: 'Tail Lamp Right' },
  { id: 25, code: 'LID', name: 'TrunkLid/LiftGate/TailGate' },
  { id: 26, code: 'RBR', name: 'Rear Bumper' },
  { id: 27, code: 'BBR', name: 'Bumper/Rear' }
];

export interface Inspection {
  id: string;
  created_at: string;
  vehicle_url: string;
  vehicle_name: string | null;
  vin: string | null;
  thumbnail_url: string | null;
  image_urls: string[];
  health_score: number | null;
  inspection_data: InspectionPart[];
  isDemo?: boolean; // true if from demo inspections table
}

export interface InspectionReport {
  vehicleUrl: string;
  vehicleName?: string;
  vin?: string;
  imageUrls: string[];
  parts: InspectionPart[];
  analyzedAt: Date;
  score: {
    good: number;
    damaged: number;
    notVisible: number;
  };
}
