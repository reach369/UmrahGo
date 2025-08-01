'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocale } from 'next-intl';

interface DateRangeFilterProps {
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange | undefined) => void;
  className?: string;
}

export default function DateRangeFilter({
  dateRange,
  onDateRangeChange,
  className = ''
}: DateRangeFilterProps) {
  const t = useTranslations('UmrahOfficesDashboard');
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const formatDateRange = (range: DateRange | undefined): string => {
    if (!range?.from) {
      return t('filter.selectDateRange');
    }
    
    if (range.to) {
      return `${format(range.from, 'MMM dd', { locale: locale === 'ar' ? ar : undefined })} - ${format(range.to, 'MMM dd', { locale: locale === 'ar' ? ar : undefined })}`;
    }
    
    return format(range.from, 'MMM dd', { locale: locale === 'ar' ? ar : undefined });
  };

  const handlePresetRange = (preset: string) => {
    const today = new Date();
    let newRange: DateRange | undefined;

    switch (preset) {
      case 'today':
        newRange = { from: today, to: today };
        break;
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        newRange = { from: yesterday, to: yesterday };
        break;
      }
      case 'thisWeek': {
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        newRange = { from: firstDayOfWeek, to: today };
        break;
      }
      case 'lastWeek': {
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
        const lastWeekEnd = new Date(today);
        lastWeekEnd.setDate(today.getDate() - today.getDay() - 1);
        newRange = { from: lastWeekStart, to: lastWeekEnd };
        break;
      }
      case 'thisMonth': {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        newRange = { from: firstDayOfMonth, to: today };
        break;
      }
      case 'lastMonth': {
        const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        newRange = { from: firstDayOfLastMonth, to: lastDayOfLastMonth };
        break;
      }
      case 'thisYear': {
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        newRange = { from: firstDayOfYear, to: today };
        break;
      }
      case 'lastYear': {
        const firstDayOfLastYear = new Date(today.getFullYear() - 1, 0, 1);
        const lastDayOfLastYear = new Date(today.getFullYear() - 1, 11, 31);
        newRange = { from: firstDayOfLastYear, to: lastDayOfLastYear };
        break;
      }
      default:
        newRange = undefined;
    }

    onDateRangeChange?.(newRange);
    setIsOpen(false);
  };

  const handleReset = () => {
    onDateRangeChange?.(undefined);
    setIsOpen(false);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[280px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange(dateRange)}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {/* Quick Presets */}
            <div className="border-r p-3 min-w-[200px]">
              <h4 className="font-medium text-sm mb-3">اختيارات سريعة</h4>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handlePresetRange('today')}
                >
                  {t('filter.today')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handlePresetRange('yesterday')}
                >
                  {t('filter.yesterday')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handlePresetRange('thisWeek')}
                >
                  {t('filter.thisWeek')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handlePresetRange('lastWeek')}
                >
                  {t('filter.lastWeek')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handlePresetRange('thisMonth')}
                >
                  {t('filter.thisMonth')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handlePresetRange('lastMonth')}
                >
                  {t('filter.lastMonth')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handlePresetRange('thisYear')}
                >
                  {t('filter.thisYear')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handlePresetRange('lastYear')}
                >
                  {t('filter.lastYear')}
                </Button>
              </div>
              
              <div className="mt-3 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={handleReset}
                >
                  {t('filter.reset')}
                </Button>
              </div>
            </div>
            
            {/* Calendar */}
            <div className="p-3">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
                locale={locale === 'ar' ? ar : undefined}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {dateRange?.from && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="text-sm"
        >
          مسح
        </Button>
      )}
    </div>
  );
} 