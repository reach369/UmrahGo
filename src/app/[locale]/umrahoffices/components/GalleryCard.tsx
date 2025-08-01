import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Trash2, Eye, Info } from 'lucide-react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ImageDetailsDialog } from './ImageDetailsDialog';
import { useSetFeaturedMutation } from '../redux/api/galleryApiSlice';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface GalleryImage {
  id: number;
  office_id: number;
  image_path: string;
  thumbnail_path: string;
  title: string | null;
  description: string | null;
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface GalleryCardProps {
  image: GalleryImage;
  onDelete: (id: number) => void;
}

export function GalleryCard({ image, onDelete }: GalleryCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [setFeatured, { isLoading: isSettingFeatured }] = useSetFeaturedMutation();
  const { toast } = useToast();

  const getImageUrl = (path: string) => {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/v1/${path}`;
  };

  const handleDelete = () => {
    onDelete(image.id);
    setShowDeleteConfirm(false);
  };

  const handleSetFeatured = async () => {
    try {
      await setFeatured(image.id).unwrap();
      toast({
        title: image.is_featured ? 'تم إلغاء تمييز الصورة' : 'تم تعيين الصورة كمميزة',
        description: image.is_featured ? 'تم إلغاء تعيين الصورة كصورة مميزة' : 'تم تعيين الصورة كصورة مميزة بنجاح',
      });
    } catch (error) {
      toast({
        title: 'حدث خطأ',
        description: 'لم نتمكن من تحديث حالة الصورة المميزة',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Card className="group relative overflow-hidden">
        <CardContent className="p-0 aspect-square relative">
          <Image
            src={getImageUrl(image.thumbnail_path)}
            alt={image.title || 'صورة المكتب'}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-black/20"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-black/20"
              onClick={() => setShowDetails(true)}
            >
              <Info className="h-5 w-5" />
            </Button>
          </div>
          {image.is_featured && (
            <div className="absolute top-2 right-2 bg-primary/80 text-white px-2 py-1 rounded-md text-xs">
              مميزة
            </div>
          )}
        </CardContent>
        <CardFooter className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex justify-between items-center">
          <span className="text-white text-sm">
            {image.title || `ترتيب العرض: ${image.display_order}`}
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "text-white hover:text-white hover:bg-white/20",
                isSettingFeatured && "opacity-50 cursor-not-allowed"
              )}
              onClick={handleSetFeatured}
              disabled={isSettingFeatured}
            >
              <Heart className={cn("h-5 w-5", image.is_featured && "fill-red-500")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{image.title || 'معاينة الصورة'}</DialogTitle>
          </DialogHeader>
          <div className="relative w-full aspect-video">
            <Image
              src={getImageUrl(image.image_path)}
              alt={image.title || 'صورة المكتب'}
              fill
              className="object-contain"
              sizes="(max-width: 1200px) 100vw, 1200px"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <ImageDetailsDialog
        imageId={showDetails ? image.id : null}
        open={showDetails}
        onOpenChange={setShowDetails}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الصورة</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الصورة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 