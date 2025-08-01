import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useUploadImageMutation } from '../redux/api/galleryApiSlice';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface UploadImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadImageDialog({ open, onOpenChange }: UploadImageDialogProps) {
  const [uploadImage, { isLoading }] = useUploadImageMutation();
  const { toast } = useToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    expiry_date: '',
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      expiry_date: '',
      file: null,
    });
    setPreviewUrl(null);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast({
        title: 'خطأ',
        description: 'الرجاء اختيار صورة',
        variant: 'destructive',
      });
      return;
    }

    try {
      await uploadImage({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        expiry_date: formData.expiry_date,
        file: formData.file,
      }).unwrap();

      toast({
        title: 'تم رفع الصورة بنجاح',
        description: 'تمت إضافة الصورة إلى المعرض',
      });
      handleClose();
    } catch (error) {
      toast({
        title: 'حدث خطأ أثناء رفع الصورة',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة صورة جديدة</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم الصورة</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="أدخل اسم الصورة"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">نوع الصورة</Label>
            <Input
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="مثال: واجهة المكتب، صالة الانتظار"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">وصف الصورة</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="أدخل وصفاً مختصراً للصورة"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expiry_date">تاريخ انتهاء الصلاحية</Label>
            <Input
              id="expiry_date"
              name="expiry_date"
              type="date"
              value={formData.expiry_date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">الصورة</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                {previewUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={previewUrl}
                      alt="معاينة"
                      fill
                      className="object-contain p-2"
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">انقر لاختيار صورة</span> أو اسحب وأفلت
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG أو JPEG (الحد الأقصى: 5 ميجابايت)</p>
                  </div>
                )}
                <Input
                  id="file"
                  name="file"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              رفع الصورة
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 