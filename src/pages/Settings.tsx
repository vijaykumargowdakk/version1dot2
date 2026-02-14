import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/components/ThemeProvider';
import { Moon, Sun, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { theme, setTheme } = useTheme();

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <MainLayout>
      <div className="container py-8 relative z-50">
        {/* Glassmorphism Container */}
        <div className="max-w-2xl mx-auto bg-background/60 backdrop-blur-md border border-border/30 rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Customize your ArgusEye experience
            </p>
          </div>

          <div className="space-y-6">
            <Card className="bg-background/40 border-border/30">
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how ArgusEye looks on your device
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-lg border transition-all",
                          theme === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border/30 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <option.icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-background/40 border-border/30">
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure how you receive updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Email notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive inspection results via email
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Analysis complete alerts</Label>
                    <p className="text-xs text-muted-foreground">
                      Get notified when AI analysis is done
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
