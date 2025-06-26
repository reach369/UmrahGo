import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Calendar } from '../../../../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../../components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { AlertCircle, CalendarIcon, MinusCircle, PlusCircle, CheckCircle } from 'lucide-react';
import { Package, bookPackage, BookingRequest } from '../services/officesService';
import { useRouter } from 'next/navigation';

// Custom alert components
interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

const Alert = ({ children, className }: AlertProps) => (
  <div className={cn("p-4 rounded-md border", className)}>
    {children}
  </div>
);

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h5 className="font-medium mb-1 flex items-center gap-1.5">{children}</h5>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
);

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  package: Package;
  officeName: string;
}

export function BookingModal({ isOpen, onClose, package: pkg, officeName }: BookingModalProps) {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [persons, setPersons] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    if (!date) {
      setError('يرجى اختيار تاريخ للرحلة');
      return;
    }

    // Check if the user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setError('يجب تسجيل الدخول أولاً لحجز الباقة');
      // Redirect to login after a delay
      setTimeout(() => {
        onClose();
        router.push('/ar/login?redirect=offices');
      }, 2000);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const bookingData: BookingRequest = {
        package_id: pkg.id,
        booking_date: format(date, 'yyyy-MM-dd'),
        persons_count: persons,
        phone_number: phoneNumber,
        notes: notes || undefined
      };
      
      // In a real implementation, this would use the API
      // For now, we're simulating the API call for demonstration
      // const response = await bookPackage(bookingData);
      
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccess('تم إرسال طلب الحجز بنجاح! سيتم التواصل معك قريبًا.');
      
      // Close the modal after showing success message
      setTimeout(() => {
        onClose();
        // Reset form
        setPhoneNumber('');
        setNotes('');
        setPersons(1);
        setDate(new Date());
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error('Error booking package:', err);
      setError(err.response?.data?.message || 'حدث خطأ أثناء حجز الباقة، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('ar-SA')} ${currency === 'SAR' ? 'ريال' : currency}`;
  };

  const incrementPersons = () => {
    if (pkg.max_persons && persons >= pkg.max_persons) return;
    setPersons(prev => prev + 1);
  };

  const decrementPersons = () => {
    if (persons <= 1) return;
    setPersons(prev => prev - 1);
  };

  const getTotal = () => {
    return pkg.price * persons;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>حجز باقة {pkg.name}</DialogTitle>
          <DialogDescription>
            من {officeName} - {formatCurrency(pkg.price, pkg.currency)} للشخص الواحد
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert className="bg-red-50 text-red-800 border-red-200 mt-4">
            <AlertTitle>
              <AlertCircle className="w-4 h-4 inline-block" /> خطأ
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200 mt-4">
            <AlertTitle>
              <CheckCircle className="w-4 h-4 inline-block" /> تم بنجاح
            </AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="date">تاريخ الرحلة</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-right font-normal',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="ml-2 h-4 w-4" />
                  {date ? format(date, 'PPP', { locale: ar }) : 'اختر تاريخ'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  locale={ar}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label>عدد الأشخاص</Label>
            <div className="flex items-center border rounded-md border-input overflow-hidden">
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                onClick={decrementPersons}
                disabled={persons <= 1}
                className="rounded-none"
              >
                <MinusCircle className="h-4 w-4" />
              </Button>
              
              <div className="flex-1 text-center font-medium text-lg">
                {persons}
              </div>
              
              <Button 
                type="button"
                variant="ghost" 
                size="icon" 
                onClick={incrementPersons}
                disabled={pkg.max_persons ? persons >= pkg.max_persons : false}
                className="rounded-none"
              >
                <PlusCircle className="h-4 w-4" />
              </Button>
            </div>
            {pkg.max_persons && (
              <p className="text-xs text-muted-foreground">الحد الأقصى: {pkg.max_persons} شخص</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input 
              id="phone" 
              placeholder="05xxxxxxxx" 
              type="tel" 
              required
              dir="ltr"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات إضافية</Label>
            <textarea 
              id="notes" 
              className="w-full min-h-[80px] p-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              placeholder="أي متطلبات أو ملاحظات خاصة؟"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="bg-muted p-3 rounded-lg mt-4">
            <div className="flex justify-between items-center">
              <span>المجموع:</span>
              <span className="font-bold text-lg">{formatCurrency(getTotal(), pkg.currency)}</span>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              إلغاء
            </Button>
            <Button type="submit" disabled={!date || isSubmitting}>
              {isSubmitting ? 'جاري الحجز...' : 'تأكيد الحجز'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 