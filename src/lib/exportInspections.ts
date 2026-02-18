import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import type { Inspection } from '@/types/inspection';

/**
 * Shared helper: generate and download an Excel file from a list of inspections.
 * Each inspection produces one row per part (flat layout).
 */
export function exportInspectionsToExcel(inspections: Inspection[], filenamePrefix = 'inspection-export') {
  if (inspections.length === 0) return;

  const headers = [
    'Date', 'Vehicle Name', 'VIN', 'Health Score', 'Link',
    'Part Code', 'Part Name', 'Status', 'Severity', 'Visual Evidence', 'Confidence',
  ];

  const rows: (string | number)[][] = [];

  for (const ins of inspections) {
    const date = format(new Date(ins.created_at), 'yyyy-MM-dd HH:mm');
    const name = ins.vehicle_name || 'Unknown';
    const vin = ins.vin || 'N/A';
    const score = ins.health_score !== null ? `${ins.health_score}/27` : 'N/A';
    const link = ins.vehicle_url;
    const parts = ins.inspection_data || [];

    if (parts.length === 0) {
      rows.push([date, name, vin, score, link, '', '', '', '', '', '']);
    } else {
      for (const p of parts) {
        rows.push([
          date, name, vin, score, link,
          p.code,
          p.name,
          p.status,
          p.severity || '',
          p.visual_evidence || (p as any).notes || '',
          p.confidence !== undefined ? `${Math.round(p.confidence * 100)}%` : '',
        ]);
      }
    }
  }

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws['!cols'] = headers.map((_, i) => ({ wch: i === 9 ? 60 : i === 4 ? 40 : 18 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Detailed Inspections');
  const now = format(new Date(), 'yyyyMMdd');
  XLSX.writeFile(wb, `${filenamePrefix}-${now}.xlsx`);
}
