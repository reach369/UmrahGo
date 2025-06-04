'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGetPackageQuery, useUpdatePackageStatusMutation, useUpdatePackageFeaturedMutation, useDuplicatePackageMutation, useDeletePackageMutation } from '../../../redux/api/packagesApiSlice';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Edit, 
  Users, 
  Map, 
  CheckCircle, 
  Star, 
  ArrowLeft, 
  Loader2, 
  Heart, 
  Hotel, 
  Utensils, 
  Car, 
  UserCheck, 
  Shield, 
  Ticket,
  Copy,
  Trash2,
  Calendar as CalendarIcon
} from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ar } from 'date-fns/locale';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export default function PackageDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const packageId = Number(params?.id);
  
  // State for status change dialog
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'draft'>('active');
  const [statusReason, setStatusReason] = useState('');
  
  // State for featured status change
  const [showFeaturedDialog, setShowFeaturedDialog] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [featuredUntil, setFeaturedUntil] = useState<Date | undefined>(undefined);
  
  // State for duplicate dialog
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [nameSuffix, setNameSuffix] = useState('- Copy');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [bookingDeadline, setBookingDeadline] = useState<Date | undefined>(undefined);
  const [duplicateStatus, setDuplicateStatus] = useState<'active' | 'inactive' | 'draft'>('draft');
  
  // State for delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Fetch package details
  const { 
    data: packageData, 
    isLoading, 
    isError, 
    error 
  } = useGetPackageQuery(packageId);
  
  const [updatePackageStatus] = useUpdatePackageStatusMutation();
  const [updatePackageFeatured] = useUpdatePackageFeaturedMutation();
  const [duplicatePackage] = useDuplicatePackageMutation();
  const [deletePackage] = useDeletePackageMutation();
  
  // Set active image
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Navigate back to packages list
  const handleBack = () => {
    router.push('../');
  };
  
  // Navigate to edit page
  const handleEdit = () => {
    router.push(`edit`);
  };
  
  // Handle status change
  const handleStatusChange = async () => {
    try {
      await updatePackageStatus({
        id: packageId,
        data: {
          status: newStatus,
          reason: statusReason
        }
      }).unwrap();
      
      toast({
        title: "تم تغيير الحالة بنجاح",
        description: "تم تحديث حالة الباقة بنجاح",
      });
      
      setShowStatusDialog(false);
    } catch (error) {
      console.error('Error updating package status:', error);
      toast({
        title: "خطأ في تغيير الحالة",
        description: error.data?.message || "حدث خطأ أثناء تغيير حالة الباقة",
        variant: "destructive",
      });
    }
  };
  
  // Handle featured status change
  const handleFeaturedChange = async () => {
    try {
      await updatePackageFeatured({
        id: packageId,
        data: {
          is_featured: isFeatured,
          featured_until: featuredUntil ? format(featuredUntil, 'yyyy-MM-dd') : undefined
        }
      }).unwrap();
      
      toast({
        title: "تم تغيير حالة التمييز بنجاح",
        description: "تم تحديث حالة التمييز للباقة بنجاح",
      });
      
      setShowFeaturedDialog(false);
    } catch (error) {
      console.error('Error updating package featured status:', error);
      toast({
        title: "خطأ في تغيير حالة التمييز",
        description: error.data?.message || "حدث خطأ أثناء تغيير حالة التمييز",
        variant: "destructive",
      });
    }
  };
  
  // Handle package duplication
  const handleDuplicate = async () => {
    try {
      const result = await duplicatePackage({
        id: packageId,
        data: {
          name_suffix: nameSuffix,
          start_date: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
          end_date: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
          booking_deadline: bookingDeadline ? format(bookingDeadline, 'yyyy-MM-dd') : undefined,
          status: duplicateStatus
        }
      }).unwrap();
      
      toast({
        title: "تم نسخ الباقة بنجاح",
        description: "تم إنشاء نسخة جديدة من الباقة بنجاح",
      });
      
      // Redirect to the new package
      router.push(`/umrah-offices/dashboard/packages/${result.data.id}`);
    } catch (error) {
      console.error('Error duplicating package:', error);
      toast({
        title: "خطأ في نسخ الباقة",
        description: error.data?.message || "حدث خطأ أثناء نسخ الباقة",
        variant: "destructive",
      });
    }
  };
  
  // Handle package deletion
  const handleDelete = async () => {
    try {
      await deletePackage(packageId).unwrap();
      
      toast({
        title: "تم حذف الباقة بنجاح",
        description: "تم حذف الباقة بنجاح",
      });
      
      // Redirect to packages list
      router.push('../');
    } catch (error) {
      console.error('Error deleting package:', error);
      toast({
        title: "خطأ في حذف الباقة",
        description: error.data?.message || "لا يمكن حذف الباقة لوجود حجوزات قائمة",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">جاري تحميل بيانات الباقة...</p>
      </div>
    );
  }
  
  if (isError || !packageData?.data) {
    return (
      <div className="container mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-red-600">خطأ في جلب البيانات</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-muted-foreground">
              {error instanceof Error ? error.message : 'فشل في جلب بيانات الباقة'}
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={handleBack} variant="outline">
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للقائمة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Get the package data
  const pkg = packageData.data;
  
  // Get Arabic translation if available, otherwise use the default name
  const arTranslation = pkg.translations.find(t => t.locale === 'ar');
  const displayName = arTranslation?.name || pkg.name;
  const displayDescription = arTranslation?.description || pkg.description;
  
  // Get features (from Arabic translation if available)
  const features = arTranslation?.features || 
    Object.keys(pkg.features).reduce((acc, key) => {
      if (pkg.features[key]) {
        acc[key] = key.replace(/_/g, ' ');
      }
      return acc;
    }, {} as Record<string, string>);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <Button 
          onClick={handleBack} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          العودة للقائمة
        </Button>
        <div className="flex gap-2">
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                حذف الباقة
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد من حذف الباقة؟</AlertDialogTitle>
                <AlertDialogDescription>
                  لا يمكن التراجع عن هذا الإجراء. سيتم حذف الباقة نهائياً من النظام.
                  {pkg.has_bookings && (
                    <p className="text-red-500 mt-2">
                      لا يمكن حذف الباقة لوجود حجوزات قائمة.
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={pkg.has_bookings}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Dialog open={showDuplicateDialog} onOpenChange={setShowDuplicateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                نسخ الباقة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>نسخ الباقة</DialogTitle>
                <DialogDescription>
                  قم بتخصيص إعدادات الباقة الجديدة
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>لاحقة الاسم</Label>
                  <Input
                    value={nameSuffix}
                    onChange={(e) => setNameSuffix(e.target.value)}
                    placeholder="مثال: - Copy"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>تاريخ البداية</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? (
                          format(startDate, "PPP", { locale: ar })
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>تاريخ النهاية</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? (
                          format(endDate, "PPP", { locale: ar })
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>آخر موعد للحجز</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {bookingDeadline ? (
                          format(bookingDeadline, "PPP", { locale: ar })
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={bookingDeadline}
                        onSelect={setBookingDeadline}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label>الحالة</Label>
                  <Select
                    value={duplicateStatus}
                    onValueChange={(value: 'active' | 'inactive' | 'draft') => setDuplicateStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDuplicateDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleDuplicate}>
                  نسخ الباقة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showFeaturedDialog} onOpenChange={setShowFeaturedDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {pkg.is_featured ? 'إلغاء التمييز' : 'تعيين كمميز'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تغيير حالة التمييز</DialogTitle>
                <DialogDescription>
                  اختر ما إذا كنت تريد تعيين الباقة كمميزة أو إلغاء التمييز
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isFeatured">تعيين كمميز</Label>
                </div>
                
                {isFeatured && (
                  <div className="space-y-2">
                    <Label>تاريخ انتهاء التمييز (اختياري)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {featuredUntil ? (
                            format(featuredUntil, "PPP", { locale: ar })
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={featuredUntil}
                          onSelect={setFeaturedUntil}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowFeaturedDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleFeaturedChange}>
                  تأكيد التغيير
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                تغيير الحالة
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>تغيير حالة الباقة</DialogTitle>
                <DialogDescription>
                  اختر الحالة الجديدة للباقة وأضف سبب التغيير (اختياري)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>الحالة الجديدة</Label>
                  <Select
                    value={newStatus}
                    onValueChange={(value: 'active' | 'inactive' | 'draft') => setNewStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">نشط</SelectItem>
                      <SelectItem value="inactive">غير نشط</SelectItem>
                      <SelectItem value="draft">مسودة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>سبب التغيير (اختياري)</Label>
                  <Textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value)}
                    placeholder="أدخل سبب تغيير الحالة..."
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleStatusChange}>
                  تأكيد التغيير
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={handleEdit} 
            variant="secondary" 
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            تعديل الباقة
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl font-bold">{displayName}</CardTitle>
                  <CardDescription>
                    رمز الباقة: #{pkg.id}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge className={
                    pkg.status === 'active' ? 'bg-green-500' : 
                    pkg.status === 'inactive' ? 'bg-orange-500' : 'bg-gray-500'
                  }>
                    {pkg.status === 'active' ? 'نشط' : 
                     pkg.status === 'inactive' ? 'غير نشط' : 'مسودة'}
                  </Badge>
                  {pkg.is_featured && (
                    <Badge className="bg-yellow-500 flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      مميز
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-video rounded-md overflow-hidden mb-4">
                {pkg.images.length > 0 ? (
                  <Image
                    src={pkg.images[activeImageIndex].url}
                    alt={displayName}
                    width={1000}
                    height={600}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="bg-muted w-full h-full flex items-center justify-center">
                    <Heart className="h-20 w-20 text-muted-foreground/20" />
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {pkg.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                  {pkg.images.map((image, index) => (
                    <div 
                      key={image.id}
                      className={`
                        cursor-pointer rounded-md overflow-hidden w-20 h-20 flex-shrink-0 border-2
                        ${index === activeImageIndex ? 'border-primary' : 'border-transparent'}
                      `}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <Image
                        src={image.url}
                        alt={`صورة ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
              
              <h3 className="font-semibold text-lg mb-3">وصف الباقة</h3>
              <p className="text-muted-foreground mb-6">{displayDescription}</p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">المدة</p>
                    <p className="font-medium">{pkg.duration_days} أيام</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">الأشخاص</p>
                    <p className="font-medium">حتى {pkg.max_persons} أشخاص</p>
                  </div>
                </div>
                
                {pkg.start_location && (
                  <div className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">الانطلاق من</p>
                      <p className="font-medium">{pkg.start_location}</p>
                    </div>
                  </div>
                )}
                
                {pkg.end_location && (
                  <div className="flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">النهاية في</p>
                      <p className="font-medium">{pkg.end_location}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">السعر</p>
                    <p className="font-medium">{Number(pkg.price).toLocaleString('ar-SA')} ر.س</p>
                  </div>
                </div>
                
                {pkg.discount_price && (
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">بعد الخصم</p>
                      <p className="font-medium">{Number(pkg.discount_price).toLocaleString('ar-SA')} ر.س</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">مميزات الباقة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pkg.includes_accommodation && (
                  <div className="flex items-center gap-2">
                    <Hotel className="h-5 w-5 text-primary" />
                    <p>إقامة</p>
                  </div>
                )}
                
                {pkg.includes_transport && (
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-primary" />
                    <p>مواصلات</p>
                  </div>
                )}
                
                {pkg.includes_meals && (
                  <div className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-primary" />
                    <p>وجبات</p>
                  </div>
                )}
                
                {pkg.includes_guide && (
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-primary" />
                    <p>مرشد</p>
                  </div>
                )}
                
                {pkg.includes_insurance && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <p>تأمين</p>
                  </div>
                )}
                
                {Object.entries(features).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <p>{value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">معلومات الباقة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                <p>{new Date(pkg.created_at).toLocaleDateString('ar-SA')}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">آخر تحديث</p>
                <p>{new Date(pkg.updated_at).toLocaleDateString('ar-SA')}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">النوع</p>
                <p>{pkg.type === 'umrah' ? 'عمرة' : pkg.type === 'hajj' ? 'حج' : 'مشترك'}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <Badge className={
                  pkg.status === 'active' ? 'bg-green-500' : 
                  pkg.status === 'inactive' ? 'bg-orange-500' : 'bg-gray-500'
                }>
                  {pkg.status === 'active' ? 'نشط' : 
                   pkg.status === 'inactive' ? 'غير نشط' : 'مسودة'}
                </Badge>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">مميز</p>
                <p>{pkg.is_featured ? 'نعم' : 'لا'}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm text-muted-foreground">عدد المشاهدات</p>
                <p>{pkg.views_count}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleEdit} className="w-full">
                <Edit className="h-4 w-4 ml-2" />
                تعديل الباقة
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 