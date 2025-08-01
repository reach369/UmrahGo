'use client';

import { useTheme } from 'next-themes';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Sun, 
  Moon, 
  Star, 
  Heart, 
  Settings, 
  User, 
  Mail, 
  Phone,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeTestPage() {
  const { theme, resolvedTheme } = useTheme();
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(33);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              🎨 Theme System Test
            </h1>
            <p className="text-muted-foreground">
              Current theme: <Badge variant="outline">{resolvedTheme}</Badge>
            </p>
          </div>
          <ThemeToggle className="w-12 h-12" />
        </div>

        {/* Theme Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Theme Information
            </CardTitle>
            <CardDescription>
              Current theme settings and system information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">{theme}</p>
              </div>
              <div>
                <Label>Resolved Theme</Label>
                <p className="text-sm text-muted-foreground">{resolvedTheme}</p>
              </div>
              <div>
                <Label>System Preference</Label>
                <p className="text-sm text-muted-foreground">
                  {typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>All theme colors in action</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <div className="w-full h-16 bg-primary rounded border"></div>
                <Label className="text-xs">Primary</Label>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-secondary rounded border"></div>
                <Label className="text-xs">Secondary</Label>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-accent rounded border"></div>
                <Label className="text-xs">Accent</Label>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-muted rounded border"></div>
                <Label className="text-xs">Muted</Label>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-destructive rounded border"></div>
                <Label className="text-xs">Destructive</Label>
              </div>
              <div className="space-y-2">
                <div className="w-full h-16 bg-card rounded border"></div>
                <Label className="text-xs">Card</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Components Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Buttons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full">Primary Button</Button>
              <Button variant="secondary" className="w-full">Secondary Button</Button>
              <Button variant="outline" className="w-full">Outline Button</Button>
              <Button variant="ghost" className="w-full">Ghost Button</Button>
              <Button variant="destructive" className="w-full">Destructive Button</Button>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Form Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Type your message here" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="notifications" />
                <Label htmlFor="notifications">Enable notifications</Label>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Interactive Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Progress</Label>
                <Progress value={progress} className="mt-2" />
              </div>
              <div>
                <Label>Slider</Label>
                <Slider defaultValue={[50]} max={100} step={1} className="mt-2" />
              </div>
              <div className="flex gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Info Alert</AlertTitle>
            <AlertDescription>
              This is an informational alert message.
            </AlertDescription>
          </Alert>
          
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Alert</AlertTitle>
            <AlertDescription>
              This is an error alert message.
            </AlertDescription>
          </Alert>
        </div>

        {/* Icons Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Icons & Typography</CardTitle>
            <CardDescription>Various icons and text styles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-6">
              <div className="flex flex-col items-center space-y-2">
                <Sun className="w-6 h-6 text-primary" />
                <span className="text-xs">Sun</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Moon className="w-6 h-6 text-primary" />
                <span className="text-xs">Moon</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Star className="w-6 h-6 text-primary" />
                <span className="text-xs">Star</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Heart className="w-6 h-6 text-destructive" />
                <span className="text-xs">Heart</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <User className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs">User</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Mail className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs">Mail</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <Phone className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs">Phone</span>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <span className="text-xs">Check</span>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Typography Examples</h2>
              <h3 className="text-xl font-semibold text-muted-foreground">Subtitle</h3>
              <p className="text-base">
                This is a regular paragraph with <strong>bold text</strong> and <em>italic text</em>.
              </p>
              <p className="text-sm text-muted-foreground">
                This is smaller text that's often used for descriptions.
              </p>
              <p className="text-xs text-muted-foreground">
                This is extra small text for fine print.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-muted-foreground">
          <p>Theme system is working correctly! 🎉</p>
        </div>
      </div>
    </div>
  );
}
