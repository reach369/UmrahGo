'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps extends Omit<React.ComponentProps<typeof motion.div>, "children"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  duration?: number;
  once?: boolean;
  threshold?: number;
  staggerChildren?: boolean;
  staggerDelay?: number;
  withFade?: boolean;
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = 'up',
  duration = 0.6,
  once = true,
  threshold = 0.1,
  staggerChildren = false,
  staggerDelay = 0.1,
  withFade = true,
  ...props
}: AnimatedSectionProps) {
  // Define animation variants based on direction
  const getVariants = (): Variants => {
    let initial = {};
    
    if (withFade) {
      initial = { ...initial, opacity: 0 };
    }
    
    switch (direction) {
      case 'up':
        initial = { ...initial, y: 50 };
        break;
      case 'down':
        initial = { ...initial, y: -50 };
        break;
      case 'left':
        initial = { ...initial, x: 50 };
        break;
      case 'right':
        initial = { ...initial, x: -50 };
        break;
      case 'none':
      default:
        break;
    }
    
    return {
      hidden: initial,
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration,
          delay,
          staggerChildren: staggerChildren ? staggerDelay : 0
        }
      }
    };
  };
  
  const variants = getVariants();
  const childVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };
  
  return (
    <motion.div
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={variants}
      {...props}
    >
      {staggerChildren
        ? React.Children.map(children, (child) => (
            <motion.div variants={childVariants}>{child}</motion.div>
          ))
        : children}
    </motion.div>
  );
}

interface FadeInProps extends Omit<React.ComponentProps<typeof motion.div>, "children"> {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function FadeInWhenVisible({
  children,
  delay = 0,
  className,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps extends Omit<React.ComponentProps<typeof motion.div>, "children"> {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerContainer({
  children,
  className,
  delay = 0,
  ...props
}: StaggerContainerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: delay
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      {...props}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariants}>{child}</motion.div>
      ))}
    </motion.div>
  );
}

interface TitleProps extends Omit<React.ComponentProps<typeof motion.h1>, "children"> {
  children: React.ReactNode;
  className?: string;
}

export function HeroTitle({
  children,
  className,
  ...props
}: TitleProps) {
  return (
    <motion.h1
      className={cn("text-4xl md:text-5xl lg:text-6xl font-bold text-primary", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      {...props}
    >
      {children}
    </motion.h1>
  );
}

interface SubtitleProps extends Omit<React.ComponentProps<typeof motion.p>, "children"> {
  children: React.ReactNode;
  className?: string;
}

export function HeroSubtitle({
  children,
  className,
  ...props
}: SubtitleProps) {
  return (
    <motion.p
      className={cn("text-xl text-muted-foreground", className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3 }}
      {...props}
    >
      {children}
    </motion.p>
  );
}

  interface SectionTitleProps extends Omit<React.ComponentProps<typeof motion.div>, "children"> {
  children: React.ReactNode;
  className?: string;
  subtitle?: React.ReactNode;
  centered?: boolean;
}

export function SectionTitle({
  children,
  className,
  subtitle,
  centered = false,
  ...props
}: SectionTitleProps) {
  return (
    <motion.div
      className={cn(centered && "text-center", "mb-12")}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      {...props}
    >
      <h2 className={cn("text-3xl md:text-4xl font-bold mb-4 text-primary", className)}>
        {children}
      </h2>
      {subtitle && (
        <p className={cn("text-xl text-muted-foreground", centered && "max-w-3xl mx-auto")}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
} 