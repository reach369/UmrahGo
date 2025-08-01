import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useGetGalleryImageQuery } from '../redux/api/galleryApiSlice';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageDetailsDialogProps {
  imageId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageDetailsDialog({ imageId, open, onOpenChange }: ImageDetailsDialogProps) {
  const { data: imageData, isLoading, error } = useGetGalleryImageQuery(imageId!, {
    skip: !imageId,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>تفاصيل الصورة</DialogTitle>
        </DialogHeader>
        {isLoading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="mr-2">جاري تحميل التفاصيل...</span>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 p-4">
            حدث خطأ أثناء تحميل تفاصيل الصورة
          </div>
        )}
        {imageData?.data && (
          <div className="space-y-4">
            {imageData.data.image && (
              <div className="relative w-full aspect-video">
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/${imageData.data.image}`}
                  alt="صورة المعرض"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                  className="object-contain"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold">رقم التعريف:</span>
                <span className="mr-2">{imageData.data.id}</span>
              </div>
              <div>
                <span className="font-semibold">ترتيب العرض:</span>
                <span className="mr-2">{imageData.data.display_order}</span>
              </div>
              <div>
                <span className="font-semibold">الحالة المميزة:</span>
                <span className="mr-2">{imageData.data.is_featured ? 'نعم' : 'لا'}</span>
              </div>
              <div>
                <span className="font-semibold">تاريخ الإنشاء:</span>
                <span className="mr-2">
                  {format(new Date(imageData.data.created_at), 'yyyy/MM/dd HH:mm')}
                </span>
              </div>
            </div>
            {imageData.data.description && (
              <div>
                <span className="font-semibold">الوصف:</span>
                <p className="mt-1 text-gray-600">{imageData.data.description}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 