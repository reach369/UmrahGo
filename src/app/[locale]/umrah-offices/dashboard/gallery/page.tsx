'use client';

import { useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ImageIcon, Upload, PlusCircle, Heart, RefreshCw, Pencil, Trash2, Grid2X2 } from 'lucide-react';
import { useGetGalleryQuery, useUploadImageMutation, useUpdateImageMutation, useDeleteImageMutation, useSetFeaturedMutation } from '../../redux/api/galleryApiSlice';

export default function GalleryPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'ar';
  const { toast } = useToast();

  // Upload states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageDescription, setImageDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit states
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<any>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editDisplayOrder, setEditDisplayOrder] = useState('');

  // API hooks with polling disabled
  const { data: galleryData, isLoading, error } = useGetGalleryQuery(undefined, {
    pollingInterval: 0
  });
  const [uploadImage, { isLoading: isUploading }] = useUploadImageMutation();
  const [updateImage, { isLoading: isUpdating }] = useUpdateImageMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteImageMutation();
  const [setFeatured] = useSetFeaturedMutation();

  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'gallery'>('grid');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار صورة للرفع',
        variant: 'destructive',
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('description', imageDescription);
      formData.append('is_featured', isFeatured ? '1' : '0');

      await uploadImage(formData).unwrap();
      
      toast({
        title: 'تم بنجاح',
        description: 'تم رفع الصورة بنجاح',
      });
      
      setIsUploadDialogOpen(false);
      resetUploadForm();
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء رفع الصورة',
        variant: 'destructive',
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingImage) return;

    try {
      const formData = new FormData();
      formData.append('description', editDescription);
      formData.append('display_order', editDisplayOrder);

      await updateImage({ id: editingImage.id, formData }).unwrap();
      
      toast({
        title: 'تم بنجاح',
        description: 'تم تحديث الصورة بنجاح',
      });
      
      setIsEditDialogOpen(false);
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحديث الصورة',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;

    try {
      await deleteImage(id).unwrap();
      
      toast({
        title: 'تم بنجاح',
        description: 'تم حذف الصورة بنجاح',
      });
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف الصورة',
        variant: 'destructive',
      });
    }
  };

  const handleSetFeatured = async (id: number) => {
    try {
      await setFeatured(id).unwrap();
      
      toast({
        title: 'تم بنجاح',
        description: 'تم تعيين الصورة كصورة مميزة',
      });
    } catch (err) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تعيين الصورة كمميزة',
        variant: 'destructive',
      });
    }
  };

  const resetUploadForm = () => {
    setSelectedImage(null);
    setImageDescription('');
    setIsFeatured(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openEditDialog = (image: any) => {
    setEditingImage(image);
    setEditDescription(image.description || '');
    setEditDisplayOrder(image.display_order?.toString() || '');
    setIsEditDialogOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        حدث خطأ أثناء تحميل معرض الصور. يرجى تحديث الصفحة.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-primary">معرض صور المكتب</CardTitle>
            <CardDescription>
              عرض وإدارة الصور الخاصة بالمكتب
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'gallery' : 'grid')}
            >
              <Grid2X2 className="h-4 w-4" />
            </Button>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  إضافة صورة جديدة
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] text-right">
                <DialogHeader>
                  <DialogTitle className="text-right">إضافة صورة جديدة</DialogTitle>
                  <DialogDescription className="text-right">
                    قم برفع صورة جديدة إلى معرض المكتب
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="image">اختر الصورة</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      ref={fileInputRef}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">وصف الصورة</Label>
                    <Input
                      id="description"
                      value={imageDescription}
                      onChange={(e) => setImageDescription(e.target.value)}
                      placeholder="أدخل وصفاً للصورة"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="featured">تعيين كصورة مميزة</Label>
                    <Input
                      id="featured"
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    onClick={handleUpload}
                    disabled={!selectedImage || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        رفع الصورة
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">جاري تحميل الصور...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-lg text-red-500">حدث خطأ أثناء تحميل الصور</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                إعادة المحاولة
              </Button>
            </div>
          ) : galleryData?.data.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg text-muted-foreground mb-2">لا توجد صور في المعرض</p>
              <p className="text-sm text-muted-foreground/70 mb-6">يمكنك البدء بإضافة صور لعرضها هنا</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galleryData?.data.map((image: any) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square relative overflow-hidden rounded-lg">
                    <Image
                      src={image.image_path.startsWith('http') ? image.image_path : `/${image.image_path}`}
                      alt={image.description || image.title || 'صورة المعرض'}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform group-hover:scale-110"
                    />
                    {image.is_featured && (
                      <Badge className="absolute top-2 right-2 bg-primary">
                        مميزة
                      </Badge>
                    )}
                  </div>
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-primary"
                      onClick={() => handleSetFeatured(image.id)}
                    >
                      <Heart className={`h-5 w-5 ${image.is_featured ? 'fill-primary' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-primary"
                      onClick={() => openEditDialog(image)}
                    >
                      <Pencil className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:text-primary"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  {image.description && (
                    <p className="mt-2 text-sm text-gray-600 text-center">
                      {image.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4">
              {galleryData?.data.map((image: any) => (
                <div key={image.id} className="w-32 h-24 rounded-lg overflow-hidden border relative group">
                  <Image 
                    src={image.image_path.startsWith('http') ? image.image_path : `/${image.image_path}`} 
                    alt={image.description || image.title || 'صورة المعرض'} 
                    width={128} 
                    height={96} 
                    className="object-cover w-full h-full" 
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-center h-full gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white hover:text-primary"
                        onClick={() => handleSetFeatured(image.id)}
                      >
                        <Heart className={`h-4 w-4 ${image.is_featured ? 'fill-primary' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white hover:text-primary"
                        onClick={() => openEditDialog(image)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-white hover:text-primary"
                        onClick={() => handleDelete(image.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {image.is_featured && (
                    <Badge className="absolute top-1 right-1 bg-primary/80 text-[10px] px-1">
                      مميزة
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] text-right">
          <DialogHeader>
            <DialogTitle className="text-right">تعديل الصورة</DialogTitle>
            <DialogDescription className="text-right">
              قم بتعديل تفاصيل الصورة
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">وصف الصورة</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="أدخل وصفاً للصورة"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-order">ترتيب العرض</Label>
              <Input
                id="edit-order"
                type="number"
                value={editDisplayOrder}
                onChange={(e) => setEditDisplayOrder(e.target.value)}
                placeholder="أدخل ترتيب العرض"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  حفظ التعديلات
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 