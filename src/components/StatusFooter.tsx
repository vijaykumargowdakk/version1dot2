import { Zap, Shield, Eye } from 'lucide-react';

const statusItems = [
  { icon: Zap, label: 'AI Analysis Ready' },
  { icon: Shield, label: '27-Point Check' },
  { icon: Eye, label: 'Custom Tuned AI' },
];

export function StatusFooter() {
  return (
    <div className="fixed bottom-6 md:bottom-8 left-0 right-0 flex justify-center gap-3 md:gap-6 px-4 z-40">
      {statusItems.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground bg-background/20 backdrop-blur-sm px-3 md:px-4 py-2 rounded-full border border-foreground/5"
        >
          <Icon className="h-3 w-3 text-primary" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{label.split(' ')[0]}</span>
        </div>
      ))}
    </div>
  );
}
