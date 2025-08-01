'use client';

import React, { useState } from 'react';
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
  Package as PackageIcon,
  Eye,
  Edit2,
  Trash2,
  Copy,
  MoreHorizontal,
  RefreshCw,
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Hotel,
  Activity
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
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { 
  useGetPackagesQuery,
  useDeletePackageMutation,
  useDuplicatePackageMutation,
  useChangePackageStatusMutation,
  Package 
} from '../../redux/api/packagesApiSlice';
import { getValidImageUrl } from '@/utils/image-helpers';

interface PackagesQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
}

export default function PackagesPage() {
  const t = useTranslations();
  const router = useRouter();
  const { locale } = useParams() as { locale: string };
  // State
  const [filters, setFilters] = useState<PackagesQueryParams>({
    page: 1,
    per_page: 10,
    search: '',
    status: '',
    sort_by: 'created_at',
    sort_direction: 'desc'
  });
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  // API hooks
  const {
    data: packagesResponse,
    isLoading,
    error,
    refetch
  } = useGetPackagesQuery(filters);

  const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation();
  const [duplicatePackage, { isLoading: isDuplicating }] = useDuplicatePackageMutation();
  const [changeStatus, { isLoading: isChangingStatus }] = useChangePackageStatusMutation();

  // Handlers
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (value: string) => {
    setFilters(prev => ({ 
      ...prev, 
      status: value === 'all' ? '' : value, 
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

  const handleDelete = async (package_: Package) => {
    try {
      await deletePackage(package_.id).unwrap();
      toast.success(t('packages.packageDeleted'));
    } catch (error: any) {
      toast.error(error?.data?.message || t('common.error'));
    }
  };

  const handleDuplicate = async (package_: Package) => {
    try {
      await duplicatePackage(package_.id).unwrap();
      toast.success(t('packages.packageDuplicated'));
    } catch (error: any) {
      toast.error(error?.data?.message || t('common.error'));
    }
  };

  const handleStatusChange = async (package_: Package, newStatus: string) => {
    try {
      await changeStatus({
        id: package_.id,
        data: { status: newStatus as any }
      }).unwrap();
      toast.success(t('packages.statusUpdated'));
    } catch (error: any) {
      toast.error(error?.data?.message || t('common.error'));
    }
  };

  // Format price
  const formatPrice = (price?: number) => {
    if (!price) return '-';
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(price);
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  // Table columns
  const columns: ColumnDef<Package>[] = [
    {
      id: 'image',
      header: '',
      cell: ({ row }) => {  
        const package_ = row.original;
        const featuredImage = package_.images?.find(img => img.is_featured) || package_.images?.[0];
        
        return (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            {featuredImage ? (
              <Image
                src={getValidImageUrl(featuredImage.image_url)}
                alt={package_.name}
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            ) : (
              <PackageIcon className="w-6 h-6 text-gray-400" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'name',
      header: t('packages.name'),
      cell: ({ row }) => {
        const package_ = row.original;
        return (
          <div>
            <div className="font-medium flex items-center">
              {package_.name}
              {package_.is_featured && (
                <Star className="w-4 h-4 text-yellow-500 fill-current ml-2" />
              )}
            </div>
            {package_.destination && (
              <div className="text-sm text-gray-500 flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {package_.destination}
              </div>
            )}
            {package_.description && (
              <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                {package_.description}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'price',
      header: t('packages.price'),
      cell: ({ row }) => {
        const package_ = row.original;
        return (
          <div>
            <div className="font-medium">{formatPrice(package_.price)}</div>
            {package_.discount_price && (
              <div className="text-sm text-green-600">
                {formatPrice(package_.discount_price)}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'duration',
      header: t('packages.duration'),
      cell: ({ row }) => {
        const duration = row.getValue('duration') as number;
        if (!duration) return <span className="text-gray-400">-</span>;
        
        return (
          <div className="flex items-center">
            <Calendar className="w-4 h-4 text-gray-400 mr-1" />
            <span>{duration} {t('packages.days')}</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'max_people',
      header: t('packages.capacity'),
      cell: ({ row }) => {
        const package_ = row.original;
        const maxPeople = package_.max_people;
        const confirmed = package_.confirmed_persons_count || 0;
        const available = package_.available_seats_count || 0;
        
        if (!maxPeople) return <span className="text-gray-400">-</span>;
        
        return (
          <div>
            <div className="flex items-center">
              <Users className="w-4 h-4 text-gray-400 mr-1" />
              <span>{confirmed}/{maxPeople}</span>
            </div>
            <div className="text-sm text-gray-500">
              {available} {t('packages.available')}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'hotels',
      header: t('packages.hotels'),
      cell: ({ row }) => {
        const hotels = row.original.hotels;
        return (
          <div className="flex items-center">
            <Hotel className="w-4 h-4 text-gray-400 mr-1" />
            <Badge variant="outline">
              {hotels?.length || 0} {t('packages.hotels')}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: t('packages.status'),
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <Badge variant={getStatusVariant(status)}>
            {t(`packages.status.${status}`)}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: t('packages.createdAt'),
      cell: ({ row }) => {
        const createdAt = row.getValue('created_at') as string;
        return (
          <div className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(createdAt), { 
              addSuffix: true, 
              locale: ar 
            })}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const package_ = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/umrahoffices/dashboard/packages/${package_.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  {t('packages.view')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/umrahoffices/dashboard/packages/${package_.id}/edit`}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  {t('packages.edit')}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDuplicate(package_)}
                disabled={isDuplicating}
              >
                <Copy className="w-4 h-4 mr-2" />
                {t('packages.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange(
                  package_, 
                  package_.status === 'active' ? 'inactive' : 'active'
                )}
                disabled={isChangingStatus}
              >
                <Activity className="w-4 h-4 mr-2" />
                {package_.status === 'active' ? t('packages.deactivate') : t('packages.activate')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem 
                    onSelect={(e) => e.preventDefault()}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('packages.delete')}
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('packages.deletePackage')}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t('common.deleteConfirmation')} "{package_.name}"?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDelete(package_)}
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

  const packages = packagesResponse?.data?.data || [];
  const pagination = packagesResponse?.data ? {
    current_page: packagesResponse.data.current_page,
    per_page: packagesResponse.data.per_page,
    total: packagesResponse.data.total,
    last_page: packagesResponse.data.last_page,
  } : undefined;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header - تحسين التصميم */}
      <div className="flex items-center justify-between mb-8 bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('packages.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('common.manage')} {t('packages.packages').toLowerCase()}
          </p>
        </div>
        <Button asChild size="lg" className="bg-primary text-white hover:bg-primary/90 shadow-md transition-all">
          <Link href={`/${locale}/umrahoffices/dashboard/packages/create`}>
            <Plus className="w-5 h-5 mr-2" />
            {t('packages.addPackage')}
          </Link>
        </Button>
      </div>

      {/* Filters - تحسين التصميم */}
      <Card className="mb-6 shadow-sm border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <Input
                placeholder={t('packages.searchPackages')}
                value={filters.search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10  border-gray-200 focus:border-primary focus:bg-white transition-colors"
              />
            </div>

            {/* Status Filter */}
            <Select 
              value={filters.status || 'all'} 
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger className=" border-gray-200 focus:border-primary">
                <SelectValue placeholder={t('packages.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all')}</SelectItem>
                <SelectItem value="active">{t('packages.status.active')}</SelectItem>
                <SelectItem value="inactive">{t('packages.status.inactive')}</SelectItem>
                <SelectItem value="draft">{t('packages.status.draft')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select 
              value={filters.sort_by} 
              onValueChange={(value) => handleSort(value)}
            >
              <SelectTrigger className=" border-gray-200 focus:border-primary">
                <SelectValue placeholder={t('packages.sortBy')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">{t('packages.sortByCreated')}</SelectItem>
                <SelectItem value="name">{t('packages.sortByName')}</SelectItem>
                <SelectItem value="price">{t('packages.sortByPrice')}</SelectItem>
                <SelectItem value="duration">{t('packages.sortByDuration')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Actions */}
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => refetch()}
                disabled={isLoading}
                className="border-gray-200 hover:"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-primary' : ''}`} />
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
        <Card className="shadow-sm border-0">
          <CardHeader className=" border-b">
            <CardTitle className="flex items-center text-lg">
              <PackageIcon className="w-5 h-5 mr-2 text-primary" />
              {t('packages.packages')} 
              {pagination && (
                <Badge variant="secondary" className="ml-3 bg-gray-200 text-gray-700 rounded-full">
                  {pagination.total}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
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
            ) : packages.length === 0 ? (
              <div className="text-center py-16">
                <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('packages.noPackages')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {t('common.noDataDescription')}
                </p>
                <Button asChild className="bg-primary hover:bg-primary/90">
                  <Link href={`/${locale}/umrahoffices/dashboard/packages/create`}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('packages.addPackage')}
                  </Link>
                </Button>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={packages}
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