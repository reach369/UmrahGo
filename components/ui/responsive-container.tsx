'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  as?: keyof JSX.IntrinsicElements;
}

/**
 * حاوي متجاوب يتكيف مع جميع أحجام الشاشات
 */
export function ResponsiveContainer({
  children,
  className,
  size = 'lg',
  padding = 'md',
  as: Component = 'div',
}: ResponsiveContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  };

  const paddingClasses = {
    none: '',
    sm: 'px-4 sm:px-6',
    md: 'px-4 sm:px-6 lg:px-8',
    lg: 'px-4 sm:px-6 lg:px-8 xl:px-12',
    xl: 'px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16',
  };

  return (
    <Component
      className={cn(
        'w-full mx-auto',
        sizeClasses[size],
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </Component>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * شبكة متجاوبة مع تحكم كامل في الأعمدة
 */
export function ResponsiveGrid({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3, xl: 4 },
  gap = 'md',
}: ResponsiveGridProps) {
  const gapClasses = {
    sm: 'gap-2 sm:gap-3',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-10',
  };

  const getGridCols = () => {
    const classes = ['grid'];
    
    if (cols.default) classes.push(`grid-cols-${cols.default}`);
    if (cols.sm) classes.push(`sm:grid-cols-${cols.sm}`);
    if (cols.md) classes.push(`md:grid-cols-${cols.md}`);
    if (cols.lg) classes.push(`lg:grid-cols-${cols.lg}`);
    if (cols.xl) classes.push(`xl:grid-cols-${cols.xl}`);
    if (cols['2xl']) classes.push(`2xl:grid-cols-${cols['2xl']}`);
    
    return classes.join(' ');
  };

  return (
    <div
      className={cn(
        getGridCols(),
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * نص متجاوب يتكيف مع أحجام الشاشات
 */
export function ResponsiveText({
  children,
  className,
  size = 'base',
  weight = 'normal',
  as: Component = 'p',
}: ResponsiveTextProps) {
  const sizeClasses = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl',
    '4xl': 'text-4xl sm:text-5xl',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <Component
      className={cn(
        sizeClasses[size],
        weightClasses[weight],
        className
      )}
    >
      {children}
    </Component>
  );
}

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal' | 'responsive';
  spacing?: 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
}

/**
 * مكدس متجاوب للعناصر
 */
export function ResponsiveStack({
  children,
  className,
  direction = 'vertical',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
}: ResponsiveStackProps) {
  const directionClasses = {
    vertical: 'flex flex-col',
    horizontal: 'flex flex-row',
    responsive: 'flex flex-col sm:flex-row',
  };

  const spacingClasses = {
    sm: direction === 'vertical' ? 'space-y-2' : direction === 'horizontal' ? 'space-x-2' : 'space-y-2 sm:space-y-0 sm:space-x-2',
    md: direction === 'vertical' ? 'space-y-4' : direction === 'horizontal' ? 'space-x-4' : 'space-y-4 sm:space-y-0 sm:space-x-4',
    lg: direction === 'vertical' ? 'space-y-6' : direction === 'horizontal' ? 'space-x-6' : 'space-y-6 sm:space-y-0 sm:space-x-6',
    xl: direction === 'vertical' ? 'space-y-8' : direction === 'horizontal' ? 'space-x-8' : 'space-y-8 sm:space-y-0 sm:space-x-8',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  return (
    <div
      className={cn(
        directionClasses[direction],
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
}

/**
 * كارت متجاوب مع تحكم كامل في التصميم
 */
export function ResponsiveCard({
  children,
  className,
  padding = 'md',
  shadow = 'md',
  rounded = 'lg',
  border = true,
}: ResponsiveCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-10',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md hover:shadow-lg transition-shadow',
    lg: 'shadow-lg hover:shadow-xl transition-shadow',
    xl: 'shadow-xl hover:shadow-2xl transition-shadow',
  };

  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  };

  return (
    <div
      className={cn(
        'bg-background',
        paddingClasses[padding],
        shadowClasses[shadow],
        roundedClasses[rounded],
        border && 'border border-border',
        className
      )}
    >
      {children}
    </div>
  );
}

// Hook للتحقق من حجم الشاشة
export function useResponsive() {
  const [screenSize, setScreenSize] = React.useState<'mobile' | 'tablet' | 'desktop' | 'wide'>('desktop');

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else if (width < 1536) {
        setScreenSize('desktop');
      } else {
        setScreenSize('wide');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return {
    screenSize,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
    isWide: screenSize === 'wide',
    isMobileOrTablet: screenSize === 'mobile' || screenSize === 'tablet',
    isDesktopOrWide: screenSize === 'desktop' || screenSize === 'wide',
  };
}
