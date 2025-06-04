'use client';

// استيراد المكتبات والمكونات اللازمة
import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useCreateCampaignMutation, useUpdateCampaignMutation } from '../../redux/api/campaignsApiSlice';
import { useAppSelector } from '../../hooks/reduxHooks';
import { useGetPackagesByOfficeIdQuery } from '../../redux/api/officesApiSlice';
import { 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Plus, PenSquare } from 'lucide-react';

// نوع البيانات لخصائص المكون
interface AddCampaignsDialogProps {
  mode?: 'add' | 'edit';
  campaignId?: string;
  initialData?: any;
  triggerButton?: React.ReactNode;
  onSuccess?: () => void;
}

// المكون الرئيسي لإضافة وتعديل الحملات
export default function AddCampaignsDialog({ 
  mode = 'add', 
  campaignId, 
  initialData, 
  triggerButton,
  onSuccess
}: AddCampaignsDialogProps) {
  // حالة فتح وإغلاق النافذة المنبثقة
  const [open, setOpen] = useState(false);
  
  // الحصول على معرف المكتب من حالة المصادقة
  const { user } = useAppSelector(state => state.auth);
  const officeId = user?.officeId || '';
  
  // الحصول على الباقات الخاصة بالمكتب الحالي
  const { data: packages } = useGetPackagesByOfficeIdQuery(officeId, {
    skip: !officeId,
  });
  
  // استخدام mutations لإنشاء وتحديث الحملات
  const [createCampaign, { isLoading: isCreating }] = useCreateCampaignMutation();
  const [updateCampaign, { isLoading: isUpdating }] = useUpdateCampaignMutation();
  
  // حالة التحميل الإجمالية
  const isLoading = isCreating || isUpdating;
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    package_id: 0,
    start_date: '',
    end_date: '',
    available_seats: 0,
    description: '',
    status: 'active' as 'active' | 'completed',
  });
  
  // تحديث النموذج بالبيانات الأولية عند التعديل
  useEffect(() => {
    if (initialData && mode === 'edit') {
      setFormData({
        package_id: initialData.package_id || 0,
        start_date: initialData.start_date || '',
        end_date: initialData.end_date || '',
        available_seats: initialData.available_seats || 0,
        description: initialData.description || '',
        status: initialData.status || 'active',
      });
    }
  }, [initialData, mode]);
  
  // معالجة تغييرات حقول النموذج
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: isChecked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value, 10) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // معالجة تقديم النموذج
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      // تحضير البيانات للإرسال
      const campaignData = {
        package_id: formData.package_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        available_seats: formData.available_seats,
        description: formData.description,
        status: formData.status,
        officeId
      };
      
      // إما إنشاء حملة جديدة أو تحديث حملة موجودة
      if (mode === 'add') {
        await createCampaign(campaignData).unwrap();
      } else if (mode === 'edit' && campaignId) {
        await updateCampaign({
          id: campaignId,
          ...campaignData
        }).unwrap();
      }
      
      // إعادة تعيين بيانات النموذج وإغلاق النافذة المنبثقة
      setFormData({
        package_id: 0,
        start_date: '',
        end_date: '',
        available_seats: 0,
        description: '',
        status: 'active' as 'active' | 'completed',
      });
      
      setOpen(false);
      
      // تنفيذ callback النجاح إذا تم تحديده
      if (onSuccess) {
        onSuccess();
      }
      
      // عرض إشعار النجاح
      alert(mode === 'add' ? 'تم إنشاء الحملة بنجاح' : 'تم تحديث الحملة بنجاح');
      
    } catch (error) {
      console.error(`Failed to ${mode === 'add' ? 'create' : 'update'} campaign:`, error);
      alert(`حدث خطأ أثناء ${mode === 'add' ? 'إنشاء' : 'تحديث'} الحملة`);
    }
  };

  // تصيير المكون
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton ? triggerButton : (
          <button className="inline-flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            {mode === 'add' ? (
              <>
                <Plus className="ml-2 h-5 w-5" />
                إنشاء حملة جديدة
              </>
            ) : (
              <>
                <PenSquare className="ml-2 h-5 w-5" />
                تعديل الحملة
              </>
            )}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[725px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg p-0 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5">
          <DialogHeader className="pb-0">
            <DialogTitle className="text-xl font-bold text-right text-white">
              {mode === 'add' ? 'إنشاء حملة عمرة جديدة' : 'تعديل حملة العمرة'}
            </DialogTitle>
            <DialogDescription className="text-right text-blue-100">
              {mode === 'add' 
                ? 'أدخل بيانات الحملة الجديدة لإضافتها إلى النظام' 
                : 'قم بتعديل بيانات الحملة المحددة'
              }
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 text-right">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="package_id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">الباقة</label>
              <select 
                id="package_id"
                name="package_id"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
                value={formData.package_id}
                onChange={handleChange}
              >
                <option value="">اختر الباقة</option>
                {packages?.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-span-1">
              <label htmlFor="start_date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">تاريخ البداية</label>
              <input
                type="date"
                name="start_date"
                id="start_date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="end_date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">تاريخ النهاية</label>
              <input
                type="date"
                name="end_date"
                id="end_date"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="available_seats" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">المقاعد المتاحة</label>
              <input
                type="number"
                name="available_seats"
                id="available_seats"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                min="1"
                required
                value={formData.available_seats}
                onChange={handleChange}
              />
            </div>
            
            <div className="col-span-1">
              <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">الحالة</label>
              <select 
                id="status"
                name="status"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">نشطة</option>
                <option value="completed">مكتملة</option>
              </select>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">وصف الحملة</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="اكتب وصف الحملة هنا"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          
          <div className="flex flex-row-reverse gap-3 w-full mt-6 border-t pt-5 dark:border-gray-700">
            <button 
              type="submit"
              className="text-white inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="me-1 -ms-1 w-5 h-5 border-t-2 border-b-2 border-white rounded-full animate-spin"></span>
                  {mode === 'add' ? 'جاري الإنشاء...' : 'جاري التحديث...'}
                </>
              ) : (
                <>
                  {mode === 'add' ? (
                    <>
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة الحملة
                    </>
                  ) : (
                    <>
                      <PenSquare className="ml-2 h-4 w-4" />
                      تحديث الحملة
                    </>
                  )}
                </>
              )}
            </button>
            <button 
              type="button" 
              onClick={() => setOpen(false)}
              className="bg-white text-gray-500 hover:text-gray-700 border border-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg text-sm font-medium px-5 py-2.5 hover:bg-gray-100 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
            >
              إلغاء
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}