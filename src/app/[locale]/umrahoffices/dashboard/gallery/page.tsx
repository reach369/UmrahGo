'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Image as ImageIcon, Plus, Trash, Star, Edit, Loader2, MoveVertical, X, Camera } from 'lucide-react';
import { getValidImageUrl } from '@/utils/image-helpers';
import { 
  useGetGalleryQuery, 
  useUploadImageMutation, 
  useUpdateImageMutation, 
  useDeleteImageMutation, 
  useSetFeaturedMutation,
  useReorderImagesMutation
} from '../../redux/api/galleryApiSlice';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useLocale } from '@/hooks/useLocale';

// UI Components
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/[locale]/umrahoffices/redux/store';

// Sortable image component
const SortableImage = ({ image, onEdit, onDelete, onSetFeatured }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.id });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };
  
  // Get image URL from either image_path or image property based on API response
  const imageUrl = getValidImageUrl(image.image_path || image.image);
  
  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
          <img
            src={imageUrl}
            alt={image.title || 'صورة معرض المكتب'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/images/placeholder.jpg';
            }}
          />
          
          {image.is_featured && (
            <div className="absolute top-2 right-2">
              <Badge variant="default" className="bg-yellow-500">مميزة</Badge>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => onEdit(image)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button 
                size="sm" 
                variant="secondary" 
                onClick={() => onSetFeatured(image.id)}
                disabled={image.is_featured}
                className={image.is_featured ? "bg-yellow-500 text-white" : ""}
              >
                <Star className="h-4 w-4" />
              </Button>
              
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => onDelete(image.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-medium truncate">{image.title || 'صورة بدون عنوان'}</h3>
          {image.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mt-1">{image.description}</p>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {new Date(image.created_at).toLocaleDateString('ar-SA')}
          </div>
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-move text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MoveVertical className="h-4 w-4" />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

// Badge component
const Badge = ({ children, className = '', variant = 'default' }) => {
  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${className}`}>
      {children}
    </span>
  );
};

export default function GalleryPage() {
  const locale = useLocale();
  const { user } = useSelector((state: RootState) => state.auth);
  
  // State for dialogs
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [hasReordered, setHasReordered] = useState(false);
  
  // Form states
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    is_featured: false,
    image: null as File | null,
    imagePreview: ''
  });
  
  const [editForm, setEditForm] = useState({
    id: 0,
    title: '',
    description: '',
    is_featured: false
  });
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // 10px of movement required before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // RTK Query hooks
  const { 
    data: galleryData, 
    isLoading: isLoadingGallery, 
    error: galleryError,
    refetch: refetchGallery,
    isError: isGalleryError
  } = useGetGalleryQuery(undefined, {
    refetchOnMountOrArgChange: true
  });
  
  const [uploadImage, { isLoading: isUploading, isError: isUploadError, error: uploadError }] = useUploadImageMutation();
  const [updateImage, { isLoading: isUpdating, isError: isUpdateError, error: updateError }] = useUpdateImageMutation();
  const [deleteImage, { isLoading: isDeleting, isError: isDeleteError, error: deleteError }] = useDeleteImageMutation();
  const [setFeatured, { isLoading: isSettingFeatured, isError: isSetFeaturedError, error: setFeaturedError }] = useSetFeaturedMutation();
  const [reorderImages, { isLoading: isReordering, isError: isReorderError, error: reorderError }] = useReorderImagesMutation();
  
  // Update local images when API data changes
  useEffect(() => {
    if (galleryData?.data) {
      // Sort by display_order if available, otherwise use ID
      const sortedImages = [...galleryData.data].sort((a, b) => {
        if (a.display_order !== undefined && b.display_order !== undefined) {
          return a.display_order - b.display_order;
        }
        return a.id - b.id;
      });
      setImages(sortedImages);
    }
  }, [galleryData]);

  // Error handler useEffect
  useEffect(() => {
    if (isGalleryError) toast.error('حدث خطأ أثناء تحميل معرض الصور');
    if (isUploadError) toast.error('حدث خطأ أثناء تحميل الصورة');
    if (isUpdateError) toast.error('حدث خطأ أثناء تحديث معلومات الصورة');
    if (isDeleteError) toast.error('حدث خطأ أثناء حذف الصورة');
    if (isSetFeaturedError) toast.error('حدث خطأ أثناء تعيين الصورة كصورة مميزة');
    if (isReorderError) toast.error('حدث خطأ أثناء ترتيب الصور');
  }, [
    isGalleryError, 
    isUploadError, 
    isUpdateError, 
    isDeleteError, 
    isSetFeaturedError, 
    isReorderError
  ]);
  
  // Handle image file selection - with drag and drop support
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate image type
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار ملف صورة صالح');
        return;
      }

      // Validate image size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جدًا، يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadForm({
          ...uploadForm,
          image: file,
          imagePreview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop for image upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validate image type
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار ملف صورة صالح');
        return;
      }
      
      // Validate image size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة كبير جدًا، يجب أن يكون أقل من 5 ميجابايت');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadForm({
          ...uploadForm,
          image: file,
          imagePreview: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle image upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.image) {
      toast.error('يرجى اختيار صورة للتحميل');
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append('image', uploadForm.image);
      
      if (uploadForm.title) {
        formData.append('title', uploadForm.title);
      }
      
      if (uploadForm.description) {
        formData.append('description', uploadForm.description);
      }

      if (uploadForm.is_featured) {
        formData.append('is_featured', '1');
      }
      
      // Add loading toast
      const loadingToast = toast.loading('جارٍ تحميل الصورة...');
      
      await uploadImage(formData).unwrap();
      
      // Clear loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('تم تحميل الصورة بنجاح');
      
      // Reset form and close dialog
      setUploadForm({
        title: '',
        description: '',
        is_featured: false,
        image: null,
        imagePreview: ''
      });
      setUploadDialogOpen(false);
      
      // Refresh gallery
      refetchGallery();
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('حدث خطأ أثناء تحميل الصورة');
    }
  };
  
  // Open edit dialog with image data
  const openEditDialog = (image: any) => {
    setSelectedImage(image);
    setEditForm({
      id: image.id,
      title: image.title || '',
      description: image.description || '',
      is_featured: image.is_featured || false
    });
    setEditDialogOpen(true);
  };
  
  // Handle image update
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const formData = new FormData();
      formData.append('title', editForm.title);
      formData.append('description', editForm.description);
      formData.append('is_featured', editForm.is_featured ? '1' : '0');
      formData.append('_method', 'PUT'); // Laravel method spoofing
      
      // Add loading toast
      const loadingToast = toast.loading('جارٍ تحديث معلومات الصورة...');
      
      await updateImage({ id: editForm.id, formData }).unwrap();
      
      // Clear loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('تم تحديث معلومات الصورة بنجاح');
      
      // Close dialog
      setEditDialogOpen(false);
      
      // Refresh gallery
      refetchGallery();
    } catch (err) {
      console.error('Error updating image:', err);
      toast.error('حدث خطأ أثناء تحديث معلومات الصورة');
    }
  };
  
  // Handle image delete
  const handleDeleteImage = async (id: number) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذه الصورة؟')) {
      return;
    }
    
    try {
      // Add loading toast
      const loadingToast = toast.loading('جارٍ حذف الصورة...');
      
      await deleteImage(id).unwrap();
      
      // Clear loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('تم حذف الصورة بنجاح');
      
      // Refresh gallery
      refetchGallery();
    } catch (err) {
      console.error('Error deleting image:', err);
      toast.error('حدث خطأ أثناء حذف الصورة');
    }
  };
  
  // Handle set featured image
  const handleSetFeatured = async (id: number) => {
    try {
      // Add loading toast
      const loadingToast = toast.loading('جارٍ تعيين الصورة كصورة مميزة...');
      
      await setFeatured(id).unwrap();
      
      // Clear loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('تم تعيين الصورة كصورة مميزة بنجاح');
      
      // Refresh gallery
      refetchGallery();
    } catch (err) {
      console.error('Error setting featured image:', err);
      toast.error('حدث خطأ أثناء تعيين الصورة كصورة مميزة');
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(img => img.id === active.id);
      const newIndex = images.findIndex(img => img.id === over.id);
      
      // Update the local state immediately for a responsive UI
      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);
      setHasReordered(true);
    }
  };

  // Save reordered images
  const saveReorderedImages = async () => {
    try {
      // Prepare images with new display order
      const orderedImages = images.map((img, index) => ({
        id: img.id,
        display_order: index + 1 // Start from 1 for better compatibility
      }));

      // Add loading toast
      const loadingToast = toast.loading('جارٍ حفظ ترتيب الصور...');

      // Send to API
      await reorderImages({ images: orderedImages }).unwrap();
      
      // Clear loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('تم حفظ ترتيب الصور بنجاح');
      setHasReordered(false);
      
      // Refresh gallery
      refetchGallery();
    } catch (err) {
      console.error('Error saving image order:', err);
      toast.error('حدث خطأ أثناء حفظ ترتيب الصور');
    }
  };
  
  // Loading state
  if (isLoadingGallery) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[250px] w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (isGalleryError) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            حدث خطأ أثناء تحميل معرض الصور. يرجى المحاولة مرة أخرى لاحقا.
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetchGallery()}>إعادة المحاولة</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">معرض الصور</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            إدارة صور المكتب ومعرض الصور
          </p>
        </div>
        
        <div className="flex gap-2">
          {hasReordered && (
            <Button 
              onClick={saveReorderedImages} 
              variant="default" 
              disabled={isReordering}
            >
              {isReordering && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              حفظ الترتيب
            </Button>
          )}
          <Button onClick={() => setUploadDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة صورة جديدة
          </Button>
        </div>
      </div>
      
      {/* No Images State */}
      {images.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">لا توجد صور</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            ابدأ بإضافة صور لمكتبك لعرضها للعملاء.
          </p>
          <div className="mt-6">
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              إضافة صورة جديدة
            </Button>
          </div>
        </div>
      ) : (
        // Images Gallery with DnD reordering
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="relative">
            <SortableContext
              items={images.map(img => img.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((image) => (
                  <SortableImage
                    key={image.id}
                    image={image}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteImage}
                    onSetFeatured={handleSetFeatured}
                  />
                ))}
              </div>
            </SortableContext>
          </div>
        </DndContext>
      )}
      
      {/* Upload Image Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>إضافة صورة جديدة</DialogTitle>
            <DialogDescription>
              قم بتحميل صورة جديدة لإضافتها إلى معرض مكتبك.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleUploadSubmit}>
            <div className="space-y-4 py-4">
              {/* Drag & Drop Area */}
              <div 
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                  isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700'
                } ${
                  uploadForm.imagePreview ? 'bg-gray-50 dark:bg-gray-800' : ''
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {uploadForm.imagePreview ? (
                  <div className="relative">
                    <img 
                      src={uploadForm.imagePreview} 
                      alt="معاينة الصورة" 
                      className="mx-auto max-h-48 rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => setUploadForm({...uploadForm, image: null, imagePreview: ''})}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">
                      اسحب وأفلت الصورة هنا أو اضغط للاختيار
                    </p>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-2"
                      onClick={() => document.getElementById('image')?.click()}
                    >
                      اختر صورة
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="title">عنوان الصورة</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                  placeholder="أدخل عنوانًا وصفيًا للصورة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">وصف الصورة</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                  placeholder="أدخل وصفًا للصورة (اختياري)"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={uploadForm.is_featured}
                  onCheckedChange={(checked) => setUploadForm({...uploadForm, is_featured: checked})}
                />
                <Label htmlFor="featured" className="mr-2">تعيين كصورة مميزة</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setUploadForm({
                    title: '',
                    description: '',
                    is_featured: false,
                    image: null,
                    imagePreview: ''
                  });
                  setUploadDialogOpen(false);
                }}
              >
                إلغاء
              </Button>
              <Button 
                type="submit"
                disabled={isUploading || !uploadForm.image}
              >
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                تحميل الصورة
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Image Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل معلومات الصورة</DialogTitle>
            <DialogDescription>
              تعديل تفاصيل الصورة المحددة.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              {selectedImage && (
                <div className="text-center">
                  <img 
                    src={getValidImageUrl(selectedImage.image_path || selectedImage.image)}
                    alt="الصورة المحددة" 
                    className="mx-auto max-h-48 rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/images/placeholder.jpg';
                    }}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="edit-title">عنوان الصورة</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  placeholder="أدخل عنوانًا وصفيًا للصورة"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">وصف الصورة</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  placeholder="أدخل وصفًا للصورة (اختياري)"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-featured"
                  checked={editForm.is_featured}
                  onCheckedChange={(checked) => setEditForm({...editForm, is_featured: checked})}
                />
                <Label htmlFor="edit-featured" className="mr-2">تعيين كصورة مميزة</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                إلغاء
              </Button>
              <Button 
                type="submit"
                disabled={isUpdating}
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 