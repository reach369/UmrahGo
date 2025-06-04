'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Edit, Filter, ListFilter, Loader2, Package, Plus, Star, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useGetPackagesQuery } from '../../redux/api/packagesApiSlice';
import { useToast } from '@/components/ui/use-toast';

export default function PackagesPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'draft' | undefined>('active');
  const [featuredFilter, setFeaturedFilter] = useState<boolean | undefined>(undefined);
  const [typeFilter, setTypeFilter] = useState<'umrah' | 'hajj' | 'combined' | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  
  // Fetch packages with filters
  const { 
    data: packagesData,
    isLoading,
    isFetching,
    isError,
    error,
    refetch 
  } = useGetPackagesQuery({
    status: statusFilter,
    featured: featuredFilter,
    type: typeFilter,
    page,
    per_page: perPage
  });
  
  // Handler for changing filter values
  const applyFilters = () => {
    setPage(1); // Reset to first page when filters change
    refetch();
  };
  
  // Navigate to create package page
  const handleCreatePackage = () => {
    router.push('packages/create');
  };
  
  // Navigate to package details page
  const handleViewPackage = (id: number) => {
    router.push(`packages/${id}`);
  };
  
  // Navigate to edit package page
  const handleEditPackage = (id: number) => {
    router.push(`packages/${id}/edit`);
  };
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">باقات العمرة</h1>
          <p className="text-muted-foreground">إدارة باقات العمرة الخاصة بالمكتب</p>
        </div>
        <Button 
          onClick={handleCreatePackage}
          className="mt-4 md:mt-0 flex items-center gap-2"
        >
          <Plus size={16} />
          إضافة باقة جديدة
        </Button>
      </div>
      
      {/* Filters */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Filter className="ml-2 h-5 w-5" />
            تصفية الباقات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select 
                value={statusFilter || 'all'} 
                onValueChange={(value) => setStatusFilter(value === 'all' ? undefined : value as 'active' | 'inactive' | 'draft')}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="type">النوع</Label>
              <Select 
                value={typeFilter || 'all'} 
                onValueChange={(value) => setTypeFilter(value === 'all' ? undefined : value as 'umrah' | 'hajj' | 'combined')}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="umrah">عمرة</SelectItem>
                  <SelectItem value="hajj">حج</SelectItem>
                  <SelectItem value="combined">مشترك</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="featured" className="mb-2 block">الباقات المميزة</Label>
              <div className="flex items-center gap-2 pt-2">
                <Checkbox 
                  id="featured" 
                  checked={featuredFilter === true}
                  onCheckedChange={(checked) => {
                    if (checked === true) setFeaturedFilter(true);
                    else setFeaturedFilter(undefined);
                  }}
                />
                <Label htmlFor="featured" className="cursor-pointer">
                  عرض الباقات المميزة فقط
                </Label>
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={applyFilters} 
                variant="outline" 
                className="w-full flex items-center gap-2"
              >
                <ListFilter size={16} />
                تطبيق التصفية
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Packages List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>قائمة الباقات</span>
            {(isLoading || isFetching) && (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
          <CardDescription>
            {packagesData?.total
              ? `تم العثور على ${packagesData.total} باقة`
              : 'لم يتم العثور على باقات'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">جاري تحميل الباقات...</p>
            </div>
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-red-500 mb-2">حدث خطأ أثناء تحميل الباقات</p>
              <Button onClick={() => refetch()} variant="outline" className="mt-2">
                إعادة المحاولة
              </Button>
            </div>
          ) : packagesData?.data.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground mb-2">لا توجد باقات</p>
              <p className="text-sm text-muted-foreground/70 mb-6">
                لم يتم العثور على أي باقات تطابق معايير البحث المحددة
              </p>
              <Button onClick={handleCreatePackage} className="mt-2">
                إضافة باقة جديدة
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packagesData?.data.map((pkg) => {
                // Get Arabic translation if available, otherwise use the default name
                const arTranslation = pkg.translations.find(t => t.locale === 'ar');
                const displayName = arTranslation?.name || pkg.name;
                const displayDescription = arTranslation?.description || pkg.description;
                
                return (
                  <Card key={pkg.id} className="overflow-hidden transition-all hover:shadow-md">
                    <div className="aspect-video relative">
                      {pkg.featured_image_url ? (
                        <Image
                          src={pkg.featured_image_url}
                          alt={displayName}
                          width={400}
                          height={225}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="bg-muted w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge className={
                          pkg.status === 'active' ? 'bg-green-500' : 
                          pkg.status === 'inactive' ? 'bg-orange-500' : 'bg-gray-500'
                        }>
                          {pkg.status === 'active' ? 'نشط' : 
                           pkg.status === 'inactive' ? 'غير نشط' : 'مسودة'}
                        </Badge>
                        {pkg.is_featured && (
                          <Badge className="bg-yellow-500">
                            <Star className="h-3 w-3 mr-1" /> مميز
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="pt-4">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{displayName}</h3>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{displayDescription}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 ml-1" />
                          <span>{pkg.duration_days} أيام</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="font-semibold">{Number(pkg.price).toLocaleString('ar-SA')} ر.س</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {pkg.includes_transport && (
                          <Badge variant="outline">مواصلات</Badge>
                        )}
                        {pkg.includes_accommodation && (
                          <Badge variant="outline">إقامة</Badge>
                        )}
                        {pkg.includes_meals && (
                          <Badge variant="outline">وجبات</Badge>
                        )}
                        {pkg.includes_guide && (
                          <Badge variant="outline">مرشد</Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewPackage(pkg.id)}
                      >
                        عرض التفاصيل
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditPackage(pkg.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
        
        {/* Pagination */}
        {packagesData && packagesData.last_page > 1 && (
          <CardFooter className="flex justify-center py-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1 || isLoading}
              >
                السابق
              </Button>
              <span className="text-sm">
                صفحة {page} من {packagesData.last_page}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.min(prev + 1, packagesData.last_page))}
                disabled={page === packagesData.last_page || isLoading}
              >
                التالي
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
} 