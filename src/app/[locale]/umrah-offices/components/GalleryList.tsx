import { useGetGalleryQuery, useDeleteGalleryImageMutation, useUpdateGalleryImageMutation } from '../redux/api/galleryApiSlice';
import { GalleryCard } from './GalleryCard';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export function GalleryList() {
  const { data: galleryData, isLoading, error } = useGetGalleryQuery();
  const [deleteImage] = useDeleteGalleryImageMutation();
  const [updateImage] = useUpdateGalleryImageMutation();
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="mr-2">جاري تحميل معرض الصور...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        حدث خطأ أثناء تحميل معرض الصور. الرجاء المحاولة مرة أخرى.
      </div>
    );
  }

  if (!galleryData?.data || galleryData.data.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        لا توجد صور في المعرض حالياً
      </div>
    );
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteImage(id).unwrap();
      toast({
        title: 'تم حذف الصورة بنجاح',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ أثناء حذف الصورة',
        variant: 'destructive',
      });
    }
  };

  const handleFeatured = async (id: number) => {
    try {
      await updateImage({ id, data: { is_featured: true } }).unwrap();
      toast({
        title: 'تم تحديث حالة الصورة بنجاح',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ أثناء تحديث حالة الصورة',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {galleryData.data.map((image) => (
        <GalleryCard
          key={image.id}
          image={image}
          onDelete={handleDelete}
          onFeatured={handleFeatured}
        />
      ))}
    </div>
  );
} 