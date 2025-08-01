"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Link } from "@/i18n/navigation";
import { Package } from '@/types/package';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Heart,
  Star,
  Building2,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from "next-intl";

interface PackageCardProps {
  pkg: Package;
  isPilgrimDashboard?: boolean;
  className?: string;
}

export default function PackageCard({ pkg, isPilgrimDashboard = false, className }: PackageCardProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFavorite(!isFavorite);
  };

  return (
    <motion.div
      className={cn(
        "bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-border/50",
        className
      )}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      {/* Package Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={pkg.featured_image_url || '/images/package-placeholder.jpg'}
          alt={pkg.name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
        
        {/* Favorite Button */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover: transition-colors"
        >
          <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
        </button>

        {/* Featured Badge */}
        {pkg.is_featured && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
            {t('packages.featured') || 'مميز'}
          </Badge>
        )}
      </div>

      {/* Package Content */}
      <div className="p-4 space-y-3">
        {/* Package Name */}
        <h3 className="font-semibold text-lg leading-tight line-clamp-2">
          {pkg.name}
        </h3>

        {/* Office Info */}
        <div className="flex items-center text-sm text-muted-foreground">
          <Building2 className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{pkg.office?.office_name || 'مكتب غير معروف'}</span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {pkg.discount_price ? (
              <>
                <span className="text-lg font-bold text-primary">
                  {pkg.discount_price} ر.س
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  {pkg.price} ر.س
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                {pkg.price} ر.س
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {pkg.duration_days} {t('packages.days') || 'أيام'}
          </div>
        </div>

        {/* Features */}
        {pkg.features && Object.keys(pkg.features).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(pkg.features).slice(0, 3).map(([key, value]) => (
              value && (
                <Badge key={key} variant="secondary" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  {key}
                </Badge>
              )
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <Link href={`/${isPilgrimDashboard ? 'PilgrimUser/packages/' : 'packages/'}${pkg.id}`}>
            <Button className="w-full">
              {t('packages.viewDetails') || 'عرض التفاصيل'}
            </Button>
          </Link>
          
          {isPilgrimDashboard && (
            <Link href={`/PilgrimUser/booking/new?package=${pkg.id}`}>
              <Button variant="outline" className="w-full">
                {t('packages.bookNow') || 'احجز الآن'}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
} 