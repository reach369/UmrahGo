'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { 
  Plus,
  Search,
  Filter,
  Star,
  MapPin,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Image as ImageIcon,
  Building2,
  MoreHorizontal,
  RefreshCw
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  useGetHotelsQuery,
  useDeleteHotelMutation,
  useDuplicateHotelMutation,
  Hotel 
} from '../redux/api/hotelsApiSlice';

interface HotelsQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  rating?: number;
  is_active?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export default function HotelsPage() {
  const t = useTranslations();
  const router = useRouter();
  
  // State
  const [filters, setFilters] = useState<HotelsQueryParams>({
    page: 1,
    per_page: 10,
    search: '',
    rating: undefined,
    is_active: undefined,
    sort_by: 'created_at',
    sort_direction: 'desc'
  });
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  // API hooks
  const {
    data: hotelsResponse,
    isLoading,
    error,
    refetch
  } = useGetHotelsQuery(filters);

  const [deleteHotel, { isLoading: isDeleting }] = useDeleteHotelMutation();
  const [duplicateHotel, { isLoading: isDuplicating }] = useDuplicateHotelMutation();

  // Handlers
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleRatingFilter = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      rating: value === 'all' ? undefined : parseInt(value), 
      page: 1 
    }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      is_active: value === 'all' ? undefined : value === 'active', 
      page: 1 
    }));
  };

  const handleSort = (sortBy: string) => {
    setFilters(prev => ({
      ...prev,
      sort_by: sortBy,
      sort_direction: prev.sort_by === sortBy && prev.sort_direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDelete = async (hotel: Hotel) => {
    try {
      await deleteHotel(hotel.id).unwrap();
      toast.success(t('hotels.hotelDeleted'));
    } catch (error: any) {
      toast.error(error?.data?.message || t('common.error'));
    }
  };

  const handleDuplicate = async (hotel: Hotel) => {
    try {
      await duplicateHotel(hotel.id).unwrap();
      toast.success(t('hotels.hotelDuplicated'));
    } catch (error: any) {
      toast.error(error?.data?.message || t('common.error'));
    }
  };

  // Table columns
  const columns: ColumnDef<Hotel>[] = [
    {
      id: 'image',
      header: '',
      cell: ({ row }) => {
        const hotel = row.original;
        const featuredImage = hotel.images?.find(img => img.is_featured) || hotel.images?.[0];
        
        return (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {featuredImage ? (
              <Image
                src={featuredImage.image_url}
                alt={hotel.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6 text-gray-400" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: t('hotels.name'),
      cell: ({ row }) => {
        const hotel = row.original;
        return (
          <div>
            <div className="font-medium">{hotel.name}</div>
            {hotel.address && (
              <div className="text-sm text-gray-500 flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {hotel.address}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'rating',
      header: t('hotels.rating'),
      cell: ({ row }) => {
        const rating = row.getValue('rating') as number;
        if (!rating) return <span className="text-gray-400">-</span>;
        
        return (
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span>{rating}</span>
            <span className="text-gray-400 ml-1">{t('hotels.stars')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'packages',
      header: t('hotels.packages'),
      cell: ({ row }) => {
        const packages = row.original.packages;
        return (
          <Badge variant="outline">
            {packages?.length || 0} {t('hotels.packages')}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: t('hotels.status'),
      cell: ({ row }) => {
        const isActive = row.getValue('is_active') as boolean;
        return (
          <Badge variant={isActive ? 'default' : 'secondary'}>
            {isActive ? t('hotels.active') : t('hotels.inactive')}
          </Badge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const hotel = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/umrahoffices/hotels/${hotel.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  {t('hotels.view')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/umrahoffices/hotels/${hotel.id}/edit`}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  {t('hotels.edit')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDuplicate(hotel)}
                disabled={isDuplicating}
              >
                <Copy className="w-4 h-4 mr-2" />
                {t('hotels.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('hotels.delete')}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('hotels.deleteHotel')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('common.deleteConfirmation')} "{hotel.name}"?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(hotel)}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? t('common.deleting') : t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const hotels = hotelsResponse?.data?.data || [];
  const pagination = hotelsResponse?.data ? {
    current_page: hotelsResponse.data.current_page,
    per_page: hotelsResponse.data.per_page,
    total: hotelsResponse.data.total,
    last_page: hotelsResponse.data.last_page,
  } : undefined;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t('hotels.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('common.manage')} {t('hotels.hotels').toLowerCase()}
          </p>
        </div>
        <Button asChild>
          <Link href="/umrahoffices/hotels/create">
            <Plus className="w-4 h-4 mr-2" />
            {t('hotels.addHotel')}
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder={t('hotels.searchHotels')}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Rating Filter */}
            <Select 
              value={filters.rating?.toString() || 'all'} 
              onValueChange={handleRatingFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('hotels.filterByRating')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="5">5 {t('hotels.stars')}</SelectItem>
                <SelectItem value="4">4+ {t('hotels.stars')}</SelectItem>
                <SelectItem value="3">3+ {t('hotels.stars')}</SelectItem>
                <SelectItem value="2">2+ {t('hotels.stars')}</SelectItem>
                <SelectItem value="1">1+ {t('hotels.stars')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select 
              value={filters.is_active === undefined ? 'all' : filters.is_active ? 'active' : 'inactive'} 
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('hotels.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('hotels.active')}</SelectItem>
                <SelectItem value="inactive">{t('hotels.inactive')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            {(error as any)?.data?.message || t('common.error')}
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              {t('hotels.hotels')} 
              {pagination && (
                <Badge variant="outline" className="ml-2">
                  {pagination.total}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hotels.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('hotels.noHotels')}
                </h3>
                <p className="text-gray-500 mb-4">
                  {t('common.noDataDescription')}
                </p>
                <Button asChild>
                  <Link href="/umrahoffices/hotels/create">
                    <Plus className="w-4 h-4 mr-2" />
                    {t('hotels.addHotel')}
                  </Link>
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={hotels}
                pagination={pagination}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
                onPageSizeChange={(pageSize) => setFilters(prev => ({ ...prev, per_page: pageSize, page: 1 }))}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 