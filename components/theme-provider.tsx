"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    // Initialize theme on mount
    const initializeTheme = () => {
      const root = document.documentElement;

      // Ensure theme class is applied
      const savedTheme = localStorage.getItem('umrahgo-theme') || 'system';
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const resolvedTheme = savedTheme === 'system' ? systemTheme : savedTheme;

      // Remove any existing theme classes
      root.classList.remove('light', 'dark');

      // Add the resolved theme class
      if (resolvedTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.add('light');
      }

      // Update meta theme color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        const backgroundColor = resolvedTheme === 'dark' ? '#111827' : '#FFFFFF';
        metaThemeColor.setAttribute('content', backgroundColor);
      }
    };

    // Initialize theme immediately
    initializeTheme();

    // Improve theme transitions
    const handleThemeChange = () => {
      document.documentElement.classList.add('theme-transition');
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 300);
    };

    // Monitor theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const classList = document.documentElement.classList;
          if (classList.contains('dark') || classList.contains('light')) {
            handleThemeChange();
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Clean up resources
    return () => {
      observer.disconnect();
    };
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="light bg-background text-foreground antialiased min-h-screen">
        <div className="opacity-0 transition-opacity duration-300">
          {children}
        </div>
      </div>
    );
  }

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="umrahgo-theme"
      themes={['light', 'dark', 'system']}
      {...props}
    >
      <div className="transition-colors duration-300 ease-in-out">
        {children}
      </div>
    </NextThemesProvider>
  );
} 