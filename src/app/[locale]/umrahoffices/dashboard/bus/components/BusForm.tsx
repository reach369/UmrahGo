import { useForm } from 'react-hook-form';
import { Button, Input, Select, NumberInput } from './ui';
import { BusFormData, BusType } from '../types/bus.types';

interface BusFormProps {
  onSubmit: (data: BusFormData) => void;
  busTypes: BusType[];
  initialData?: Partial<BusFormData>;
  isLoading?: boolean;
}

export const BusForm = ({ onSubmit, busTypes, initialData, isLoading }: BusFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<BusFormData>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="نوع الباص"
          {...register('type_id', { required: 'نوع الباص مطلوب' })}
          error={errors.type_id?.message}
        >
          <option value="">اختر نوع الباص</option>
          {busTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </Select>

        <Input
          label="موديل الباص"
          {...register('model', { 
            required: 'موديل الباص مطلوب',
            maxLength: { value: 100, message: 'الموديل يجب أن لا يتجاوز 100 حرف' }
          })}
          error={errors.model?.message}
        />

        <NumberInput
          label="سنة الصنع"
          {...register('year', { 
            required: 'سنة الصنع مطلوبة',
            min: { value: 1990, message: 'السنة يجب أن تكون 1990 أو أحدث' },
            max: { value: new Date().getFullYear(), message: 'السنة غير صالحة' }
          })}
          error={errors.year?.message}
        />

        <NumberInput
          label="السعة"
          {...register('capacity', { 
            required: 'السعة مطلوبة',
            min: { value: 1, message: 'السعة يجب أن تكون أكبر من 0' }
          })}
          error={errors.capacity?.message}
        />

        <NumberInput
          label="السعر"
          {...register('price', { 
            required: 'السعر مطلوب',
            min: { value: 0, message: 'السعر يجب أن يكون 0 أو أكبر' }
          })}
          error={errors.price?.message}
        />

        <Input
          label="الحالة"
          {...register('condition', { 
            required: 'الحالة مطلوبة',
            maxLength: { value: 100, message: 'الحالة يجب أن لا تتجاوز 100 حرف' }
          })}
          error={errors.condition?.message}
        />

        <NumberInput
          label="خط العرض"
          {...register('location_lat', {
            min: { value: -90, message: 'خط العرض يجب أن يكون بين -90 و 90' },
            max: { value: 90, message: 'خط العرض يجب أن يكون بين -90 و 90' }
          })}
          error={errors.location_lat?.message}
        />

        <NumberInput
          label="خط الطول"
          {...register('location_lng', {
            min: { value: -180, message: 'خط الطول يجب أن يكون بين -180 و 180' },
            max: { value: 180, message: 'خط الطول يجب أن يكون بين -180 و 180' }
          })}
          error={errors.location_lng?.message}
        />

        <Select
          label="حالة التوفر"
          {...register('status', { required: 'حالة التوفر مطلوبة' })}
          error={errors.status?.message}
        >
          <option value="">اختر حالة التوفر</option>
          <option value="available">متوفر</option>
          <option value="rented">مؤجر</option>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button type="submit" loading={isLoading}>
          {initialData ? 'تحديث الباص' : 'إضافة باص جديد'}
        </Button>
      </div>
    </form>
  );
}; 