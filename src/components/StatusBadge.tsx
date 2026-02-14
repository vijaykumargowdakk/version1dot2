import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, EyeOff } from 'lucide-react';
import type { PartStatus } from '@/types/inspection';

interface StatusBadgeProps {
  status: PartStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = {
    GOOD: {
      icon: CheckCircle2,
      label: 'Good',
      className: 'bg-success/10 text-success border-success/20',
    },
    DAMAGED: {
      icon: XCircle,
      label: 'Damaged',
      className: 'bg-destructive/10 text-destructive border-destructive/20',
    },
    NOT_VISIBLE: {
      icon: EyeOff,
      label: 'Unknown',
      className: 'bg-muted text-muted-foreground border-border',
    },
  };

  const { icon: Icon, label, className: statusClassName } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
        statusClassName,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}
