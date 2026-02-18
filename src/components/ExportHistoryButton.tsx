import { useState } from 'react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { Download, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Inspection } from '@/types/inspection';
import { exportInspectionsToExcel } from '@/lib/exportInspections';

type RangePreset = 'today' | 'yesterday' | 'custom';

interface ExportHistoryButtonProps {
  inspections: Inspection[];
}

export function ExportHistoryButton({ inspections }: ExportHistoryButtonProps) {
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<RangePreset | null>(null);
  const [customFrom, setCustomFrom] = useState<Date>();
  const [customTo, setCustomTo] = useState<Date>();

  const doExport = (from: Date, to: Date) => {
    const filtered = inspections.filter((ins) => {
      const d = new Date(ins.created_at);
      return d >= from && d <= to;
    });

    if (filtered.length === 0) {
      setOpen(false);
      return;
    }

    exportInspectionsToExcel(
      filtered,
      `inspection-detail-${format(from, 'yyyyMMdd')}-${format(to, 'yyyyMMdd')}`,
    );
    setOpen(false);
    setPreset(null);
  };

  const handlePreset = (p: RangePreset) => {
    setPreset(p);
    if (p === 'today') {
      doExport(startOfDay(new Date()), endOfDay(new Date()));
    } else if (p === 'yesterday') {
      const y = subDays(new Date(), 1);
      doExport(startOfDay(y), endOfDay(y));
    }
  };

  const handleCustomExport = () => {
    if (customFrom && customTo) {
      doExport(startOfDay(customFrom), endOfDay(customTo));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export History
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 z-[70]" align="end">
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground">Select date range</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={preset === 'today' ? 'default' : 'outline'}
              onClick={() => handlePreset('today')}
            >
              Today
            </Button>
            <Button
              size="sm"
              variant={preset === 'yesterday' ? 'default' : 'outline'}
              onClick={() => handlePreset('yesterday')}
            >
              Yesterday
            </Button>
            <Button
              size="sm"
              variant={preset === 'custom' ? 'default' : 'outline'}
              onClick={() => setPreset('custom')}
            >
              Custom
            </Button>
          </div>

          {preset === 'custom' && (
            <div className="space-y-3 pt-2 border-t border-border">
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal", !customFrom && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {customFrom ? format(customFrom, 'MMM d') : 'From'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[80]" align="start">
                    <Calendar
                      mode="single"
                      selected={customFrom}
                      onSelect={setCustomFrom}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("justify-start text-left font-normal", !customTo && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-3 w-3" />
                      {customTo ? format(customTo, 'MMM d') : 'To'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[80]" align="start">
                    <Calendar
                      mode="single"
                      selected={customTo}
                      onSelect={setCustomTo}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <Button
                size="sm"
                className="w-full"
                disabled={!customFrom || !customTo}
                onClick={handleCustomExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
