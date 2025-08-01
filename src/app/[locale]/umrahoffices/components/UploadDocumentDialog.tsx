import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUploadDocumentMutation } from '../redux/api/documentsApiSlice';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileText } from 'lucide-react';

interface UploadDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const documentTypes = [
  { value: 'license', label: 'رخصة' },
  { value: 'certificate', label: 'شهادة' },
  { value: 'identification', label: 'هوية' },
  { value: 'other', label: 'أخرى' },
] as const;

export function UploadDocumentDialog({ open, onOpenChange }: UploadDocumentDialogProps) {
  const [uploadDocument, { isLoading }] = useUploadDocumentMutation();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    type: 'license' as typeof documentTypes[number]['value'],
    description: '',
    expiry_date: '',
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (value: typeof documentTypes[number]['value']) => {
    setFormData(prev => ({ ...prev, type: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'license',
      description: '',
      expiry_date: '',
      file: null,
    });
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
        description: 'الرجاء اختيار ملف',
        variant: 'destructive',
      });
      return;
    }

    try {
      await uploadDocument({
        name: formData.name,
        type: formData.type,
        description: formData.description,
        expiry_date: formData.expiry_date,
        file: formData.file,
      }).unwrap();

      toast({
        title: 'تم رفع المستند بنجاح',
        description: 'تمت إضافة المستند إلى المكتب',
      });
      handleClose();
    } catch (error) {
      toast({
        title: 'حدث خطأ أثناء رفع المستند',
        description: 'يرجى المحاولة مرة أخرى',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة مستند جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المستند</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="مثال: رخصة مزاولة المهنة"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">نوع المستند</Label>
            <Select
              value={formData.type}
              onValueChange={handleTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المستند" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">وصف المستند</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="أدخل وصفاً مختصراً للمستند"
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
            <Label htmlFor="file">الملف</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileText className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">انقر لاختيار ملف</span> أو اسحب وأفلت
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, DOC, DOCX, JPG, PNG (الحد الأقصى: 10 ميجابايت)
                  </p>
                </div>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  required
                />
              </label>
            </div>
            {formData.file && (
              <p className="text-sm text-gray-500 mt-2">
                الملف المختار: {formData.file.name}
              </p>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={handleClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              رفع المستند
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 