'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { fetchPackageById } from '@/services/packageIdService';
import { Package } from '@/services/packages.service';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { ADMIN_ENDPOINTS, API_BASE_CONFIG,PAYMENT_ENDPOINTS,USER_ENDPOINTS } from '@/config/api.config';
import { ADMIN_WEB_URL } from '@/config/api.config';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';
import { useToast } from '@/components/ui/use-toast';
import PassengerForm from '@/components/booking/PassengerForm';
import { getLocaleAndIdFromParams, type NextParams } from '@/utils/params';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
    Clock, 
    MapPin, 
    Building, 
    Star, 
    Users, 
    CheckCircle, 
    XCircle, 
    BedDouble, 
    Plane, 
    Phone, 
    Mail, 
    Globe, 
    ArrowLeft, 
    Loader2,
    Calendar,
    Heart,
    Share,
    Award,
    Shield,
    Car,
    Utensils,
    Camera,
    Wifi,
    Coffee,
    Bath,
    CreditCard,
    Banknote,
    Tag,
    LogIn,
    Eye,
    Download,
    Play,
    ChevronLeft,
    ChevronRight,
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize,
    Minimize,
    Grid3X3,
    ImageIcon,
    StarIcon,
    MessageSquare,
    ThumbsUp,
    ThumbsDown,
    Filter,
    SortAsc,
    Info,
    AlertCircle,
    Plus,
    Minus,
    Sparkles,
    TrendingUp,
    Verified,
    Crown,
    Gift,
    Zap,
    Target,
    Compass,
    Mountain,
    Sunrise,
    Moon,
    Sun,
    Cloud,
    Umbrella,
    Thermometer
} from 'lucide-react';
import { getValidImageUrl } from '@/utils/image-helpers';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { getAuthToken } from '@/lib/auth.service';
import { useAuth } from '@/contexts/AuthContext';
// Enhanced PackageMap component with professional styling
const PackageMap = ({ lat, lng, t }: { lat?: number, lng?: number, t: any }) => {
    if (!lat || !lng) {
        return (
            <div className="h-96 bg-gradient-to-br from-primary/5 to-primary/20 rounded-2xl flex items-center justify-center border border-primary/20 shadow-elegant">
                <div className="text-center fade-in">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MapPin className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-elegant">{t('packages.locationNotAvailable')}</p>
                </div>
            </div>
        );
    }
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC2HIpCzLZoSwoCdTsOlDmEYGp8IXDGVQY';
    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;
    
    return (
        <div className="h-96 rounded-2xl overflow-hidden shadow-elegant border border-primary/20">
            <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={mapSrc}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="transition-all duration-300"
            ></iframe>
        </div>
    );
};

// Enhanced Feature Icon component
const FeatureIcon = ({ feature }: { feature: string }) => {
    const iconMap: { [key: string]: any } = {
        wifi: Wifi,
        transport: Car,
        meals: Utensils,
        meals_included: Utensils,
        accommodation: BedDouble,
        guide: Users,
        dedicated_guide: Users,
        camera: Camera,
        photography: Camera,
        coffee: Coffee,
        bath: Bath,
        plane: Plane,
        air_tickets: Plane,
        mountain: Mountain,
        sunrise: Sunrise,
        moon: Moon,
        sun: Sun,
        cloud: Cloud,
        umbrella: Umbrella,
        thermometer: Thermometer,
        visa_assistance: Shield,
        airport_transfer: Car,
        luxury_transport: Car,
        local_transportation: Car,
        makkah_visit: MapPin,
        madinah_visit: MapPin,
        ziyarat_places: MapPin
    };
    
    const IconComponent = iconMap[feature.toLowerCase()] || Award;
    
    return (
        <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full flex items-center justify-center">
            <IconComponent className="h-5 w-5 text-primary" />
        </div>
    );
};

// Enhanced Image Gallery Modal
const ImageGalleryModal = ({ 
    isOpen, 
    onClose, 
    images, 
    currentIndex, 
    setCurrentIndex, 
    packageName 
}: { 
    isOpen: boolean;
    onClose: () => void;
    images: any[];
    currentIndex: number;
    setCurrentIndex: (index: number) => void;
    packageName: string;
}) => {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleNext = () => {
        setCurrentIndex((currentIndex + 1) % images.length);
        setZoom(1);
        setRotation(0);
    };

    const handlePrevious = () => {
        setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
        setZoom(1);
        setRotation(0);
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
    const handleRotate = () => setRotation(prev => prev + 90);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-7xl max-h-[95vh] p-0 bg-black/95 border-0">
                <div className="relative h-[95vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
                        <div className="text-white">
                            <h3 className="text-lg font-semibold">{packageName}</h3>
                            <p className="text-sm text-gray-300">{currentIndex + 1} / {images.length}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomOut}
                                className="text-white hover:bg-white/20"
                            >
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleZoomIn}
                                className="text-white hover:bg-white/20"
                            >
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleRotate}
                                className="text-white hover:bg-white/20"
                            >
                                <RotateCw className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFullscreen(!isFullscreen)}
                                className="text-white hover:bg-white/20"
                            >
                                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-white hover:bg-white/20"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Main Image */}
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div className="relative max-w-full max-h-full">
                            <Image
                                src={getValidImageUrl(images[currentIndex]?.url)}
                                alt={`صورة ${currentIndex + 1}`}
                                width={1200}
                                height={800}
                                className="object-contain transition-all duration-300"
                                style={{
                                    transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                    maxWidth: '100%',
                                    maxHeight: '100%'
                                }}
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between absolute top-1/2 left-4 right-4 -translate-y-1/2 pointer-events-none">
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={handlePrevious}
                            className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-12 h-12"
                        >
                            <ChevronLeft className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={handleNext}
                            className="pointer-events-auto bg-black/50 hover:bg-black/70 text-white border-0 rounded-full w-12 h-12"
                        >
                            <ChevronRight className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
                        </Button>
                    </div>

                    {/* Thumbnails */}
                    <div className="p-4 bg-black/50 backdrop-blur-sm">
                        <ScrollArea className="w-full">
                            <div className="flex gap-2 pb-2">
                                {images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
                                            index === currentIndex 
                                                ? 'border-primary ring-2 ring-primary/50' 
                                                : 'border-transparent hover:border-white/50'
                                        }`}
                                    >
                                        <Image
                                            src={getValidImageUrl(image.url)}
                                            alt={`صورة ${index + 1}`}
                                            width={64}
                                            height={64}
                                            className="object-cover w-full h-full"
                                        />
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default function PackageDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const locale = params?.locale as string;
    const t = useTranslations();
    const [pkg, setPackage] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const { state: authState } = useAuth();
    const user = authState.user;
    const [activeTab, setActiveTab] = useState("overview");
        
    // Fix SessionPersistence hook usage
    const { 
        data: session,
        status: sessionStatus,
        isAuthenticated, 
        getUserData
    } = useSessionPersistence() as any;
    
    // Add getAuthToken function if it doesn't exist in useSessionPersistence
    const getAuthToken = () => {
        // Try to get token from session or localStorage
        const userSession = getUserData?.() || {};
        return userSession?.token || localStorage.getItem('auth_token') || '';
    };
    
    // Booking state
    const [numberOfPersons, setNumberOfPersons] = useState(1);
    const [selectedAccommodation, setSelectedAccommodation] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [isProcessingBooking, setIsProcessingBooking] = useState(false);
    const [userIsAuthenticated, setUserIsAuthenticated] = useState(false);
    
    // Passenger details
    const [passengers, setPassengers] = useState<any[]>([]);
    
    // استخدام toast
    const { toast } = useToast();
    
    // الحصول على بيانات المستخدم من useSessionPersistence
    const userData = getUserData();
    const isLoading = sessionStatus === 'loading' || !session;
    
    // التحقق من حالة المصادقة
    useEffect(() => {
            const isAuth = !!(userData || isAuthenticated);
        setUserIsAuthenticated(isAuth);
    }, [userData, isAuthenticated]);

    // حساب السعر الإجمالي المحدث والمحسن
    const calculateTotalPrice = () => {
        let basePrice = 0;
        
        // إذا كان هناك تسكين مختار، استخدم سعر التسكين
        if (selectedAccommodation && pkg?.accommodation_pricing && pkg.accommodation_pricing[selectedAccommodation]) {
            basePrice = pkg.accommodation_pricing[selectedAccommodation]?.price || 0;
        } else {
            // استخدام سعر الخصم إذا كان متاحًا، وإلا استخدم السعر الأساسي
            basePrice = pkg?.has_discount && pkg?.discount_price ? pkg.discount_price : (pkg?.price || 0);
        }
        
        // السعر الإجمالي قبل كوبون الخصم
        let totalPrice = basePrice * numberOfPersons;
        
        // تطبيق كوبون الخصم إذا وجد
        if (appliedCoupon) {
            if (appliedCoupon.discount_type === 'percentage') {
                const discountAmount = totalPrice * (appliedCoupon.discount_value / 100);
                totalPrice = totalPrice - discountAmount;
            } else {
                totalPrice = Math.max(0, totalPrice - appliedCoupon.discount_value);
            }
        }
        
        return Math.round(totalPrice * 100) / 100; // تقريب إلى منزلتين عشريتين
    };

    // حساب السعر الأساسي قبل الخصم لعرضه في الملخص
    const calculateBasePrice = () => {
        let basePrice = 0;
        
        if (selectedAccommodation && pkg?.accommodation_pricing && pkg.accommodation_pricing[selectedAccommodation]) {
            basePrice = pkg.accommodation_pricing[selectedAccommodation]?.price || 0;
        } else {
            basePrice = pkg?.price || 0;
        }
        
        return basePrice * numberOfPersons;
    };

    // حساب مقدار الخصم الكلي
    const calculateTotalDiscount = () => {
        let discountAmount = 0;
        
        // خصم الباقة إذا كان متاحًا
        if (pkg?.has_discount && pkg?.discount_price && pkg?.price && !selectedAccommodation) {
            discountAmount += (pkg.price - pkg.discount_price) * numberOfPersons;
        }
        
        // خصم الكوبون إذا كان متاحًا
        if (appliedCoupon) {
            const currentPrice = selectedAccommodation && pkg?.accommodation_pricing 
                ? pkg.accommodation_pricing[selectedAccommodation]?.price * numberOfPersons
                : (pkg?.has_discount && pkg?.discount_price ? pkg.discount_price : (pkg?.price || 0)) * numberOfPersons;
                
            if (appliedCoupon.discount_type === 'percentage') {
                discountAmount += currentPrice * (appliedCoupon.discount_value / 100);
            } else {
                discountAmount += appliedCoupon.discount_value;
            }
        }
        
        return Math.round(discountAmount * 100) / 100;
    };
    
    const totalPrice = calculateTotalPrice();
    const basePrice = calculateBasePrice();
    const totalDiscount = calculateTotalDiscount();

    // Initialize passengers when number changes
    useEffect(() => {
        const newPassengers = Array.from({ length: numberOfPersons }, (_, index) => {
            // احتفظ بالبيانات الموجودة إذا كانت متوفرة، وإلا أنشئ معتمر جديد
            if (passengers[index]) {
                return passengers[index];
            }
            return {
                name: '',
                passport_number: '',
                nationality: '',
                age: 30,
                phone: '',
                gender: 'male'
            };
        });
        setPassengers(newPassengers);
    }, [numberOfPersons]); // إزالة passengers من dependencies لتجنب infinite loop

    // Fetch package data
    useEffect(() => {
        if (id) {
            const getPackage = async () => {
                try {
                    setLoading(true);
                    const packageData = await fetchPackageById(id);
                    if (packageData) {
                        setPackage(packageData);
                        
                        // Set default accommodation if available
                        if (packageData?.accommodation_pricing && Object.keys(packageData.accommodation_pricing).length > 0) {
                            const firstAccommodation = Object.keys(packageData.accommodation_pricing)[0];
                            setSelectedAccommodation(firstAccommodation);
                        }
                    } else {
                        console.error('Package not found');
                    }
                } catch (error) {
                    console.error('Error fetching package:', error);
                } finally {
                    setLoading(false);
                }
            };

            getPackage();
        }
    }, [id]);

    // Handlers
    const handleAccommodationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAccommodation(e.target.value);
    };

    const decrementPersons = () => {
        const newCount = Math.max(1, numberOfPersons - 1);
        console.log('Decrementing persons from', numberOfPersons, 'to', newCount);
        setNumberOfPersons(newCount);
    };

    const incrementPersons = () => {
        // If max_persons is 0 or not set, consider it as unlimited
        const isUnlimitedCapacity = !pkg?.max_persons || pkg.max_persons === 0;
        
        // Get the available seats, treating 0 as unlimited
        const availableSeats = pkg?.available_seats_count || 0;
        const isUnlimitedSeats = availableSeats === 0;
        
        // Calculate the new count
        let newCount = numberOfPersons + 1;
        
        // Apply limits only if not unlimited
        if (!isUnlimitedCapacity && pkg?.max_persons) {
            newCount = Math.min(newCount, pkg.max_persons);
        }
        
        // Apply available seats limit only if not unlimited
        if (!isUnlimitedSeats && availableSeats > 0) {
            newCount = Math.min(newCount, availableSeats);
        }
        
        console.log('Incrementing persons from', numberOfPersons, 'to', newCount);
        setNumberOfPersons(newCount);
    };

    // تحديث دالة تحديث بيانات المعتمر
    const updatePassenger = (index: number, field: string, value: any) => {
        console.log('Updating passenger', index, field, value);
        setPassengers(prevPassengers => {
            const newPassengers = [...prevPassengers];
            if (newPassengers[index]) {
                newPassengers[index] = {
                    ...newPassengers[index],
                    [field]: value
                };
            }
            return newPassengers;
        });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setCouponError(t('packages.enterCouponCode'));
            return;
        }

        if (!userIsAuthenticated) {
            toast({
                title: t('packages.loginRequired'),
                description: t('packages.loginRequiredDesc'),
                variant: 'destructive'
            });
            return;
        }

        setIsApplyingCoupon(true);
        setCouponError('');

        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No access token found');
            }

            // حساب المبلغ الصحيح للكوبون - يجب أن يكون المبلغ قبل تطبيق أي كوبون
            const currentAmount = selectedAccommodation && pkg?.accommodation_pricing 
                ? (pkg.accommodation_pricing[selectedAccommodation]?.price || 0) * numberOfPersons
                : (pkg?.has_discount && pkg?.discount_price ? pkg.discount_price : (pkg?.price || 0)) * numberOfPersons;

            const response = await axios.post(
                `${API_BASE_CONFIG.BASE_URL}/user/coupons/validate`, 
                {
                    code: couponCode,
                    amount: currentAmount
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.status === true || response.data.success) {
                setAppliedCoupon(response.data.data);
                toast({
                    title: t('packages.couponApplied'),
                    description: t('packages.couponAppliedDesc') || `تم تطبيق كود الخصم ${couponCode} بنجاح`,
                });
            } else {
                setCouponError(response.data.message || t('packages.invalidCoupon'));
            }
        } catch (error: any) {
            console.error('Coupon validation error:', error);
            setCouponError(error.response?.data?.message || t('packages.couponError'));
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    // دالة فحص حالة الدفع
    const checkPaymentStatus = async (paymentId: string) => {
        try {
            const token = getAuthToken();
            if (!token) {
                throw new Error('No access token found');
            }

            const response = await axios.get(
                `${API_BASE_CONFIG.BASE_URL}/payments/${paymentId}/status`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return response.data;
        } catch (error) {
            console.error('Payment status check error:', error);
            return null;
        }
    };

    const handleBookNow = async () => {
        // التحقق من تسجيل الدخول
        if (!userIsAuthenticated) {
            toast({
                title: t('packages.loginRequired') || 'تسجيل الدخول مطلوب',
                description: t('packages.loginRequiredBooking') || 'يجب تسجيل الدخول أولاً لإتمام الحجز',
                variant: 'destructive'
            });
            router.push(`/${locale}/auth/login`);
            return;
        }

        // التحقق من صحة بيانات المعتمرين
        const isValidPassengers = passengers.every(passenger => 
            passenger.name?.trim() && 
            passenger.passport_number?.trim() && 
            passenger.nationality?.trim() && 
            passenger.age > 0 && 
            passenger.phone?.trim() && 
            passenger.gender
        );

        if (!isValidPassengers) {
            toast({
                title: t('packages.incompletePassengerData') || 'بيانات غير مكتملة',
                description: t('packages.fillAllFields') || 'يرجى ملء جميع بيانات المعتمرين',
                variant: 'destructive'
            });
            return;
        }

        // التحقق من توفر المقاعد
        if ((pkg?.available_seats_count || 0) < numberOfPersons) {
            toast({
                title: t('packages.insufficientSeats') || 'مقاعد غير كافية',
                description: t('packages.onlySeatsAvailable') || `يتوفر فقط ${pkg?.available_seats_count} مقعد`,
                variant: 'destructive'
            });
            return;
        }

        setIsProcessingBooking(true);

        try {
            // إعداد بيانات الحجز المحدثة والمحسنة
            const bookingData: any = {
                package_id: pkg?.id,
                booking_date: new Date().toISOString().split('T')[0],
                number_of_persons: numberOfPersons,
                booking_type: 'package',
                payment_method_id: paymentMethod === 'cash' ? 1 : 2,
                passengers: passengers.map(p => ({
                    name: p.name.trim(),
                    passport_number: p.passport_number.trim(),
                    nationality: p.nationality.trim(),
                    gender: p.gender,
                    age: parseInt(p.age.toString()),
                    phone: p.phone.trim()
                }))
            };

            // إضافة معرف التسكين إذا كان مختاراً
            if (selectedAccommodation && pkg?.accommodation_pricing && pkg.accommodation_pricing[selectedAccommodation]) {
                bookingData.accommodation_id = selectedAccommodation;
            }

            // إضافة كود الكوبون إذا وجد
            if (appliedCoupon?.code) {
                bookingData.coupon_code = appliedCoupon.code;
            }

            // الحصول على token
                const token = getAuthToken();
            if (!token) {
                throw new Error('رمز المصادقة غير موجود');
            }

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            console.log('📤 بيانات الحجز المرسلة:', bookingData);

            // إرسال طلب الحجز
            const response = await axios.post(
                `${API_BASE_CONFIG.BASE_URL}/user/bookings`, 
                bookingData,
                { headers }
            );

            console.log('📥 استجابة الحجز:', response.data);

            if (response.data.status === true || response.data.success) {
                const bookingId = response.data.data?.id || response.data.id;
                
                if (paymentMethod === 'cash') {
                    // الدفع نقداً - إظهار رسالة نجاح
                    toast({
                        title: t('packages.bookingSuccess') || 'تم الحجز بنجاح',
                        description: t('packages.cashBookingSuccess') || 'تم إنشاء حجزك بنجاح. يرجى دفع المبلغ للمكتب.',
                    });
                    
                    // تطبيق الكوبون بعد نجاح الحجز إذا وجد
                    if (appliedCoupon?.code) {
                        try {
                            await axios.post(
                                `${API_BASE_CONFIG.BASE_URL}/user/coupons/apply`,
                                {
                                    booking_id: bookingId,
                                    code: appliedCoupon.code
                                },
                                { headers }
                            );
                            console.log('✅ تم تطبيق الكوبون بنجاح');
                        } catch (couponError) {
                            console.error('❌ خطأ في تطبيق الكوبون:', couponError);
                            // لا نعرض خطأ للمستخدم هنا لأن الحجز نجح
                        }
                    }
                    
                    // الانتقال لصفحة الحجوزات
                   
                    
                } else {
                    // الدفع الإلكتروني عبر جيديا
                    const paymentData = {
                        booking_id: bookingId,
                        amount: parseFloat(totalPrice.toFixed(2)),
                        customer_email: user?.email || passengers[0]?.email || `user${bookingId}@umrahgo.net`,
                        customer_name: user?.name || passengers[0]?.name || 'UmrahGo Customer',
                        customer_phone: user?.phone || passengers[0]?.phone || '+966500000000',
                        language: locale === 'ar' ? 'ar' : 'en',
                        return_url: `${ADMIN_WEB_URL}/payment/success?booking_id=${bookingId}`,
                        cancel_url: `${ADMIN_WEB_URL}/payment/cancelled?booking_id=${bookingId}`
                    };
                    
                    console.log('💳 بيانات الدفع:', paymentData);
                    
                    // تطبيق الكوبون قبل الانتقال للدفع إذا وجد
                    if (appliedCoupon?.code) {
                        try {
                            await axios.post(
                                `${API_BASE_CONFIG.BASE_URL}/user/coupons/apply`,
                                {
                                    booking_id: bookingId,
                                    code: appliedCoupon.code
                                },
                                { headers }
                            );
                            console.log('✅ تم تطبيق الكوبون قبل الدفع');
                        } catch (couponError) {
                            console.error('❌ خطأ في تطبيق الكوبون:', couponError);
                        }
                    }
                    
                    // بدء عملية الدفع
                    const paymentResponse = await axios.post(
                        `${API_BASE_CONFIG.BASE_URL}/geidea/payments/initiate`,
                        paymentData,
                        { headers }
                    );
                    
                    console.log('💳 استجابة بدء الدفع:', paymentResponse.data);
                    
                    const redirectUrl = paymentResponse.data?.data?.checkout_url || paymentResponse.data?.checkout_url;
                    
                    if (redirectUrl) {
                        // الانتقال لصفحة الدفع
                        window.location.href = redirectUrl;
                    } else {
                        throw new Error('رابط الدفع غير متوفر');
                    }
                }
            } else {
                throw new Error(response.data?.message || 'فشل في إنشاء الحجز');
            }
        } catch (error: any) {
            console.error('❌ خطأ في الحجز:', error);
            
            let errorMessage = 'حدث خطأ أثناء الحجز';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            toast({
                title: t('packages.bookingError') || 'خطأ في الحجز',
                description: errorMessage,
                variant: 'destructive'
            });
        } finally {
            setIsProcessingBooking(false);
           
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-primary/5 to-background">
                <div className="text-center fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-elegant-heading">{t('packages.loading')}</h2>
                    <p className="text-muted-foreground text-elegant">{t('packages.loadingDesc')}</p>
                </div>
            </div>
        );
    }

    // Package not found
    if (!pkg) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-primary/5 to-background">
                <div className="text-center fade-in">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <XCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-elegant-heading">{t('packages.notFound')}</h2>
                    <p className="text-muted-foreground mb-6 text-elegant">{t('packages.notFoundDesc')}</p>
                    <Button onClick={() => router.back()} variant="outline" className="btn-gradient-primary">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {t('packages.backToPackages')}
                    </Button>
                </div>
            </div>
        );
    }
    
    // Safely parse features
    let features = {};
    try {
        if (pkg.features) {
           features = typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features;
        }
    } catch(e) {
        console.error("Failed to parse package features", e);
    }

    // Prepare images array
    const allImages = [
        { url: pkg.featured_image_url, alt: pkg.name },
        ...(pkg.images || [])
    ].filter(img => img.url);

    const renderRatingStars = (rating: number) => {
        return Array.from({ length: 5 }).map((_, index) => (
            <Star 
                key={index} 
                className={`h-4 w-4 ${index < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
            />
        ));
    };

    // Improve feature display by properly handling string "false"/"true" values
    const parseFeatures = (features: any): Record<string, boolean | string> => {
        if (!features) return {};
        
        const parsedFeatures: Record<string, boolean | string> = {};
        
        Object.entries(features).forEach(([key, value]) => {
            // Handle string "true" and "false" values
            if (value === "true" || value === true) {
                parsedFeatures[key] = true;
            } else if (typeof value === "string" && value !== "false" && value !== "") {
                // Only add non-false string values
                parsedFeatures[key] = value;
            }
            // Skip "false" values entirely
        });
        
        return parsedFeatures;
    };

    // Add translation for mobile tab labels
    const getMobileTabLabel = (tabName: string, t: any) => {
        const tabLabels: Record<string, string> = {
            overview: t('packages.overviewShort') || 'نظرة',
            itinerary: t('packages.itineraryShort') || 'البرنامج',
            accommodation: t('packages.accommodationShort') || 'الإقامة',
            reviews: t('packages.reviewsShort') || 'التقييم',
            office: t('packages.officeShort') || 'المكتب'
        };
        
        return tabLabels[tabName] || tabName;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-x-hidden">
            {/* Enhanced Header with Breadcrumb */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-800/95 backdrop-blur-sm shadow-lg border-b border-gray-700 sticky top-0 z-40"
            >
                <div className="container mx-auto px-3 md:px-4 lg:px-6 py-3 md:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 md:gap-3">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => router.back()}
                                className="text-gray-300 hover:text-primary hover:bg-primary/20 rounded-xl transition-all duration-300 text-xs md:text-sm"
                            >
                                <ArrowLeft className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="hidden sm:inline">{t('packages.backToPackages') || 'العودة للباقات'}</span>
                            </Button>
                            <div className="text-xs md:text-sm text-gray-400 hidden lg:block">
                                <span>{t('nav.home') || 'الرئيسية'}</span>
                                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 inline mx-1" />
                                <span>{t('nav.packages') || 'الباقات'}</span>
                                <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 inline mx-1" />
                                <span className="text-primary font-medium truncate max-w-[200px]">{pkg.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 md:gap-2">
                            <Button size="sm" variant="outline" className="text-gray-300 hover:bg-primary/20 border-gray-600 rounded-xl text-xs md:text-sm hidden md:flex">
                                <Share className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="hidden lg:inline">{t('packages.sharePackage') || 'مشاركة'}</span>
                            </Button>
                            <Button size="sm" variant="outline" className="text-gray-300 hover:bg-primary/20 border-gray-600 rounded-xl text-xs md:text-sm hidden md:flex">
                                <Heart className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                                <span className="hidden lg:inline">{t('packages.savePackage') || 'حفظ'}</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Enhanced Hero Section */}
            <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative"
            >
                <div className="container mx-auto px-3 md:px-4 lg:px-6 py-4 md:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6 lg:gap-8">
                        {/* Left Content */}
                        <div className="lg:col-span-8 space-y-4 md:space-y-6 lg:space-y-8">
                            {/* Enhanced Image Gallery */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6 }}
                                className="relative mb-8"
                            >
                                                                        <div className="grid grid-cols-4 gap-2 md:gap-4 h-[300px] md:h-[400px] lg:h-[500px]">
                                    {/* Main Image */}
                                    <div className="col-span-3 image-gallery-main">
                                        <Image 
                                            src={getValidImageUrl(allImages[currentImageIndex]?.url)} 
                                            alt={pkg.name}
                                            fill
                                            className="object-cover transition-transform duration-500 hover:scale-105"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                                        
                                        {/* Image Navigation */}
                                        {allImages.length > 1 && (
                                            <AnimatePresence>
                                                <motion.button
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    onClick={() => setCurrentImageIndex((prev) => prev === 0 ? allImages.length - 1 : prev - 1)}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover: rounded-full flex items-center justify-center shadow-elegant hover:shadow-elegant-hover transition-all duration-300 group"
                                                >
                                                    <ChevronLeft className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
                                                </motion.button>
                                                <motion.button
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    onClick={() => setCurrentImageIndex((prev) => prev === allImages.length - 1 ? 0 : prev + 1)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover: rounded-full flex items-center justify-center shadow-elegant hover:shadow-elegant-hover transition-all duration-300 group"
                                                >
                                                    <ChevronRight className="h-6 w-6 text-gray-700 group-hover:text-primary transition-colors" />
                                                </motion.button>
                                            </AnimatePresence>
                                        )}
                                        
                                        {/* View All Photos Button */}
                                        <div className="absolute bottom-4 right-4">
                                            <Button 
                                                size="sm" 
                                                className="bg-white/90 hover: text-gray-800 shadow-elegant hover:shadow-elegant-hover transition-all duration-300 rounded-xl"
                                                onClick={() => setIsGalleryOpen(true)}
                                            >
                                                <Eye className="h-4 w-4 mr-2" />
                                                {t('packages.viewAllPhotos')} ({allImages.length})
                                            </Button>
                                        </div>
                                    </div>
                
                                    {/* Thumbnail Grid */}
                                    <div className="col-span-1 flex flex-col gap-4">
                                        {allImages.slice(1, 5).map((image, index) => (
                                            <motion.div 
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.1 }}
                                                className={`image-gallery-thumbnail ${
                                                    currentImageIndex === index + 1 ? 'active' : ''
                                                }`}
                                                onClick={() => setCurrentImageIndex(index + 1)}
                                            >
                                                <Image 
                                                    src={getValidImageUrl(image.url)} 
                                                    alt={`صورة ${index + 2}`}
                                                    fill
                                                    className="object-cover transition-transform duration-300 hover:scale-110"
                                                />
                                                {index === 3 && allImages.length > 5 && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-xl">
                                                        <span className="text-white font-bold text-lg">+{allImages.length - 5}</span>
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Enhanced Package Info Header */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="mb-8"
                            >
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    {pkg.is_featured && (
                                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 shadow-elegant">
                                            <Award className="h-3 w-3 mr-1" />
                                            {t('packages.featuredPackage')}
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="bg-blue-900/50 text-blue-300 border-blue-600 hover:bg-blue-800/50 transition-colors">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {pkg.duration_days || 1} {t('packages.days')}
                                    </Badge>
                                    <Badge variant="outline" className="bg-green-900/50 text-green-300 border-green-600 hover:bg-green-800/50 transition-colors">
                                        <Users className="h-3 w-3 mr-1" />
                                        {pkg.available_seats_count} {t('packages.seatsAvailable')}
                                    </Badge>
                                    {pkg.has_discount && (
                                        <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 shadow-elegant">
                                            <Gift className="h-3 w-3 mr-1" />
                                            {t('packages.specialOffer')}
                                        </Badge>
                                    )}
                                </div>
                            
                                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight text-elegant-heading gradient-text">
                                    {pkg.name}
                                </h1>
                            
                                <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-4">
                                    <div className="flex items-center gap-2 hover:text-primary transition-colors">
                                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                            <Building className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium text-elegant">{pkg.office?.office_name}</span>
                                    </div>
                                    
                                    {pkg.start_date && (
                                        <div className="flex items-center gap-2 hover:text-primary transition-colors">
                                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                                <Calendar className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-elegant">{new Date(pkg.start_date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}</span>
                                        </div>
                                    )}
                                    
                                    {pkg.start_location && (
                                        <div className="flex items-center gap-2 hover:text-primary transition-colors">
                                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                                <MapPin className="h-4 w-4 text-primary" />
                                            </div>
                                            <span className="text-elegant">{pkg.start_location}</span>
                                        </div>
                                    )}
                                </div>
                            
                                {/* Enhanced Rating */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-1">
                                        {renderRatingStars(pkg.rating_info?.average_rating || 5)}
                                    </div>
                                    <span className="font-bold text-lg text-white text-elegant">{pkg.rating_info?.average_rating || '5.0'}</span>
                                    <span className="text-gray-400 text-elegant">({pkg.rating_info?.total_reviews || 0} {t('packages.reviews')})</span>
                                    <Badge variant="outline" className="bg-yellow-900/50 text-yellow-300 border-yellow-600">
                                        <Verified className="h-3 w-3 mr-1" />
                                        {t('packages.verified')}
                                    </Badge>
                                </div>
                            </motion.div>

                            {/* Enhanced Tabs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.3 }}
                            >
                                <Tabs 
                                    defaultValue="overview" 
                                    value={activeTab}
                                    onValueChange={setActiveTab}
                                    className="w-full"
                                >
                                    <TabsList className="grid grid-cols-5 mb-4 bg-gray-800 border border-gray-700 p-1 rounded-xl">
                                        <TabsTrigger 
                                            value="overview" 
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg py-2"
                                        >
                                            <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                                                <Info className="h-4 w-4" />
                                                <span className="hidden sm:inline">{t('packages.overview')}</span>
                                                <span className="text-xs sm:hidden">{getMobileTabLabel('overview', t)}</span>
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="itinerary" 
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg py-2"
                                        >
                                            <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                                                <Compass className="h-4 w-4" />
                                                <span className="hidden sm:inline">{t('packages.itinerary')}</span>
                                                <span className="text-xs sm:hidden">{getMobileTabLabel('itinerary', t)}</span>
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="accommodation" 
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg py-2"
                                        >
                                            <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                                                <BedDouble className="h-4 w-4" />
                                                <span className="hidden sm:inline">{t('packages.accommodation')}</span>
                                                <span className="text-xs sm:hidden">{getMobileTabLabel('accommodation', t)}</span>
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="reviews" 
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg py-2"
                                        >
                                            <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                                                <MessageSquare className="h-4 w-4" />
                                                <span className="hidden sm:inline">{t('packages.reviews')}</span>
                                                <span className="text-xs sm:hidden">{getMobileTabLabel('reviews', t)}</span>
                                            </span>
                                        </TabsTrigger>
                                        <TabsTrigger 
                                            value="office" 
                                            className="data-[state=active]:bg-primary data-[state=active]:text-white rounded-lg py-2"
                                        >
                                            <span className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                                                <Building className="h-4 w-4" />
                                                <span className="hidden sm:inline">{t('packages.officeInfo')}</span>
                                                <span className="text-xs sm:hidden">{getMobileTabLabel('office', t)}</span>
                                            </span>
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Overview Tab */}
                                    <TabsContent value="overview" className="mt-4">
                                        <div className="space-elegant">
                                            <Card className="card-elegant bg-gray-800 border-gray-700">
                                                <CardHeader>
                                                    <CardTitle className="flex items-center gap-3 text-white text-elegant-heading">
                                                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                                            <Info className="h-4 w-4 text-primary" />
                                                        </div>
                                                        {t('packages.packageDescription')}
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-gray-300 leading-relaxed mb-6 text-elegant">
                                                        {pkg.description || t('packages.noDescription')}
                                                    </p>
                                                    
                                                    {/* Enhanced Features */}
                                                    {Object.keys(features).length > 0 && (
                                                        <div className="mb-6">
                                                            <h4 className="font-semibold text-lg mb-4 text-white text-elegant-heading flex items-center gap-2">
                                                                <Sparkles className="h-5 w-5 text-primary" />
                                                                {t('packages.includedFeatures')}
                                                            </h4>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                                                {Object.entries(features).filter(([_, value]) => {
                                                                    // Show only features that have true values
                                                                    return value === true || value === "true";
                                                                }).map(([key, _]) => (
                                                                    <motion.div 
                                                                        key={key}
                                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                                        animate={{ opacity: 1, scale: 1 }}
                                                                        transition={{ duration: 0.3 }}
                                                                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-xl border border-green-600 hover:shadow-md transition-all duration-300"
                                                                    >
                                                                        <FeatureIcon feature={key} />
                                                                        <span className="text-sm font-medium text-green-300 text-elegant">
                                                                            {t(`packages.featuresList.${key}`) || key.replace(/_/g, ' ')}
                                                                        </span>
                                                                    </motion.div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Price Breakdown */}
                                                    <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-blue-600">
                                                        <h4 className="font-semibold text-lg mb-4 text-blue-300 text-elegant-heading flex items-center gap-2">
                                                            <TrendingUp className="h-5 w-5" />
                                                            {t('packages.priceBreakdown')}
                                                        </h4>
                                                        <div className="space-y-3">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-blue-300 text-elegant">{t('packages.basePrice')}</span>
                                                                <span className="font-bold text-blue-200">{pkg.price?.toLocaleString()} {t('packages.currency')}</span>
                                                            </div>
                                                                                                        {pkg.has_discount && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-green-300 text-elegant">{t('packages.discount')}</span>
                                                    <span className="font-bold text-green-200">-{pkg.discount_price && pkg.price ? Math.round(((pkg.price - pkg.discount_price) / pkg.price) * 100) : 0}%</span>
                                                </div>
                                            )}
                                                            <Separator className="bg-blue-600" />
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-blue-200 font-semibold text-elegant">{t('packages.finalPrice')}</span>
                                                                <span className="font-bold text-xl text-blue-100">{pkg.price?.toLocaleString()} {t('packages.currency')}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </TabsContent>

                                    {/* Itinerary Tab */}
                                    <TabsContent value="itinerary" className="mt-4">
                                        <Card className="card-elegant bg-gray-800 border-gray-700">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-3 text-white text-elegant-heading">
                                                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                                        <Compass className="h-4 w-4 text-primary" />
                                                    </div>
                                                    {t('packages.detailedItinerary')}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {pkg.hotels && pkg.hotels.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {pkg.hotels.map((hotel: any, index: number) => (
                                                            <motion.div 
                                                                key={index}
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className="flex gap-4 p-6 bg-gradient-to-r from-gray-700 to-slate-700 rounded-xl border border-gray-600 hover:shadow-md transition-all duration-300"
                                                            >
                                                                <div className="flex-shrink-0">
                                                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center font-bold">
                                                                        {index + 1}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-bold text-lg mb-2 text-white text-elegant-heading">
                                                                        {hotel.name || `${t('packages.day')} ${index + 1}`}
                                                                    </h4>
                                                                    <p className="text-gray-300 mb-3 text-elegant">{hotel.description || t('packages.noDescription')}</p>
                                                                    {hotel.amenities && hotel.amenities.length > 0 && (
                                                                        <div className="space-y-2">
                                                                            {hotel.amenities.map((amenity: string, actIndex: number) => (
                                                                                <div key={actIndex} className="flex items-center gap-2">
                                                                                    <CheckCircle className="h-4 w-4 text-green-400" />
                                                                                    <span className="text-sm text-gray-300 text-elegant">{amenity}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <Compass className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-400 text-elegant">{t('packages.noItinerary')}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Accommodation Tab */}
                                    <TabsContent value="accommodation" className="mt-4">
                                        <Card className="card-elegant bg-gray-800 border-gray-700">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-3 text-white text-elegant-heading">
                                                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                                        <BedDouble className="h-4 w-4 text-primary" />
                                                    </div>
                                                    {t('packages.accommodationDetails')}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {pkg.hotels && pkg.hotels.length > 0 ? (
                                                    <div className="space-y-8">
                                                        {pkg.hotels.map((accommodation: any, index: number) => (
                                                            <motion.div 
                                                                key={index}
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className="p-6 bg-gradient-to-br from-gray-700 to-gray-600 rounded-xl border border-gray-600 hover:shadow-lg transition-all duration-300"
                                                            >
                                                                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-12 h-12 bg-blue-800 rounded-full flex items-center justify-center">
                                                                            <BedDouble className="h-6 w-6 text-blue-300" />
                                                                        </div>
                                                                        <h4 className="font-bold text-lg md:text-xl text-white text-elegant-heading">{accommodation.name}</h4>
                                                                    </div>
                                                                    <div className="ml-auto flex items-center">
                                                                        <div className="flex">
                                                                            {[...Array(Math.floor(accommodation.rating || 0))].map((_, i) => (
                                                                                <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                                            ))}
                                                                            {[...Array(5 - Math.floor(accommodation.rating || 0))].map((_, i) => (
                                                                                <Star key={i} className="h-4 w-4 text-gray-400" />
                                                                            ))}
                                                                        </div>
                                                                        <span className="text-sm text-gray-300 text-elegant ml-2">
                                                                            ({accommodation.rating} {t('packages.stars')})
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                    <div className="space-y-4">
                                                                        <p className="text-gray-300 text-elegant">{accommodation.description}</p>
                                                                        
                                                                        <div className="space-y-3 mt-4">
                                                                            <div className="flex items-center gap-2">
                                                                                <MapPin className="h-4 w-4 text-red-400" />
                                                                                <span className="text-sm text-gray-300 text-elegant">{accommodation.address || accommodation.location}</span>
                                                                            </div>
                                                                            
                                                                            {accommodation.distance_to_haram && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <Compass className="h-4 w-4 text-green-400" />
                                                                                    <span className="text-sm text-gray-300 text-elegant">
                                                                                        {t('packages.distanceToHaram')}: {accommodation.distance_to_haram}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {accommodation.room_types && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <BedDouble className="h-4 w-4 text-blue-400" />
                                                                                    <span className="text-sm text-gray-300 text-elegant">
                                                                                        {t('packages.roomTypes')}: {accommodation.room_types}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            
                                                                            {accommodation.contact && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <Phone className="h-4 w-4 text-primary" />
                                                                                    <span className="text-sm text-gray-300 text-elegant">
                                                                                        {accommodation.contact}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        {accommodation.amenities && accommodation.amenities.length > 0 && (
                                                                            <div className="mt-6">
                                                                                <h5 className="font-medium text-white mb-3">{t('packages.hotelAmenities')}</h5>
                                                                                <div className="grid grid-cols-2 gap-2">
                                                                                    {accommodation.amenities.map((amenity: string, aIndex: number) => (
                                                                                        <div key={aIndex} className="flex items-center gap-2 p-2 rounded-lg bg-gray-700/50">
                                                                                            <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                                                                                            <span className="text-xs text-gray-300 text-elegant">{amenity}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <div className="space-y-4">
                                                                        <div className="relative h-[200px] rounded-xl overflow-hidden">
                                                                            {accommodation.latitude && accommodation.longitude ? (
                                                                                <PackageMap
                                                                                    lat={accommodation.latitude}
                                                                                    lng={accommodation.longitude}
                                                                                    t={t}
                                                                                />
                                                                            ) : (
                                                                                <div className="w-full h-full flex items-center justify-center bg-gray-700 rounded-xl">
                                                                                    <MapPin className="h-8 w-8 text-gray-500" />
                                                                                    <span className="text-gray-400 ml-2">{t('packages.noMapData')}</span>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        
                                                                        {accommodation.images && accommodation.images.length > 0 && (
                                                                            <div className="grid grid-cols-2 gap-2 mt-4">
                                                                                {accommodation.images.slice(0, 4).map((image: any, imgIndex: number) => (
                                                                                    <div key={imgIndex} className="relative h-20 rounded-lg overflow-hidden">
                                                                                        <Image
                                                                                            src={getValidImageUrl(image.url)}
                                                                                            alt={`${accommodation.name} - ${imgIndex + 1}`}
                                                                                            fill
                                                                                            className="object-cover"
                                                                                        />
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                        
                                                        {/* Improved Accommodation Pricing Display */}
                                                        {pkg.formatted_accommodation_pricing && pkg.formatted_accommodation_pricing.length > 0 && (
                                                            <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-xl p-6 border border-blue-600 mb-6">
                                                                <h4 className="font-semibold text-lg mb-4 text-blue-300 text-elegant-heading flex items-center gap-2">
                                                                    <BedDouble className="h-5 w-5" />
                                                                    {t('packages.accommodationPricing')}
                                                                </h4>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    {pkg.formatted_accommodation_pricing.map((pricing: any) => (
                                                                        <div 
                                                                            key={pricing.key} 
                                                                            className="p-4 bg-blue-800/30 border border-blue-700/50 rounded-lg flex items-center justify-between"
                                                                        >
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                                                                                    <Users className="h-4 w-4 text-blue-200" />
                                                                                </div>
                                                                                <div>
                                                                                    <div className="font-medium text-blue-200">{pricing.name} ({pricing.type})</div>
                                                                                    <div className="text-sm text-blue-300">{t('packages.roomCapacity')}</div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-lg font-bold text-blue-100">{pricing.formatted_price}</div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : pkg.includes_accommodation ? (
                                                    <div className="p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700">
                                                        <div className="text-center py-8">
                                                            <div className="w-16 h-16 bg-blue-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                                <BedDouble className="h-8 w-8 text-blue-300" />
                                                            </div>
                                                            <h4 className="text-xl font-semibold text-blue-300 mb-2">
                                                                {t('packages.accommodationIncluded') || 'تتضمن الباقة إقامة'}
                                                            </h4>
                                                            <p className="text-blue-200 mb-4">
                                                                {t('packages.accommodationDetailsNotAvailable') || 'تفاصيل الإقامة غير متوفرة حالياً، يرجى التواصل مع المكتب للمزيد من المعلومات.'}
                                                            </p>
                                                            
                                                            {/* Accommodation Pricing Display when no hotels but pricing exists */}
                                                            {pkg.formatted_accommodation_pricing && pkg.formatted_accommodation_pricing.length > 0 && (
                                                                <div className="bg-blue-800/30 rounded-xl p-6 border border-blue-700/50 max-w-2xl mx-auto my-6">
                                                                    <h5 className="font-semibold text-lg mb-4 text-blue-300">{t('packages.availableAccommodationOptions')}</h5>
                                                                    <div className="grid grid-cols-1 gap-3">
                                                                        {pkg.formatted_accommodation_pricing.map((pricing: any) => (
                                                                            <div 
                                                                                key={pricing.key} 
                                                                                className="p-3 bg-blue-800/30 border border-blue-700/50 rounded-lg flex items-center justify-between"
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    <Users className="h-4 w-4 text-blue-300" />
                                                                                    <span className="text-blue-200">{pricing.name} ({pricing.type})</span>
                                                                                </div>
                                                                                <span className="font-bold text-blue-100">{pricing.formatted_price}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            
                                                            <Button 
                                                                variant="outline" 
                                                                className="border-blue-500 hover:bg-blue-900/50 text-blue-300"
                                                                onClick={() => setActiveTab('office')}
                                                            >
                                                                <Phone className="h-4 w-4 mr-2" />
                                                                {t('packages.contactOffice') || 'التواصل مع المكتب'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <BedDouble className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-400 text-elegant">{t('packages.noAccommodation')}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Reviews Tab */}
                                    <TabsContent value="reviews" className="mt-4">
                                        <Card className="card-elegant bg-gray-800 border-gray-700">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-3 text-white text-elegant-heading">
                                                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                                        <MessageSquare className="h-4 w-4 text-primary" />
                                                    </div>
                                                    {t('packages.customerReviews')}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {/* Rating Summary */}
                                                <div className="flex flex-col md:flex-row gap-8 items-center mb-8 p-6 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 rounded-xl border border-yellow-600">
                                                    <div className="text-center md:w-1/3">
                                                        <div className="text-6xl font-bold text-yellow-300 mb-3">
                                                            {pkg.rating_info?.average_rating || '5.0'}
                                                        </div>
                                                        <div className="flex justify-center mb-3">
                                                            {renderRatingStars(pkg.rating_info?.average_rating || 5)}
                                                        </div>
                                                        <p className="text-yellow-300 text-lg font-semibold">
                                                            {pkg.rating_info?.total_reviews || 0} {t('packages.reviews')}
                                                        </p>
                                                    </div>
                                                    
                                                    <div className="flex-1 space-y-3 w-full md:w-2/3">
                                                        {pkg.rating_info?.rating_breakdown && Object.entries(pkg.rating_info.rating_breakdown).reverse().map(([rating, count]) => (
                                                            <div key={rating} className="flex items-center gap-4">
                                                                <div className="w-12 text-sm font-medium text-yellow-300">{rating} ★</div>
                                                                <div className="flex-1 h-4 bg-yellow-700 rounded-full overflow-hidden">
                                                                    <motion.div 
                                                                        initial={{ width: 0 }}
                                                                        animate={{ width: `${(pkg.rating_info?.total_reviews || 0) > 0 
                                                                            ? (Number(count) / (pkg.rating_info?.total_reviews || 1)) * 100 
                                                                            : 0}%` }}
                                                                        transition={{ duration: 1, delay: 0.5 }}
                                                                        className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                                                                    />
                                                                </div>
                                                                <div className="w-12 text-sm text-yellow-300 text-right">
                                                                    {count}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                {/* Individual Reviews */}
                                                {pkg.reviews && pkg.reviews.length > 0 ? (
                                                    <div className="space-y-6">
                                                        <h4 className="font-bold text-xl mb-6 text-white text-elegant-heading">{t('packages.latestReviews')}</h4>
                                                        {pkg.reviews.map((review: any, index: number) => (
                                                            <motion.div 
                                                                key={index}
                                                                initial={{ opacity: 0, y: 20 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className="p-6 rounded-xl bg-gradient-to-r from-gray-700 to-slate-700 border border-gray-600 hover:shadow-md transition-all duration-300"
                                                            >
                                                                <div className="flex items-center gap-4 mb-4">
                                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                                                                        <Users className="h-6 w-6 text-white" />
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="font-semibold text-lg text-white text-elegant-heading">{review.user_name || t('packages.user')}</h5>
                                                                        <div className="flex items-center gap-1">
                                                                            {renderRatingStars(review.rating || 5)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="mr-auto text-sm text-gray-400">
                                                                        {new Date(review.created_at || Date.now()).toLocaleDateString()}
                                                                    </div>
                                                                </div>
                                                                <p className="text-gray-300 leading-relaxed text-elegant">{review.comment}</p>
                                                                <div className="flex items-center gap-4 mt-4">
                                                                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-green-400">
                                                                        <ThumbsUp className="h-4 w-4 mr-1" />
                                                                        {t('packages.helpful')}
                                                                    </Button>
                                                                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400">
                                                                        <ThumbsDown className="h-4 w-4 mr-1" />
                                                                        {t('packages.notHelpful')}
                                                                    </Button>
                                                                </div>
                                                            </motion.div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <MessageSquare className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-400 text-elegant">{t('packages.noReviews')}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>

                                    {/* Office Tab */}
                                    <TabsContent value="office" className="mt-4">
                                        <Card className="card-elegant bg-gray-800 border-gray-700">
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-3 text-white text-elegant-heading">
                                                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                                                        <Building className="h-4 w-4 text-primary" />
                                                    </div>
                                                    {t('packages.aboutOffice')}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {pkg.office ? (
                                                    <div className="space-elegant">
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                                                                <Building className="h-8 w-8 text-white" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-2xl font-bold text-white text-elegant-heading">{pkg.office.office_name}</h3>
                                                                <p className="text-gray-300 text-elegant">{(pkg.office as any).description || (pkg.office as any).services_offered || t('packages.noDescription')}</p>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-4">
                                                                <h4 className="font-semibold text-lg text-white text-elegant-heading">{t('packages.contactInfo')}</h4>
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 bg-green-800 rounded-full flex items-center justify-center">
                                                                            <Phone className="h-4 w-4 text-green-300" />
                                                                        </div>
                                                                        <span className="text-gray-300 text-elegant">{pkg.office.contact_number}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
                                                                            <Mail className="h-4 w-4 text-blue-300" />
                                                                        </div>
                                                                        <span className="text-gray-300 text-elegant">{pkg.office.email}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="md:col-span-2">
                                                                            <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-600">
                                                                                <div className="p-3 bg-purple-500 rounded-full">
                                                                                    <Globe className="h-6 w-6 text-white" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm text-purple-300 font-medium">{t('packages.websiteContact')}</p>
                                                                                    <a 
                                                                                        href={pkg.office.website} 
                                                                                        target="_blank" 
                                                                                        rel="noopener noreferrer" 
                                                                                        className="text-lg font-bold text-purple-200 hover:underline"
                                                                                    >
                                                                                        {pkg.office.website}
                                                                                    </a>
                                                                                </div>
                                                                            </div>
                                                                                                                                </div>
                                                    </div>
                                                </div>
                                            </div>
                                                            
                                                            <div className="space-y-4">
                                                                <h4 className="font-semibold text-lg text-white text-elegant-heading">{t('packages.location')}</h4>
                                                                <div className="flex items-center gap-3 mb-4">
                                                                    <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center">
                                                                        <MapPin className="h-4 w-4 text-red-300" />
                                                                    </div>
                                                                    <span className="text-gray-300 text-elegant">{pkg.office.address}</span>
                                                                </div>
                                                                <PackageMap 
                                                                    lat={(pkg.office as any).latitude} 
                                                                    lng={(pkg.office as any).longitude} 
                                                                    t={t} 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                                            <Building className="h-8 w-8 text-gray-400" />
                                                        </div>
                                                        <p className="text-gray-400 text-elegant">{t('packages.noOfficeInfo')}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                </Tabs>
                            </motion.div>
                        </div>

                        {/* Enhanced Booking Sidebar */}
                        <div className="lg:col-span-4">
                            <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="lg:sticky lg:top-24 space-y-3 md:space-y-4 lg:space-y-6"
                            >
                                {/* Modern Booking Card */}
                                <Card className="booking-sidebar shadow-lg md:shadow-xl bg-gray-800 border-gray-700">
                                    <div className="booking-header p-4 md:p-6 text-white relative bg-gradient-to-r from-gray-700 to-gray-800">
                                        <div className="text-center relative z-10">
                                            <div className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white text-elegant-heading">
                                                {totalPrice.toLocaleString()}
                                                <span className="text-sm md:text-base lg:text-lg font-normal mr-2">{t('packages.currency')}</span>
                                            </div>
                                            {pkg.has_discount && (
                                                <Badge className="bg-yellow-500 text-white mb-2 shadow-elegant text-xs md:text-sm">
                                                    <Gift className="h-3 w-3 mr-1" />
                                                    {t('packages.discountAvailable')}
                                                </Badge>
                                            )}
                                            <div className="text-xs md:text-sm opacity-90 text-white text-elegant">
                                                {t('packages.perPerson')}: {(totalPrice / numberOfPersons).toLocaleString()} {t('packages.currency')}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <CardContent className="p-3 md:p-4 lg:p-6 bg-gray-800">
                                        <div className="space-y-3 md:space-y-4 lg:space-y-6">
                                            {/* Number of Persons */}
                                            <div className="space-y-2">
                                                <Label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <Users className="h-4 w-4 text-primary" />
                                                    {t('packages.numberOfPersons') || 'عدد المعتمرين'}
                                                </Label>
                                                <div className="flex items-center gap-3">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            decrementPersons();
                                                        }}
                                                        disabled={numberOfPersons <= 1}
                                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-primary/20 transition-colors border-gray-600 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Minus className="h-3 w-3 md:h-4 md:w-4" />
                                                    </Button>
                                                    <div className="flex items-center justify-center bg-gray-700 rounded-lg px-3 py-2 min-w-[3rem] md:min-w-[4rem]">
                                                        <span className="text-lg md:text-xl font-bold text-center text-white text-elegant">{numberOfPersons}</span>
                                                    </div>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            incrementPersons();
                                                        }}
                                                        disabled={Boolean(
                                                            (!pkg?.max_persons || pkg?.max_persons === 0) && (!pkg?.available_seats_count || pkg?.available_seats_count === 0)
                                                                ? false // Unlimited capacity, no limit on booking
                                                                : (pkg?.max_persons && numberOfPersons >= pkg?.max_persons) || 
                                                                  (pkg?.available_seats_count && pkg?.available_seats_count > 0 && numberOfPersons >= pkg?.available_seats_count)
                                                        )}
                                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full hover:bg-primary/20 transition-colors border-gray-600 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus className="h-3 w-3 md:h-4 md:w-4" />
                                                    </Button>
                                                </div>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {(!pkg?.max_persons || pkg.max_persons === 0) 
                                                        ? t('packages.unlimitedPersonsNote') || 'عدد المعتمرين غير محدود' 
                                                        : t('packages.maxPersonsNote', { 
                                                            max: pkg?.max_persons || 10, 
                                                            available: pkg?.available_seats_count || 0 
                                                        }) || `الحد الأقصى: ${pkg?.max_persons || 10} أشخاص | متوفر: ${pkg?.available_seats_count || 0} مقعد`}
                                                </p>
                                            </div>

                                            {/* Accommodation Selection */}
                                            {pkg.accommodation_pricing && Object.keys(pkg.accommodation_pricing).length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                        <BedDouble className="h-4 w-4 text-primary" />
                                                        {t('packages.selectAccommodation')}
                                                    </Label>
                                                    <select 
                                                        value={selectedAccommodation} 
                                                        onChange={(e) => setSelectedAccommodation(e.target.value)}
                                                        className="w-full h-10 md:h-11 px-3 md:px-4 rounded-lg md:rounded-xl border border-gray-600 focus:border-primary focus:ring-primary/20 text-sm md:text-base bg-gray-700 text-white"
                                                    >
                                                        {Object.entries(pkg.accommodation_pricing).map(([key, acc]: [string, any]) => (
                                                            <option key={key} value={key}>
                                                                {acc.name} - {acc.price?.toLocaleString()} {t('packages.currency')}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {/* Payment Method */}
                                            <div className="space-y-2">
                                                <Label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-primary" />
                                                    {t('packages.paymentMethod')}
                                                </Label>
                                                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
                                                    <div className="flex items-center space-x-2 rtl:space-x-reverse p-2 md:p-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                                                        <RadioGroupItem value="cash" id="cash" />
                                                        <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer text-xs md:text-sm text-gray-300">
                                                            <Banknote className="h-4 w-4 md:h-5 md:w-5 text-green-400" />
                                                            {t('packages.cashPayment') || 'الدفع نقدًا'}
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2 rtl:space-x-reverse p-2 md:p-3 rounded-lg border border-gray-600 hover:bg-gray-700 transition-colors">
                                                        <RadioGroupItem value="online" id="online" />
                                                        <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer text-xs md:text-sm text-gray-300">
                                                            <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                                                            {t('packages.onlinePayment') || 'الدفع الإلكتروني'}
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>

                                            {/* Coupon Code */}
                                            <div className="space-y-2">
                                                <Label className="text-xs md:text-sm font-medium text-gray-300 flex items-center gap-2">
                                                    <Tag className="h-4 w-4 text-primary" />
                                                    {t('packages.couponCode') || 'كود الخصم'}
                                                </Label>
                                                {!appliedCoupon ? (
                                                    <div className="flex gap-2">
                                                        <Input
                                                            value={couponCode}
                                                            onChange={(e) => setCouponCode(e.target.value)}
                                                            placeholder={t('packages.enterCouponCode') || 'أدخل كود الخصم'}
                                                            className="flex-1 h-10 md:h-11 px-3 md:px-4 rounded-lg md:rounded-xl border border-gray-600 focus:border-primary focus:ring-primary/20 text-sm md:text-base bg-gray-700 text-white"
                                                        />
                                                        <Button 
                                                            onClick={handleApplyCoupon}
                                                            disabled={isApplyingCoupon}
                                                            className="btn-gradient-primary h-10 md:h-11 px-3 md:px-4 text-xs md:text-sm"
                                                        >
                                                            {isApplyingCoupon ? (
                                                                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                                                            ) : (
                                                                t('packages.apply') || 'تطبيق'
                                                            )}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-between p-2 md:p-3 bg-green-900/50 rounded-lg border border-green-600">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="h-4 w-4 text-green-400" />
                                                            <span className="text-xs md:text-sm font-medium text-green-300 text-elegant">
                                                                {appliedCoupon.code} - {appliedCoupon.discount_value}
                                                                {appliedCoupon.discount_type === 'percentage' ? '%' : ` ${t('packages.currency')}`}
                                                            </span>
                                                        </div>
                                                        <Button 
                                                            size="sm" 
                                                            variant="ghost" 
                                                            onClick={handleRemoveCoupon}
                                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/50 h-8 w-8 p-0"
                                                        >
                                                            <X className="h-3 w-3 md:h-4 md:w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                                {couponError && (
                                                    <p className="text-xs md:text-sm text-red-400 mt-1 text-elegant">{couponError}</p>
                                                )}
                                            </div>

                                            {/* Price Summary */}
                                            <div className="p-4 bg-gradient-to-r from-gray-700 to-slate-700 rounded-xl border border-gray-600">
                                                <div className="space-y-2">
                                                    {/* السعر الأساسي */}
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300 text-elegant">
                                                            {selectedAccommodation ? t('packages.accommodationPrice') : t('packages.packagePrice')}
                                                        </span>
                                                        <span className="text-gray-300 text-elegant">
                                                            {basePrice.toLocaleString()} {t('packages.currency')}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* خصم الباقة إذا كان متاحًا ولا يوجد تسكين مختار */}
                                                    {pkg?.has_discount && pkg?.discount_price && pkg?.price && !selectedAccommodation && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-green-400 text-elegant">{t('packages.packageDiscount')}</span>
                                                            <span className="text-green-400 text-elegant">
                                                                -{((pkg.price - pkg.discount_price) * numberOfPersons).toLocaleString()} {t('packages.currency')}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* خصم الكوبون إذا كان متاحًا */}
                                                    {appliedCoupon && (
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-green-400 text-elegant">
                                                                {t('packages.couponDiscount')} ({appliedCoupon.code})
                                                            </span>
                                                            <span className="text-green-400 text-elegant">
                                                                -{appliedCoupon.discount_type === 'percentage' 
                                                                    ? `${appliedCoupon.discount_value}%` 
                                                                    : `${appliedCoupon.discount_value} ${t('packages.currency')}`}
                                                            </span>
                                                        </div>
                                                    )}
                                                    
                                                    {/* عدد الأشخاص */}
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-gray-300 text-elegant">
                                                            {t('packages.numberOfPersons')}: {numberOfPersons}
                                                        </span>
                                                        <span className="text-gray-300 text-elegant">
                                                            {(totalPrice / numberOfPersons).toLocaleString()} {t('packages.currency')} / {t('packages.person')}
                                                        </span>
                                                    </div>
                                                    
                                                    <Separator className="bg-gray-600" />
                                                    
                                                    {/* المجموع النهائي */}
                                                    <div className="flex justify-between font-bold text-lg">
                                                        <span className="text-white text-elegant">{t('packages.total')}</span>
                                                        <span className="text-primary text-elegant">{totalPrice.toLocaleString()} {t('packages.currency')}</span>
                                                    </div>
                                                    
                                                    {/* مقدار التوفير الإجمالي */}
                                                    {totalDiscount > 0 && (
                                                        <div className="flex justify-between text-sm bg-green-900/30 p-2 rounded-lg border border-green-600">
                                                            <span className="text-green-300 text-elegant font-medium">
                                                                {t('packages.totalSavings') || 'إجمالي التوفير'}
                                                            </span>
                                                            <span className="text-green-300 text-elegant font-bold">
                                                                {totalDiscount.toLocaleString()} {t('packages.currency')}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Booking Buttons */}
                                            <div className="space-y-3 md:space-y-4 mt-6 md:mt-8">
                                                <Button 
                                                    size="lg" 
                                                    className="w-full btn-gradient-primary text-sm md:text-base lg:text-lg py-3 md:py-4 h-12 md:h-14 rounded-xl shadow-elegant hover:shadow-elegant-hover transition-all duration-300"
                                                    disabled={
                                                        pkg?.is_fully_booked || 
                                                        ((pkg?.available_seats_count || 0) < numberOfPersons) || 
                                                        isProcessingBooking ||
                                                        numberOfPersons <= 0
                                                    }
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleBookNow();
                                                    }}
                                                >
                                                    {isProcessingBooking ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            <span className="text-xs md:text-sm lg:text-base">
                                                                {t('packages.processingBooking') || 'جاري المعالجة...'}
                                                            </span>
                                                        </>
                                                    ) : !userIsAuthenticated ? (
                                                        <>
                                                            <LogIn className="mr-2 h-4 w-4" />
                                                            <span className="text-xs md:text-sm lg:text-base">
                                                                {t('packages.loginToBook') || 'سجل دخولك لتتمكن من الحجز'}
                                                            </span>
                                                        </>
                                                    ) : pkg?.is_fully_booked ? (
                                                        <span className="text-xs md:text-sm lg:text-base">
                                                            {t('packages.fullyBooked') || 'مكتمل'}
                                                        </span>
                                                    ) : ((pkg?.available_seats_count || 0) < numberOfPersons) ? (
                                                        <span className="text-xs md:text-sm lg:text-base">
                                                            {t('packages.insufficientSeats') || `مقاعد غير كافية (متوفر: ${pkg?.available_seats_count || 0})`}
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs md:text-sm lg:text-base">
                                                            {t('packages.bookNowFor') || `احجز الآن لـ ${numberOfPersons} ${numberOfPersons === 1 ? 'معتمر' : 'معتمرين'}`}
                                                        </span>
                                                    )}
                                                </Button>
                                                
                                                <Button 
                                                    variant="outline" 
                                                    size="lg" 
                                                    className="w-full border-2 border-primary text-primary hover:bg-primary/5 rounded-xl transition-all duration-300 h-12 md:h-14"
                                                    onClick={() => window.open(`tel:${pkg.office?.contact_number}`, '_self')}
                                                >
                                                    <Phone className="mr-2 h-4 w-4" />
                                                    <span className="text-xs md:text-sm lg:text-base">
                                                        {t('packages.contactOffice') || 'اتصل بالمكتب'}
                                                    </span>
                                                </Button>
                    
                                                {/* Security Info */}
                                                <div className="text-center text-xs text-gray-500 mt-3 md:mt-4">
                                                    <p className="text-elegant">{t('packages.secureBooking') || 'حجز آمن'}</p>
                                                    <div className="flex items-center justify-center gap-2 mt-1">
                                                        <Shield className="h-3 w-3" />
                                                        <span className="text-elegant">{t('packages.sslProtected') || 'محمي بـ SSL'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Info Card */}
                                <Card className="card-elegant">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-gray-900 text-elegant-heading flex items-center gap-2">
                                            <Info className="h-5 w-5 text-primary" />
                                            {t('packages.quickInformation')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg hover:shadow-md transition-all duration-300">
                                            <span className="text-gray-600 text-elegant">{t('packages.duration')}</span>
                                            <span className="font-medium text-gray-900 text-elegant">{pkg.duration_days || 1} {t('packages.days')}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg hover:shadow-md transition-all duration-300">
                                            <span className="text-gray-600 text-elegant">{t('packages.maxPersons')}</span>
                                            <span className="font-medium text-gray-900 text-elegant">{pkg.max_persons || '∞'}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg hover:shadow-md transition-all duration-300">
                                            <span className="text-gray-600 text-elegant">{t('packages.accommodation')}</span>
                                            <span className="font-medium">
                                                {pkg.includes_accommodation ? (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <CheckCircle className="h-4 w-4" />
                                                        {t('packages.accommodationIncluded')}
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 flex items-center gap-1">
                                                        <XCircle className="h-4 w-4" />
                                                        {t('packages.accommodationNotIncluded')}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg hover:shadow-md transition-all duration-300">
                                            <span className="text-gray-600 text-elegant">{t('packages.transport')}</span>
                                            <span className="font-medium">
                                                {pkg.includes_transport ? (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <CheckCircle className="h-4 w-4" />
                                                        {t('packages.transportIncluded')}
                                                    </span>
                                                ) : (
                                                    <span className="text-red-500 flex items-center gap-1">
                                                        <XCircle className="h-4 w-4" />
                                                        {t('packages.transportNotIncluded')}
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.section>
                        
            {/* Enhanced Passenger Details Form */}
            {numberOfPersons > 0 && (
                <PassengerForm 
                    passengers={passengers}
                    setPassengers={setPassengers}
                    numberOfPersons={numberOfPersons}
                    t={t}
                    updatePassenger={updatePassenger}
                />
            )}

            {/* Image Gallery Modal */}
            <ImageGalleryModal 
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                images={allImages}
                currentIndex={currentImageIndex}
                setCurrentIndex={setCurrentImageIndex}
                packageName={pkg.name}
            />
        </div>
    );
} 