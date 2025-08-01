'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardWithHoverProps extends Omit<React.ComponentProps<typeof motion.div>, "children" | "whileHover"> {
  children: React.ReactNode;
  hoverScale?: number;
  className?: string;
  delay?: number;
}

export function CardWithHover({
  children,
  hoverScale = 1.03,
  className,
  delay = 0,
  ...props
}: CardWithHoverProps) {
  return (
    <motion.div
      className={cn(
        "bg-card rounded-xl p-6 border border-primary/10 shadow-md transition-all duration-300",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ 
        scale: hoverScale, 
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        borderColor: "rgba(14, 102, 82, 0.3)"
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  className?: string;
  iconClassName?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
  className,
  iconClassName,
}: FeatureCardProps) {
  return (
    <CardWithHover className={className} delay={delay}>
      <div className={cn("w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mb-6", iconClassName)}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 text-primary/90">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardWithHover>
  );
}

interface PackageCardProps {
  image: string;
  title: string;
  price: string;
  duration: string;
  location: string;
  rating: number;
  delay?: number;
}

export function PackageCard({
  image,
  title,
  price,
  duration,
  location,
  rating,
  delay = 0,
}: PackageCardProps) {
  return (
    <CardWithHover className="overflow-hidden" delay={delay}>
      <div className="relative h-48 -mx-6 -mt-6 mb-6 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${image})` }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex justify-between items-center">
            <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">{price}</span>
            <div className="flex items-center bg-white/90 px-2 py-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium ml-1">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{location}</span>
        </div>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{duration}</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-primary/10">
        <button className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white py-2 rounded-lg transition-all duration-300 hover:shadow-md">
          عرض التفاصيل
        </button>
      </div>
    </CardWithHover>
  );
}

export function TestimonialCard({
  name,
  text,
  rating,
  location,
  delay = 0,
}: {
  name: string;
  text: string;
  rating: number;
  location: string;
  delay?: number;
}) {
  return (
    <CardWithHover delay={delay}>
      <div className="flex items-center space-x-1 rtl:space-x-reverse mb-4">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="mb-6 text-muted-foreground italic">"{text}"</p>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4 rtl:ml-4 rtl:mr-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold">{name}</h4>
          <div className="flex items-center text-sm text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {location}
          </div>
        </div>
      </div>
    </CardWithHover>
  );
} 