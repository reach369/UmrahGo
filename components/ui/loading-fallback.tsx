'use client';

import { Skeleton } from './skeleton';
import { cn } from '@/lib/utils';

interface LoadingFallbackProps {
  type?: 'cards' | 'list' | 'table' | 'hero' | 'testimonials' | 'features';
  count?: number;
  className?: string;
}

export function LoadingFallback({ type = 'cards', count = 3, className }: LoadingFallbackProps) {
  switch (type) {
    case 'cards':
      return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="bg-card rounded-xl overflow-hidden shadow-md animate-pulse">
              <Skeleton className="h-48 w-full" />
              <div className="p-6 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'list':
      return (
        <div className={cn("space-y-4", className)}>
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-card rounded-lg">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className={cn("space-y-4", className)}>
          <div className="grid grid-cols-4 gap-4 p-4 bg-card rounded-lg">
            {Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: count }, (_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 p-4 bg-card rounded-lg">
              {Array.from({ length: 4 }, (_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>
      );

    case 'hero':
      return (
        <div className={cn("space-y-6 text-center", className)}>
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <div className="flex justify-center space-x-4">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      );

    case 'testimonials':
      return (
        <div className={cn("space-y-6", className)}>
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="bg-card rounded-2xl p-8 text-center">
            <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
            </div>
          </div>
        </div>
      );

    case 'features':
      return (
        <div className={cn("space-y-8", className)}>
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-64 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }, (_, i) => (
              <div key={i} className="text-center p-6 space-y-4">
                <Skeleton className="h-16 w-16 rounded-full mx-auto" />
                <Skeleton className="h-6 w-3/4 mx-auto" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className={cn("space-y-4", className)}>
          {Array.from({ length: count }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      );
  }
}

export default LoadingFallback; 