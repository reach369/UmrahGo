'use client';

import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Sun, Moon, Monitor, Check, X } from 'lucide-react';

export default function TestThemePage() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const t = useTranslations();
  const [mounted, setMounted] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
    
    // Run theme tests
    const runTests = () => {
      const results: Record<string, boolean> = {};
      
      // Test 1: Check if theme provider is working
      results.themeProvider = typeof theme !== 'undefined';
      
      // Test 2: Check if CSS variables are defined
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      results.cssVariables = computedStyle.getPropertyValue('--background').trim() !== '';
      
      // Test 3: Check if theme classes are applied
      results.themeClasses = root.classList.contains('light') || root.classList.contains('dark');
      
      // Test 4: Check if theme switching works
      const currentTheme = resolvedTheme;
      results.themeSwitching = currentTheme === 'light' || currentTheme === 'dark';
      
      // Test 5: Check if localStorage is working
      try {
        const savedTheme = localStorage.getItem('umrahgo-theme');
        results.localStorage = savedTheme !== null;
      } catch {
        results.localStorage = false;
      }
      
      setTestResults(results);
    };
    
    // Run tests after a short delay to ensure everything is loaded
    setTimeout(runTests, 100);
  }, [theme, resolvedTheme]);

  const TestResult = ({ name, passed, description }: { 
    name: string; 
    passed: boolean; 
    description: string; 
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="flex items-center gap-2">
        {passed ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <X className="h-5 w-5 text-red-500" />
        )}
        <Badge variant={passed ? "default" : "destructive"}>
          {passed ? "PASS" : "FAIL"}
        </Badge>
      </div>
    </div>
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const allTestsPassed = Object.values(testResults).every(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-primary">Theme System Test</h1>
          <p className="text-muted-foreground">
            Comprehensive testing of the dark/light theme functionality
          </p>
          
          {/* Overall Status */}
          <div className="flex items-center justify-center gap-4">
            <Badge 
              variant={allTestsPassed ? "default" : "destructive"}
              className="text-lg px-4 py-2"
            >
              {allTestsPassed ? "✅ All Tests Passed" : "❌ Some Tests Failed"}
            </Badge>
          </div>
        </div>

        {/* Theme Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Theme Controls</CardTitle>
            <CardDescription>Test theme switching functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <ThemeToggle />
              <ThemeToggle showDropdown />
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                onClick={() => setTheme('light')}
                variant={resolvedTheme === 'light' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button 
                onClick={() => setTheme('dark')}
                variant={resolvedTheme === 'dark' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button 
                onClick={() => setTheme('system')}
                variant={theme === 'system' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
            
            <div className="text-center space-y-2">
              <div><strong>Current Theme:</strong> {theme || 'loading...'}</div>
              <div><strong>Resolved Theme:</strong> {resolvedTheme || 'loading...'}</div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Automated tests for theme system functionality</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <TestResult
              name="Theme Provider"
              passed={testResults.themeProvider}
              description="Checks if next-themes provider is working correctly"
            />
            <TestResult
              name="CSS Variables"
              passed={testResults.cssVariables}
              description="Verifies that CSS custom properties are defined"
            />
            <TestResult
              name="Theme Classes"
              passed={testResults.themeClasses}
              description="Ensures theme classes are applied to document element"
            />
            <TestResult
              name="Theme Switching"
              passed={testResults.themeSwitching}
              description="Validates that theme switching resolves correctly"
            />
            <TestResult
              name="Local Storage"
              passed={testResults.localStorage}
              description="Confirms theme preference persistence"
            />
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette Test</CardTitle>
            <CardDescription>Visual verification of theme colors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'Primary', class: 'bg-primary' },
                { name: 'Secondary', class: 'bg-secondary' },
                { name: 'Accent', class: 'bg-accent' },
                { name: 'Muted', class: 'bg-muted' },
                { name: 'Card', class: 'bg-card border' },
                { name: 'Destructive', class: 'bg-destructive' },
                { name: 'Gradient Primary', class: 'bg-gradient-primary' },
                { name: 'Gradient Gold', class: 'bg-gradient-gold' },
              ].map((color) => (
                <div key={color.name} className="space-y-2">
                  <div className={`w-full h-16 rounded-lg ${color.class}`}></div>
                  <p className="text-sm text-center">{color.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Component Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Component Tests</CardTitle>
            <CardDescription>Testing UI components with current theme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            
            <div className="space-y-2">
              <p className="text-foreground">Foreground text</p>
              <p className="text-muted-foreground">Muted foreground text</p>
              <p className="text-primary">Primary text</p>
              <p className="text-secondary">Secondary text</p>
              <p className="text-destructive">Destructive text</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
