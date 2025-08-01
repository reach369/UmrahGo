'use client';

import { SetStateAction, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Components
import { Button } from '@/components/ui/button';
import { 
  UserIcon, 
  BuildingOffice2Icon, 
  ShieldCheckIcon, 
  ClockIcon, 
  CreditCardIcon, 
  GlobeAltIcon,
  MapPinIcon,
  CheckIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { CheckCircle, ChevronRight, ArrowRight } from 'lucide-react';

// Services
import { 
  landingService, 
  Feature as FeatureType, 
  Package, 
  Testimonial, 
  HowItWorksStep 
} from '@/services/landing.service';

import Hero from './components/Hero';
import FeaturedPackages from './components/FeaturedPackages';
import FeaturedOffices from './components/FeaturedOffices';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import FAQSection from './components/FAQSection';
import CTASection from './components/CTASection';

export default function HomePage() {
  const params = useParams();
  const locale = params?.locale as string || 'ar';
  const t = useTranslations();
  const isRtl = locale === 'ar';
  
  // States
  const [features, setFeatures] = useState<FeatureType[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [featuredPackages, setFeaturedPackages] = useState<Package[]>([]);
  const [featuredOffices, setFeaturedOffices] = useState<any[]>([]);
  const [steps, setSteps] = useState<HowItWorksStep[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch features with error handling
        let featuresData: SetStateAction<FeatureType[]> = [];
        try {
          featuresData = await landingService.getFeatures();
        } catch (error) {
          console.error('Error fetching features:', error);
        }
        
        // Fetch testimonials with error handling
        let testimonialsData: SetStateAction<Testimonial[]> = [];
        try {
          testimonialsData = await landingService.getTestimonials();
        } catch (error) {
          console.error('Error fetching testimonials:', error);
        }
        
        // Fetch packages with error handling
        let packagesData: SetStateAction<Package[]> = [];
        try {
          packagesData = await landingService.getFeaturedPackages();
        } catch (error) {
          console.error('Error fetching featured packages:', error);
        }
        
        // Fetch steps with error handling
        let stepsData: SetStateAction<HowItWorksStep[]> = [];
        try {
          stepsData = await landingService.getHowItWorksSteps();
        } catch (error) {
          console.error('Error fetching how it works steps:', error);
        }
        
        // Fetch offices with error handling
        let officesData: SetStateAction<any[]> = [];
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1'}/public/offices?is_featured=true&per_page=3`);
          const data = await response.json();
          
          console.log("Direct API response:", data);
          
          if (data && data.data && Array.isArray(data.data.data)) {
            // Process the offices data
            const processedOffices = data.data.data.map((office: any) => ({
              id: office.id.toString(),
              name: office.office_name || 'Unnamed Office',
              description: office.description || '',
              location: office.address || (office.city ? `${office.city}, ${office.country || ''}` : ''),
              rating: office.rating || 0,
              imageUrl: office.logo || '/images/office-placeholder.jpg',
              featured: office.is_featured || false
            }));
            
            console.log("Processed offices:", processedOffices);
            setFeaturedOffices(processedOffices);
          }
        } catch (error) {
          console.error("Error fetching featured offices:", error);
        }
        
        setFeatures(featuresData);
        setTestimonials(testimonialsData);
        setFeaturedPackages(packagesData);
        setSteps(stepsData);
        setFeaturedOffices(officesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching home page data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Backup fetch for offices directly from the API if the service call fails
  useEffect(() => {
    // Only run this effect if offices weren't loaded and we're not still loading
    if (!loading && featuredOffices.length === 0) {
      const fetchOfficesDirectly = async () => {
        console.log("Attempting to fetch offices directly from API as backup...");
        try {
          // Direct API call to the real endpoint
          const response = await fetch('https://www.admin.umrahgo.net/api/v1/public/offices?is_featured=true&per_page=3');
          const data = await response.json();
          
          console.log("Direct API response:", data);
          
          if (data && data.data && Array.isArray(data.data.data)) {
            // Process the offices data
            const processedOffices = data.data.data.map((office: any) => ({
              id: office.id.toString(),
              name: office.office_name || 'Unnamed Office',
              description: office.description || '',
              location: office.address || (office.city ? `${office.city}, ${office.country || ''}` : ''),
              rating: office.rating || 0,
              imageUrl: office.logo || '/images/office-placeholder.jpg',
              featured: office.is_featured || false
            }));
            
            console.log("Processed offices:", processedOffices);
            setFeaturedOffices(processedOffices);
          }
        } catch (error) {
          console.error("Backup direct API call for offices also failed:", error);
        }
      };
      
      fetchOfficesDirectly();
    }
  }, [loading, featuredOffices]);
  
  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };
  
  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const featureItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  // Icon components mapping
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'user':
        return <UserIcon className="h-6 w-6 text-primary" />;
      case 'building':
        return <BuildingOffice2Icon className="h-6 w-6 text-primary" />;
      case 'shield':
        return <ShieldCheckIcon className="h-6 w-6 text-primary" />;
      case 'clock':
        return <ClockIcon className="h-6 w-6 text-primary" />;
      case 'card':
        return <CreditCardIcon className="h-6 w-6 text-primary" />;
      case 'globe':
        return <GlobeAltIcon className="h-6 w-6 text-primary" />;
      default:
        return <CheckCircle className="h-6 w-6 text-primary" />;
    }
  };
  
  return (
    <div className="min-h-screen">
      <Hero />
      <FeaturedPackages />
      <FeaturedOffices />
      <HowItWorks />
      <Testimonials />
      <FAQSection />
      <CTASection />
    </div>
  );
} 