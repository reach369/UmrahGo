'use client';

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { colors } from './theme';

interface GradientButtonProps extends ButtonProps {
  gradient?: 'primary' | 'secondary' | 'green' | 'blue' | 'dark';
  hoverScale?: number;
  withShadow?: boolean;
  fullWidth?: boolean;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  pulse?: boolean;
}

export function GradientButton({
  children,
  className,
  gradient = 'primary',
  hoverScale = 1.02,
  withShadow = true,
  fullWidth = false,
  rounded = 'lg',
  iconLeft,
  iconRight,
  pulse = false,
  ...props
}: GradientButtonProps) {
  const getGradient = () => {
    return colors.gradients[gradient] || colors.gradients.primary;
  };
  
  const getHoverGradient = () => {
    if (gradient === 'primary') return 'linear-gradient(135deg, #0C5A48 0%, #062C2A 100%)';
    if (gradient === 'secondary') return 'linear-gradient(135deg, #BF9D32 0%, #A5882B 100%)';
    if (gradient === 'green') return 'linear-gradient(135deg, #059669 0%, #047857 100%)';
    if (gradient === 'blue') return 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)';
    if (gradient === 'dark') return 'linear-gradient(135deg, #1F2937 0%, #111827 100%)';
    return 'linear-gradient(135deg, #0C5A48 0%, #062C2A 100%)';
  };
  
  const getShadowColor = () => {
    if (gradient === 'primary') return 'rgba(14, 102, 82, 0.3)';
    if (gradient === 'secondary') return 'rgba(212, 175, 55, 0.3)';
    if (gradient === 'green') return 'rgba(16, 185, 129, 0.3)';
    if (gradient === 'blue') return 'rgba(59, 130, 246, 0.3)';
    if (gradient === 'dark') return 'rgba(17, 24, 39, 0.3)';
    return 'rgba(14, 102, 82, 0.3)';
  };
  
  const getRoundedClass = () => {
    switch (rounded) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded';
      case 'lg': return 'rounded-lg';
      case 'xl': return 'rounded-xl';
      case 'full': return 'rounded-full';
      default: return 'rounded-lg';
    }
  };
  
  const buttonStyles = {
    background: getGradient(),
    boxShadow: withShadow ? `0 10px 15px -3px ${getShadowColor()}, 0 4px 6px -2px ${getShadowColor()}` : 'none',
  };
  
  const pulseAnimation = pulse ? {
    animate: {
      boxShadow: [
        `0 0 0 0 ${getShadowColor()}`,
        `0 0 0 10px rgba(0, 0, 0, 0)`,
      ],
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatType: 'loop' as const,
    },
  } : {};

  return (
    <motion.div
      className={cn(
        getRoundedClass(),
        fullWidth && 'w-full',
        className
      )}
      style={buttonStyles}
      whileHover={{ 
        scale: hoverScale,
        background: getHoverGradient(),
        boxShadow: withShadow ? `0 15px 25px -5px ${getShadowColor()}, 0 10px 10px -5px ${getShadowColor()}` : 'none',
      }}
      whileTap={{ scale: 0.98 }}
      {...pulseAnimation}
    >
      <Button
        className={cn(
          "border-0 bg-transparent hover:bg-transparent h-auto py-2.5 px-6 text-white",
          fullWidth && 'w-full',
          getRoundedClass(),
          "flex items-center justify-center gap-2"
        )}
        {...props}
      >
        {iconLeft && <span className="mr-2">{iconLeft}</span>}
        {children}
        {iconRight && <span className="ml-2">{iconRight}</span>}
      </Button>
    </motion.div>
  );
}

export function PrimaryButton(props: Omit<GradientButtonProps, 'gradient'>) {
  return <GradientButton gradient="primary" {...props} />;
}

export function SecondaryButton(props: Omit<GradientButtonProps, 'gradient'>) {
  return <GradientButton gradient="secondary" {...props} />;
}

export function ActionButton({
  children,
  className,
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <Button
      className={cn(
        "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300",
        className
      )}
      size={size}
      {...props}
    >
      {children}
    </Button>
  );
}

export function OutlineButton({
  children,
  className,
  size = 'default',
  ...props
}: ButtonProps) {
  return (
    <Button
      className={cn(
        "border border-primary/30 bg-transparent hover:bg-primary/5 text-primary rounded-full shadow-sm hover:shadow transition-all duration-300",
        className
      )}
      variant="outline"
      size={size}
      {...props}
    >
      {children}
    </Button>
  );
} 