'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft,
  Edit2,
  Trash2,
  Copy,
  Star,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Hotel,
  Package as PackageIcon,
  CheckCircle,
  XCircle,
  Eye,
  MoreHorizontal,
  Activity,
  TrendingUp,
  BarChart3
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
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { 
  useGetPackageQuery,
  useDeletePackageMutation,
  useDuplicatePackageMutation,
  useChangePackageStatusMutation,
  Package 
} from '../../../redux/api/packagesApiSlice';
import { getValidImageUrl } from '@/utils/image-helpers';
export default function PackageDetailsPage() {
  const t = useTranslations();
  const router = useRouter();
  const params = useParams();
  const packageId = parseInt(params?.id as string || '0');

  // API hooks
  const {
    data: packageResponse,
    isLoading,
    error,
    refetch
  } = useGetPackageQuery(packageId);

  const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation();
  const [duplicatePackage, { isLoading: isDuplicating }] = useDuplicatePackageMutation();
  const [changeStatus, { isLoading: isChangingStatus }] = useChangePackageStatusMutation();

  const package_ = packageResponse?.data;

  // Handlers
  const handleDelete = async () => {
    if (!package_) return;
    
    try {
      await deletePackage(package_.id).unwrap();
      toast.success(t('packages.packageDeleted'));
      router.push('/umrahoffices/dashboard/packages');
    } catch (error: any) {
      toast.error(error?.data?.message || t('common.error'));
    }
  };

  const handleDuplicate = async () => {
    if (!package_) return;
    
    try {
      await duplicatePackage(package_.id).unwrap();
      toast.success(t('packages.packageDuplicated'));
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || t('common.error'));
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!package_) return;
    
    try {
      await changeStatus({
        id: package_.id,
        data: { status: newStatus as any }
      }).unwrap();
      toast.success(t('packages.statusUpdated'));
      refetch();
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
            <div className="space-y-2">
              <div className="w-64 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-full h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !package_) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center py-12">
          <PackageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('packages.packageNotFound')}
          </h3>
          <p className="text-gray-500 mb-4">
            {(error as any)?.data?.message || t('common.error')}
          </p>
          <Button asChild>
            <Link href="/umrahoffices/dashboard/packages">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/umrahoffices/dashboard/packages">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('common.back')}
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-bold">{package_.name}</h1>
              {package_.is_featured && (
                <Star className="w-6 h-6 text-yellow-500 fill-current" />
              )}
              <Badge variant={getStatusVariant(package_.status)}>
                {t(`packages.status.${package_.status}`)}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">
              {t('packages.packageDetails')}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/umrahoffices/dashboard/packages/${package_.id}/edit`}>
              <Edit2 className="w-4 h-4 mr-2" />
              {t('packages.edit')}
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={handleDuplicate}
                disabled={isDuplicating}
              >
                <Copy className="w-4 h-4 mr-2" />
                {t('packages.duplicate')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleStatusChange(
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
                      onClick={handleDelete}
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
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('packages.price')}</p>
                <p className="text-2xl font-bold">{formatPrice(package_.price)}</p>
                {package_.discount_price && (
                  <p className="text-sm text-green-600">{formatPrice(package_.discount_price)}</p>
                )}
              </div>
              <DollarSign className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('packages.duration')}</p>
                <p className="text-2xl font-bold">{package_.duration || 0}</p>
                <p className="text-sm text-gray-600">{t('packages.days')}</p>
              </div>
              <Calendar className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('packages.capacity')}</p>
                <p className="text-2xl font-bold">
                  {package_.confirmed_persons_count || 0}/{package_.max_people || 0}
                </p>
                <p className="text-sm text-gray-600">
                  {package_.available_seats_count || 0} {t('packages.available')}
                </p>
              </div>
              <Users className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('packages.totalRevenue')}</p>
                <p className="text-2xl font-bold">{formatPrice(package_.total_revenue)}</p>
                <p className="text-sm text-gray-600">
                  {package_.total_bookings_count || 0} {t('packages.bookings')}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">{t('packages.packageDetails')}</TabsTrigger>
          <TabsTrigger value="images">{t('packages.images')}</TabsTrigger>
          <TabsTrigger value="hotels">{t('packages.hotels')}</TabsTrigger>
          <TabsTrigger value="stats">{t('packages.bookingStats')}</TabsTrigger>
        </TabsList>

        {/* Package Details */}
        <TabsContent value="details">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>{t('packages.basicInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">{t('packages.name')}</Label>
                  <p className="mt-1">{package_.name}</p>
                  {package_.name_ar && (
                    <>
                      <Label className="text-sm font-medium text-gray-600 mt-2">{t('packages.arabicName')}</Label>
                      <p className="mt-1">{package_.name_ar}</p>
                    </>
                  )}
                </div>

                {package_.description && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('packages.description')}</Label>
                    <p className="mt-1 text-gray-700">{package_.description}</p>
                    {package_.description_ar && (
                      <>
                        <Label className="text-sm font-medium text-gray-600 mt-2">{t('packages.arabicDescription')}</Label>
                        <p className="mt-1 text-gray-700">{package_.description_ar}</p>
                      </>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('packages.duration')}</Label>
                    <p className="mt-1">{package_.duration || '-'} {package_.duration ? t('packages.days') : ''}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('packages.maxPeople')}</Label>
                    <p className="mt-1">{package_.max_people || '-'}</p>
                  </div>
                </div>

                {(package_.starting_date || package_.ending_date) && (
                  <div className="grid grid-cols-2 gap-4">
                    {package_.starting_date && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">{t('packages.startDate')}</Label>
                        <p className="mt-1">{new Date(package_.starting_date).toLocaleDateString('ar-SA')}</p>
                      </div>
                    )}
                    {package_.ending_date && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">{t('packages.endDate')}</Label>
                        <p className="mt-1">{new Date(package_.ending_date).toLocaleDateString('ar-SA')}</p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium text-gray-600">{t('common.createdAt')}</Label>
                  <p className="mt-1">
                    {formatDistanceToNow(new Date(package_.created_at), { 
                      addSuffix: true, 
                      locale: ar 
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Location Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {t('packages.locationInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {package_.destination && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('packages.destination')}</Label>
                    <p className="mt-1">{package_.destination}</p>
                    {package_.destination_ar && (
                      <>
                        <Label className="text-sm font-medium text-gray-600 mt-2">{t('packages.arabicDestination')}</Label>
                        <p className="mt-1">{package_.destination_ar}</p>
                      </>
                    )}
                  </div>
                )}

                {package_.meeting_location && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">{t('packages.meetingLocation')}</Label>
                    <p className="mt-1">{package_.meeting_location}</p>
                    {package_.meeting_location_ar && (
                      <>
                        <Label className="text-sm font-medium text-gray-600 mt-2">{t('packages.arabicMeetingLocation')}</Label>
                        <p className="mt-1">{package_.meeting_location_ar}</p>
                      </>
                    )}
                  </div>
                )}

                {(package_.start_location || package_.end_location) && (
                  <div className="grid grid-cols-1 gap-4">
                    {package_.start_location && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">{t('packages.startLocation')}</Label>
                        <p className="mt-1">{package_.start_location}</p>
                      </div>
                    )}
                    {package_.end_location && (
                      <div>
                        <Label className="text-sm font-medium text-gray-600">{t('packages.endLocation')}</Label>
                        <p className="mt-1">{package_.end_location}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Map placeholder - if we have coordinates */}
                {package_.destination_location && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-600">{t('packages.viewOnMap')}</Label>
                    <div className="mt-2 w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Included Services */}
            <Card>
              <CardHeader>
                <CardTitle>{t('packages.includesInfo')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    {package_.includes_accommodation ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">{t('packages.includes.accommodation')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {package_.includes_transport ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">{t('packages.includes.transport')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {package_.includes_meals ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">{t('packages.includes.meals')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {package_.includes_guide ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">{t('packages.includes.guide')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {package_.includes_insurance ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">{t('packages.includes.insurance')}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {package_.includes_activities ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-sm">{t('packages.includes.activities')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            {(package_.features && package_.features.length > 0 || package_.features_ar && package_.features_ar.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('packages.features')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {package_.features && package_.features.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t('packages.features')}</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {package_.features.map((feature, index) => (
                          <Badge key={index} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {package_.features_ar && package_.features_ar.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">{t('packages.arabicFeatures')}</Label>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {package_.features_ar.map((feature, index) => (
                          <Badge key={index} variant="outline">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Images */}
        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                {t('packages.images')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {package_.images && package_.images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {package_.images.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <Image
                        src={image.image_url}
                        alt={image.title || `${package_.name} - Image ${index + 1}`}
                        width={200}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {image.is_featured && (
                        <div className="absolute top-2 left-2">
                          <Badge variant="default" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            {t('packages.featured')}
                          </Badge>
                        </div>
                      )}
                      {image.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 rounded-b-lg">
                          <p className="text-xs truncate">{image.title}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('packages.noImages')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hotels */}
        <TabsContent value="hotels">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Hotel className="w-5 h-5 mr-2" />
                {t('packages.attachedHotels')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {package_.hotels && package_.hotels.length > 0 ? (
                <div className="space-y-4">
                  {package_.hotels.map((hotel) => (
                    <Card key={hotel.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {hotel.images && hotel.images.length > 0 ? (
                              <Image
                                src={hotel.images[0].image_url}
                                alt={hotel.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Hotel className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{hotel.name}</h3>
                            {hotel.rating && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Star className="w-3 h-3 text-yellow-500 mr-1" />
                                {hotel.rating}
                              </div>
                            )}
                            {hotel.address && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="w-3 h-3 mr-1" />
                                {hotel.address}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {hotel.pivot?.nights && (
                            <div className="text-sm">
                              <span className="font-medium">{hotel.pivot.nights}</span> {t('packages.nights')}
                            </div>
                          )}
                          {hotel.pivot?.room_type && (
                            <div className="text-sm text-gray-500">
                              {hotel.pivot.room_type}
                            </div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Hotel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">{t('packages.noHotels')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Statistics */}
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Booking Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  {t('packages.bookingStats')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('packages.confirmedBookings')}</span>
                  <span className="font-medium">{package_.confirmed_bookings_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('packages.pendingBookings')}</span>
                  <span className="font-medium">{package_.pending_bookings_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('packages.canceledBookings')}</span>
                  <span className="font-medium">{package_.canceled_bookings_count || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('packages.totalBookings')}</span>
                  <span className="font-bold">{package_.total_bookings_count || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Capacity Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {t('packages.capacity')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('packages.maxPeople')}</span>
                  <span className="font-medium">{package_.max_people || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('packages.confirmedPersons')}</span>
                  <span className="font-medium">{package_.confirmed_persons_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('packages.availableSeats')}</span>
                  <span className="font-medium">{package_.available_seats_count || 0}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{t('packages.fullyBooked')}</span>
                  <Badge variant={package_.is_fully_booked ? 'destructive' : 'default'}>
                    {package_.is_fully_booked ? t('common.yes') : t('common.no')}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="w-5 h-5 mr-2" />
                  {t('packages.revenue')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('packages.totalRevenue')}</span>
                  <span className="font-medium">{formatPrice(package_.total_revenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('packages.averageBookingValue')}</span>
                  <span className="font-medium">
                    {package_.total_bookings_count && package_.total_bookings_count > 0 
                      ? formatPrice((package_.total_revenue || 0) / package_.total_bookings_count)
                      : formatPrice(0)
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 