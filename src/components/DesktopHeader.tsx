import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Separator } from '@/components/ui/separator';

interface DesktopHeaderProps {
  title?: string;
}

export function DesktopHeader({ title }: DesktopHeaderProps) {
  return (
    <header className="sticky top-0 z-40 hidden md:flex h-14 items-center gap-4 border-b border-border bg-card/95 backdrop-blur-sm px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-6" />
      {title && (
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      )}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
}
