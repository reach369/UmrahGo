'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { fetchPackageById } from '@/services/packageIdService';
import { Package } from '@/services/packages.service';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import axios from 'axios';
import { API_BASE_CONFIG, PAYMENT_ENDPOINTS, USER_ENDPOINTS } from '@/config/api.config';
import { useSessionPersistence } from '@/hooks/useSessionPersistence';

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
    ChevronRight
} from 'lucide-react';
import { getValidImageUrl } from '@/utils/image-helpers';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { getLocaleAndIdFromParams, type NextParams } from '@/utils/params';

interface PackageDetailsPageProps {
    params: NextParams;
}

// PackageMap component
const PackageMap = ({ lat, lng }: { lat?: number, lng?: number }) => {
    if (!lat || !lng) {
        return (
            <div className="h-96 bg-gradient-to-br from-primary/5 to-primary/20 rounded-2xl flex items-center justify-center border border-primary/20">
                <div className="text-center">
                    <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">الموقع غير متوفر</p>
                </div>
            </div>
        );
    }
    
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyC2HIpCzLZoSwoCdTsOlDmEYGp8IXDGVQY';
    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`;
    
    return (
        <div className="h-96 rounded-2xl overflow-hidden shadow-xl border border-primary/20">
            <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={mapSrc}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
    );
};

const FeatureIcon = ({ feature }: { feature: string }) => {
    const iconMap: { [key: string]: any } = {
        wifi: Wifi,
        transport: Car,
        meals: Utensils,
        accommodation: BedDouble,
        guide: Users,
        insurance: Shield,
        breakfast: Coffee,
        bathroom: Bath,
        photography: Camera
    };
    
    const Icon = iconMap[feature.toLowerCase()] || CheckCircle;
    return <Icon className="h-5 w-5" />;
};

export default function PackageDetailsPage({ params }: PackageDetailsPageProps) {
    const router = useRouter();
    const { id, locale } = getLocaleAndIdFromParams(params);
    const t = useTranslations('packages');
    const [pkg, setPackage] = useState<Package | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const { 
        getAuthDataFromStorage, 
        isAuthenticated, 
        isLoading: authLoading 
    } = useSessionPersistence();
    
    // Enhanced user data retrieval with multiple fallbacks
    const getUserFromMultipleSources = () => {
        try {
            const sessionUser = getAuthDataFromStorage();
            if (sessionUser) {
                return sessionUser;
            }

            const userKeys = ['nextauth_user', 'user'];
            for (const key of userKeys) {
                const storedUser = localStorage.getItem(key);
                if (storedUser) {
                    const parsedUser = JSON.parse(storedUser);
                    if (parsedUser && (parsedUser.id || parsedUser.email)) {
                        return parsedUser;
                    }
                }
            }

            return null;
        } catch (error) {
            console.error('Error retrieving user data:', error);
            return null;
        }
    };

    const checkAuthenticationStatus = () => {
        try {
            if (isAuthenticated && getAuthDataFromStorage()) {
                return true;
            }

            const tokens = ['nextauth_token', 'token'];
            for (const tokenKey of tokens) {
                const token = localStorage.getItem(tokenKey);
                if (token && token.length > 10) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Error checking authentication status:', error);
            return false;
        }
    };

    const user = getUserFromMultipleSources();
    const userIsAuthenticated = checkAuthenticationStatus() || isAuthenticated;
    const isLoading = authLoading;
    
    // Booking state
    const [selectedAccommodation, setSelectedAccommodation] = useState<string>("");
    const [accommodationPrice, setAccommodationPrice] = useState<number>(0);
    const [numberOfPersons, setNumberOfPersons] = useState<number>(1);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [couponCode, setCouponCode] = useState<string>("");
    const [couponDiscount, setCouponDiscount] = useState<number>(0);
    const [couponApplied, setCouponApplied] = useState<boolean>(false);
    const [couponMessage, setCouponMessage] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("cash");
    const [isApplyingCoupon, setIsApplyingCoupon] = useState<boolean>(false);
    const [isProcessingBooking, setIsProcessingBooking] = useState<boolean>(false);

    // Passenger data state
    const [passengers, setPassengers] = useState<Array<{
        name: string;
        passport_number: string;
        nationality: string;
        gender: string;
        age?: number;
        phone?: string;
        birth_date?: string;
    }>>([]);

    useEffect(() => {
        if (id) {
            const getPackage = async () => {
                setLoading(true);
                try {
                    const packageData = await fetchPackageById(id);
                    setPackage(packageData);
                } catch (error) {
                    console.error("Failed to fetch package:", error);
                } finally {
                    setLoading(false);
                }
            };
            getPackage();
        }
    }, [id]);
    
    // Restore pending booking data
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pendingBookingData = localStorage.getItem('pendingBooking');
            if (pendingBookingData) {
                try {
                    const bookingData = JSON.parse(pendingBookingData);
                    if (bookingData.packageId === id) {
                        if (bookingData.selectedAccommodation) {
                            setSelectedAccommodation(bookingData.selectedAccommodation);
                        }
                        if (bookingData.numberOfPersons) {
                            setNumberOfPersons(bookingData.numberOfPersons);
                        }
                        if (bookingData.paymentMethod) {
                            setPaymentMethod(bookingData.paymentMethod);
                        }
                        if (bookingData.passengers) {
                            setPassengers(bookingData.passengers);
                        }
                        if (bookingData.couponCode) {
                            setCouponCode(bookingData.couponCode);
                        }
                        
                        if (isAuthenticated && user) {
                            toast({
                                title: "تم استرجاع بيانات الحجز",
                                description: "يمكنك الآن إتمام عملية الحجز.",
                            });
                            
                            localStorage.removeItem('pendingBooking');
                        }
                    }
                } catch (error) {
                    console.error("Error parsing pending booking data:", error);
                    localStorage.removeItem('pendingBooking');
                }
            }
        }
    }, [isAuthenticated, user, id]);

    // Update passengers when number of persons changes
    useEffect(() => {
        const newPassengers = [...passengers];
        
        if (numberOfPersons > passengers.length) {
            for (let i = passengers.length; i < numberOfPersons; i++) {
                newPassengers.push({
                    name: "",
                    passport_number: "",
                    nationality: "",
                    gender: "male",
                    age: 30,
                    phone: ""
                });
            }
        } else if (numberOfPersons < passengers.length) {
            newPassengers.splice(numberOfPersons);
        }
        
        setPassengers(newPassengers);
    }, [numberOfPersons]);

    // Calculate total price
    useEffect(() => {
        if (pkg) {
            let basePrice = pkg.price || 0;
            
            if (pkg.has_discount && pkg.discount_price) {
                basePrice = pkg.discount_price;
            }
            
            if (selectedAccommodation && pkg.accommodation_pricing) {
                const selectedOption = pkg.accommodation_pricing[selectedAccommodation];
                if (selectedOption) {
                    basePrice = Number(selectedOption.price);
                    setAccommodationPrice(basePrice);
                }
            }
            
            let calculatedTotal = basePrice * numberOfPersons;
            
            if (couponApplied && couponDiscount > 0) {
                calculatedTotal = calculatedTotal - couponDiscount;
            }
            
            setTotalPrice(calculatedTotal);
        }
    }, [pkg, selectedAccommodation, numberOfPersons, couponApplied, couponDiscount]);

    // Handle accommodation selection
    const handleAccommodationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedAccommodation(e.target.value);
    };

    // Handle number of persons change
    const decrementPersons = () => {
        if (numberOfPersons > 1) {
            setNumberOfPersons(prev => prev - 1);
        }
    };

    const incrementPersons = () => {
        const maxPersons = pkg?.max_persons || 10;
        if (numberOfPersons < maxPersons) {
            setNumberOfPersons(prev => prev + 1);
        }
    };

    // Handle coupon application
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        
        setIsApplyingCoupon(true);
        setCouponMessage("");
        
        try {
            const token = getAuthDataFromStorage().token;
            const headers: any = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            const response = await axios.post(
                `${API_BASE_CONFIG.BASE_URL}/user/coupons/validate`, 
                { 
                    code: couponCode,
                    amount: totalPrice
                },
                { headers }
            );
            
            if (response.data?.status === true || response.data?.status === "success") {
                const discountAmount = response.data.data?.discount_amount || response.data.discount_amount;
                setCouponDiscount(discountAmount);
                setCouponApplied(true);
                setCouponMessage(t('couponApplied') || 'تم تطبيق الخصم');
                toast({
                    title: t('couponApplied') || 'تم تطبيق الخصم',
                    description: `${t('discount') || 'خصم'}: ${discountAmount} ${t('currency') || 'ريال'}`,
                });
            } else {
                setCouponApplied(false);
                setCouponDiscount(0);
                setCouponMessage(response.data?.message || t('invalidCoupon') || 'كود الخصم غير صالح');
                toast({
                    title: t('invalidCoupon') || 'كود الخصم غير صالح',
                    description: response.data?.message || '',
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            console.error("Error applying coupon:", error);
            setCouponApplied(false);
            setCouponDiscount(0);
            const errorMessage = error.response?.data?.message || t('invalidCoupon') || 'كود الخصم غير صالح';
            setCouponMessage(errorMessage);
            toast({
                title: t('invalidCoupon') || 'كود الخصم غير صالح',
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    // Handle coupon removal
    const handleRemoveCoupon = () => {
        setCouponCode("");
        setCouponDiscount(0);
        setCouponApplied(false);
        setCouponMessage("");
    };

    // Handle booking
    const handleBookNow = async () => {
        if (!pkg) return;
        
        if (!userIsAuthenticated || !user) {
            toast({
                title: "يجب تسجيل الدخول",
                description: "يرجى تسجيل الدخول أو إنشاء حساب جديد لإتمام عملية الحجز.",
                variant: "destructive"
            });
            
            localStorage.setItem('pendingBooking', JSON.stringify({
                packageId: pkg.id,
                selectedAccommodation,
                numberOfPersons,
                paymentMethod,
                passengers,
                couponCode: couponApplied ? couponCode : null
            }));
            
            router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/landing/packages/${id}`)}`);
            return;
        }
        
        const isPassengersDataComplete = passengers.every(p => 
            p.name.trim() && 
            p.passport_number.trim() && 
            p.nationality.trim() && 
            p.age && p.age > 0 && p.age <= 120 &&
            p.phone && p.phone.trim()
        );
        
        if (!isPassengersDataComplete) {
            toast({
                title: "بيانات المسافرين غير مكتملة",
                description: "يرجى إدخال جميع بيانات المسافرين المطلوبة.",
                variant: "destructive"
            });
            return;
        }
        
        setIsProcessingBooking(true);
        
        try {
            const token = getAuthDataFromStorage().token;
            
            if (!token) {
                toast({
                    title: "خطأ في الجلسة",
                    description: "يرجى تسجيل الدخول مرة أخرى.",
                    variant: "destructive"
                });
                router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/landing/packages/${id}`)}`);
                return;
            }
            
            const bookingData = {
                package_id: pkg.id,
                booking_type: "package",
                booking_date: new Date().toISOString().split('T')[0],
                number_of_persons: numberOfPersons,
                travel_start: pkg.start_date,
                travel_end: pkg.end_date,
                coupon_code: couponApplied ? couponCode : null,
                payment_method_id: paymentMethod === "online" ? 2 : 1,
                passengers: passengers.map(p => ({
                    name: p.name,
                    passport_number: p.passport_number,
                    nationality: p.nationality,
                    gender: p.gender,
                    age: p.age || 30,
                    phone: p.phone || user.phone || "+966500000000"
                }))
            };
            
            const response = await axios.post(
                `${API_BASE_CONFIG.BASE_URL}/user/bookings`,
                bookingData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.data?.status === true) {
                const bookingId = response.data.data.id;
                
                if (paymentMethod === "online") {
                    try {
                        const paymentResponse = await axios.post(
                            `${API_BASE_CONFIG.BASE_URL}/geidea/payments/initiate`,
                            {
                                booking_id: bookingId,
                                amount: totalPrice,
                                customer_email: user.email,
                                customer_name: user.name,
                                customer_phone: user.phone || "+966500000000",
                                language: locale === 'ar' ? 'ar' : 'en',
                                return_url: window.location.origin + `/${locale}/payment/success?booking_id=${bookingId}`,
                                cancel_url: window.location.origin + `/${locale}/payment/cancel?booking_id=${bookingId}`,
                            },
                            {
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                }
                            }
                        );
                        
                        if (paymentResponse.data?.redirect_url || paymentResponse.data?.data?.redirect_url) {
                            const redirectUrl = paymentResponse.data.redirect_url || paymentResponse.data.data.redirect_url;
                            window.location.href = redirectUrl;
                        } else {
                            toast({
                                title: "خطأ في عملية الدفع",
                                description: "لم يتم الحصول على رابط الدفع. يرجى المحاولة مرة أخرى.",
                                variant: "destructive"
                            });
                        }
                    } catch (error: any) {
                        console.error("خطأ في بدء عملية الدفع:", error);
                        toast({
                            title: "خطأ في عملية الدفع",
                            description: error.response?.data?.message || "حدث خطأ أثناء تهيئة عملية الدفع. يرجى المحاولة مرة أخرى.",
                            variant: "destructive"
                        });
                    }
                } else {
                    toast({
                        title: "تم إنشاء الحجز بنجاح",
                        description: "سيتم التواصل معك قريباً لإتمام عملية الدفع النقدي.",
                    });
                    
                    router.push(`/${locale}/PilgrimUser/booking`);
                }
            } else {
                toast({
                    title: "فشل إنشاء الحجز",
                    description: response.data?.message || "حدث خطأ أثناء إنشاء الحجز. يرجى المحاولة مرة أخرى.",
                    variant: "destructive"
                });
            }
        } catch (error: any) {
            console.error("خطأ في إنشاء الحجز:", error);
            toast({
                title: "خطأ في الحجز",
                description: error.response?.data?.message || "حدث خطأ أثناء إنشاء الحجز. يرجى المحاولة مرة أخرى.",
                variant: "destructive"
            });
        } finally {
            setIsProcessingBooking(false);
        }
    };

    // Animation variants
    const fadeInUp = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
    };

    const staggerContainer = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-primary/5 to-background">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">{t('loading') || 'جارٍ التحميل...'}</p>
                </div>
            </div>
        );
    }

    if (!pkg) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-primary/5 to-background">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <XCircle className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{t('notFound') || 'الباقة غير موجودة'}</h2>
                    <p className="text-muted-foreground mb-6">لم يتم العثور على الباقة المطلوبة</p>
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        العودة للباقات
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Modern Header with Breadcrumb */}
            <div className=" shadow-sm border-b border-gray-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => router.back()}
                                className="text-gray-600 hover:text-primary"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                العودة
                            </Button>
                            <div className="text-sm text-gray-500">
                                <span>الرئيسية</span>
                                <ChevronLeft className="h-4 w-4 inline mx-1" />
                                <span>الباقات</span>
                                <ChevronLeft className="h-4 w-4 inline mx-1" />
                                <span className="text-primary font-medium">{pkg.name}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" className="text-gray-600">
                                <Share className="h-4 w-4 mr-2" />
                                مشاركة
                            </Button>
                            <Button size="sm" variant="outline" className="text-gray-600">
                                <Heart className="h-4 w-4 mr-2" />
                                حفظ
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section - Enhanced Design */}
            <section className="relative">
                <div className="container mx-auto px-4 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Left Content */}
                        <div className="lg:col-span-8">
                            {/* Image Gallery */}
                            <div className="relative mb-8">
                                <div className="grid grid-cols-4 gap-4 h-[500px]">
                                    {/* Main Image */}
                                    <div className="col-span-3 relative rounded-2xl overflow-hidden shadow-xl">
                                        <Image 
                                            src={getValidImageUrl(allImages[currentImageIndex]?.url)} 
                                            alt={pkg.name}
                                            fill
                                            className="object-cover hover:scale-105 transition-transform duration-500"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                        
                                        {/* Image Navigation */}
                                        {allImages.length > 1 && (
                                            <>
                                                <button
                                                    onClick={() => setCurrentImageIndex((prev) => prev === 0 ? allImages.length - 1 : prev - 1)}
                                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover: transition-all"
                                                >
                                                    <ChevronLeft className="h-5 w-5 text-gray-700" />
                                                </button>
                                                <button
                                                    onClick={() => setCurrentImageIndex((prev) => prev === allImages.length - 1 ? 0 : prev + 1)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover: transition-all"
                                                >
                                                    <ChevronRight className="h-5 w-5 text-gray-700" />
                                                </button>
                                            </>
                                        )}
                                        
                                        {/* View All Photos Button */}
                                        <div className="absolute bottom-4 right-4">
                                            <Button size="sm" className="bg-white/90 text-gray-800 hover:bg-white">
                                                <Eye className="h-4 w-4 mr-2" />
                                                عرض جميع الصور ({allImages.length})
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Thumbnail Grid */}
                                    <div className="col-span-1 flex flex-col gap-4">
                                        {allImages.slice(1, 5).map((image, index) => (
                                            <div 
                                                key={index}
                                                className={`relative flex-1 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-lg transition-all ${
                                                    currentImageIndex === index + 1 ? 'ring-2 ring-primary' : ''
                                                }`}
                                                onClick={() => setCurrentImageIndex(index + 1)}
                                            >
                                                <Image 
                                                    src={getValidImageUrl(image.url)} 
                                                    alt={`صورة ${index + 2}`}
                                                    fill
                                                    className="object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                                {index === 3 && allImages.length > 5 && (
                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                        <span className="text-white font-bold">+{allImages.length - 5}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Package Info Header */}
                            <div className="mb-8">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    {pkg.is_featured && (
                                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1">
                                            <Award className="h-3 w-3 mr-1" />
                                            باقة مميزة
                                        </Badge>
                                    )}
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {pkg.duration_days || 1} أيام
                                    </Badge>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <Users className="h-3 w-3 mr-1" />
                                        {pkg.available_seats_count} مقعد متاح
                                    </Badge>
                                </div>
                                
                                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                    {pkg.name}
                                </h1>
                                
                                <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Building className="h-5 w-5 text-primary" />
                                        <span className="font-medium">{pkg.office?.office_name}</span>
                                    </div>
                                    
                                    {pkg.start_date && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-5 w-5 text-primary" />
                                            <span>{new Date(pkg.start_date).toLocaleDateString('ar-SA')}</span>
                                        </div>
                                    )}
                                    
                                    {pkg.start_location && (
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <span>{pkg.start_location}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Rating */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center gap-1">
                                        {renderRatingStars(pkg.rating_info?.average_rating || 5)}
                                    </div>
                                    <span className="font-bold text-lg">{pkg.rating_info?.average_rating || '5.0'}</span>
                                    <span className="text-gray-500">({pkg.rating_info?.total_reviews || 0} تقييم)</span>
                                </div>
                            </div>

                            {/* Enhanced Tabs */}
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-100 p-1 rounded-xl">
                                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]: data-[state=active]:shadow-sm">
                                        نظرة عامة
                                    </TabsTrigger>
                                    <TabsTrigger value="itinerary" className="rounded-lg data-[state=active]: data-[state=active]:shadow-sm">
                                        البرنامج
                                    </TabsTrigger>
                                    <TabsTrigger value="accommodation" className="rounded-lg data-[state=active]: data-[state=active]:shadow-sm">
                                        الإقامة
                                    </TabsTrigger>
                                    <TabsTrigger value="reviews" className="rounded-lg data-[state=active]: data-[state=active]:shadow-sm">
                                        التقييمات
                                    </TabsTrigger>
                                    <TabsTrigger value="office" className="rounded-lg data-[state=active]: data-[state=active]:shadow-sm">
                                        المكتب
                                    </TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="overview" className="space-y-8">
                                    <motion.div variants={fadeInUp}>
                                        <Card className="border-0 shadow-lg rounded-2xl bg-white">
                                            <CardContent className="p-8">
                                                <h3 className="text-2xl font-bold text-gray-900 mb-6">وصف الباقة</h3>
                                                <p className="text-gray-700 leading-relaxed text-lg mb-8">
                                                    {pkg.description || 'لا يوجد وصف متاح لهذه الباقة.'}
                                                </p>
                                                
                                                {/* Features Grid */}
                                                {Object.keys(features).length > 0 && (
                                                    <div className="mb-8">
                                                        <h4 className="text-xl font-bold text-gray-900 mb-6">المميزات المتضمنة</h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {Object.entries(features).map(([key, value]) => (
                                                                <div key={key} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                                                    <div className={`p-2 rounded-lg ${value === 'true' || value === true ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                                                                        <FeatureIcon feature={key} />
                                                                    </div>
                                                                    <span className="font-medium text-gray-800">
                                                                        {t(`featuresList.${key}`) || key}
                                                                    </span>
                                                                    {value === 'true' || value === true ? (
                                                                        <CheckCircle className="h-5 w-5 text-green-500 mr-auto" />
                                                                    ) : (
                                                                        <XCircle className="h-5 w-5 text-red-500 mr-auto" />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Stats Cards */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                                                        <Users className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                                                        <div className="text-2xl font-bold text-blue-900">{pkg.max_persons || '∞'}</div>
                                                        <div className="text-sm text-blue-700">أقصى عدد</div>
                                                    </div>
                                                    
                                                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                                                        <Clock className="h-8 w-8 text-green-600 mx-auto mb-3" />
                                                        <div className="text-2xl font-bold text-green-900">{pkg.duration_days || 1}</div>
                                                        <div className="text-sm text-green-700">أيام</div>
                                                    </div>
                                                    
                                                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                                                        <BedDouble className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                                                        <div className="text-2xl font-bold text-purple-900">
                                                            {pkg.includes_accommodation ? '✓' : '✗'}
                                                        </div>
                                                        <div className="text-sm text-purple-700">الإقامة</div>
                                                    </div>
                                                    
                                                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                                                        <Plane className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                                                        <div className="text-2xl font-bold text-orange-900">
                                                            {pkg.includes_transport ? '✓' : '✗'}
                                                        </div>
                                                        <div className="text-sm text-orange-700">النقل</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </TabsContent>

                                {/* Other tab contents remain the same but with enhanced styling */}
                                <TabsContent value="itinerary" className="space-y-6">
                                    <Card className="border-0 shadow-lg rounded-2xl bg-white">
                                        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
                                            <CardTitle className="flex items-center gap-2 text-primary text-2xl">
                                                <Calendar className="h-6 w-6" />
                                                البرنامج اليومي
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            <div className="space-y-6">
                                                {Array.from({ length: pkg.duration_days || 1 }, (_, i) => {
                                                    const dayDate = pkg.start_date ? new Date(pkg.start_date) : new Date();
                                                    dayDate.setDate(dayDate.getDate() + i);
                                                    
                                                    return (
                                                        <div key={i} className="flex gap-6 p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-primary/5 hover:to-primary/10 transition-all duration-300">
                                                            <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                                                                {i + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <h4 className="font-bold text-xl text-gray-900">
                                                                        اليوم {i + 1}
                                                                    </h4>
                                                                    <span className="text-sm text-gray-500  px-3 py-1 rounded-full">
                                                                        {dayDate.toLocaleDateString('ar-SA')}
                                                                    </span>
                                                                </div>
                                                                
                                                                <div className="space-y-3">
                                                                    <div className="flex items-center gap-3 text-primary">
                                                                        <MapPin className="h-5 w-5" />
                                                                        <span className="font-medium">
                                                                            {i === 0 ? pkg.start_location : 
                                                                             i === (pkg.duration_days || 1) - 1 ? pkg.end_location : 
                                                                             'مكة المكرمة - المدينة المنورة'}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-gray-600 leading-relaxed">
                                                                        {i === 0 ? 'الوصول والتوجه إلى الفندق، بداية مناسك العمرة' :
                                                                         i === (pkg.duration_days || 1) - 1 ? 'إتمام المناسك والتحضير للمغادرة' :
                                                                         'متابعة برنامج العمرة وزيارة الأماكن المقدسة'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Continue with other tabs with similar enhanced styling... */}
                                <TabsContent value="accommodation" className="space-y-6">
                                    <Card className="border-0 shadow-lg rounded-2xl bg-white">
                                        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
                                            <CardTitle className="flex items-center gap-2 text-primary text-2xl">
                                                <BedDouble className="h-6 w-6" />
                                                أماكن الإقامة
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            {pkg.hotels && pkg.hotels.length > 0 ? (
                                                <div className="space-y-6">
                                                    {pkg.hotels.map((hotel: any, index: number) => (
                                                        <div key={index} className="rounded-2xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                                                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6">
                                                                <div className="flex items-start gap-6">
                                                                    <div className="w-20 h-20 bg-primary/20 rounded-xl flex items-center justify-center overflow-hidden">
                                                                        {hotel.featured_image_url ? (
                                                                            <Image 
                                                                                src={getValidImageUrl(hotel.featured_image_url)} 
                                                                                alt={hotel.name} 
                                                                                width={80} 
                                                                                height={80} 
                                                                                className="rounded-xl object-cover w-full h-full" 
                                                                            />
                                                                        ) : (
                                                                            <Building className="h-10 w-10 text-primary" />
                                                                        )}
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <h4 className="font-bold text-2xl text-gray-900 mb-2">{hotel.name}</h4>
                                                                        <p className="text-gray-600 mb-3">{hotel.address}</p>
                                                                        <div className="flex items-center gap-2 mb-3">
                                                                            {renderRatingStars(hotel.rating || 5)}
                                                                            <span className="font-bold text-lg">{hotel.rating || 5.0}</span>
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                            <Clock className="h-4 w-4" />
                                                                            <span>
                                                                                تسجيل الدخول: {hotel.check_in_time?.substring(0, 5) || '14:00'} | 
                                                                                تسجيل الخروج: {hotel.check_out_time?.substring(0, 5) || '12:00'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-center">
                                                                        <Badge className="mb-2 bg-primary">
                                                                            {hotel.pivot?.nights || pkg.duration_days || 1} ليالي
                                                                        </Badge>
                                                                        <div className="text-sm text-gray-600">
                                                                            {hotel.pivot?.room_type && (
                                                                                <span className="capitalize">{hotel.pivot.room_type}</span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            {hotel.amenities && hotel.amenities.length > 0 && (
                                                                <div className="p-6 border-t border-gray-100">
                                                                    <h5 className="font-semibold text-lg mb-4 text-gray-900">المرافق والخدمات</h5>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {hotel.amenities.map((amenity: string, idx: number) => (
                                                                            <Badge key={idx} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                                                {amenity}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12">
                                                    <BedDouble className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                    <p className="text-gray-500 text-lg">لا توجد معلومات عن الفنادق متاحة</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="reviews" className="space-y-6">
                                    <Card className="border-0 shadow-lg rounded-2xl bg-white">
                                        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
                                            <CardTitle className="flex items-center gap-2 text-primary text-2xl">
                                                <Star className="h-6 w-6" />
                                                التقييمات والمراجعات
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                                                <div className="text-center md:w-1/3">
                                                    <div className="text-6xl font-bold text-primary mb-3">
                                                        {pkg.rating_info?.average_rating || '5.0'}
                                                    </div>
                                                    <div className="flex justify-center mb-3">
                                                        {renderRatingStars(pkg.rating_info?.average_rating || 5)}
                                                    </div>
                                                    <p className="text-gray-600 text-lg">
                                                        {pkg.rating_info?.total_reviews || 0} تقييم
                                                    </p>
                                                </div>
                                                
                                                <div className="flex-1 space-y-3 w-full md:w-2/3">
                                                    {pkg.rating_info?.rating_breakdown && Object.entries(pkg.rating_info.rating_breakdown).reverse().map(([rating, count]) => (
                                                        <div key={rating} className="flex items-center gap-4">
                                                            <div className="w-12 text-sm font-medium">{rating} ★</div>
                                                            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                                                <div 
                                                                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500" 
                                                                    style={{ 
                                                                        width: `${(pkg.rating_info?.total_reviews || 0) > 0 
                                                                            ? (Number(count) / (pkg.rating_info?.total_reviews || 1)) * 100 
                                                                            : 0}%` 
                                                                    }}
                                                                ></div>
                                                            </div>
                                                            <div className="w-12 text-sm text-gray-600 text-right">
                                                                {count}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="mt-8">
                                                <h4 className="font-bold text-xl mb-6 text-gray-900">أحدث التقييمات</h4>
                                                
                                                {pkg.reviews && pkg.reviews.length > 0 ? (
                                                    <div className="space-y-6">
                                                        {pkg.reviews.map((review: any, index: number) => (
                                                            <div key={index} className="p-6 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
                                                                <div className="flex items-center gap-4 mb-4">
                                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                                                                        <Users className="h-6 w-6 text-white" />
                                                                    </div>
                                                                    <div>
                                                                        <h5 className="font-semibold text-lg text-gray-900">{review.user_name || 'مستخدم'}</h5>
                                                                        <div className="flex items-center gap-1">
                                                                            {renderRatingStars(review.rating || 5)}
                                                                        </div>
                                                                    </div>
                                                                    <div className="mr-auto text-sm text-gray-500">
                                                                        {new Date(review.created_at).toLocaleDateString('ar-SA')}
                                                                    </div>
                                                                </div>
                                                                <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-12">
                                                        <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                                        <p className="text-gray-500 text-lg">لا توجد تقييمات حتى الآن</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="office" className="space-y-6">
                                    <Card className="border-0 shadow-lg rounded-2xl bg-white">
                                        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
                                            <CardTitle className="flex items-center gap-2 text-primary text-2xl">
                                                <Building className="h-6 w-6" />
                                                معلومات المكتب
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8">
                                            <div className="flex items-center gap-6 mb-8">
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center">
                                                    {pkg.office?.logo ? (
                                                        <Image 
                                                            src={getValidImageUrl(pkg.office.logo)} 
                                                            alt={pkg.office.office_name || ''} 
                                                            width={96} 
                                                            height={96} 
                                                            className="rounded-2xl object-cover w-full h-full" 
                                                        />
                                                    ) : (
                                                        <Building className="h-12 w-12 text-primary" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-3xl font-bold text-gray-900 mb-2">{pkg.office?.office_name}</h3>
                                                    <p className="text-gray-600 text-lg">{pkg.office?.address}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {pkg.office?.contact_number && (
                                                    <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                                                        <div className="p-3 bg-green-500 rounded-full">
                                                            <Phone className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-green-700 font-medium">رقم الهاتف</p>
                                                            <p className="text-lg font-bold text-green-900">{pkg.office.contact_number}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {pkg.office?.email && (
                                                    <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                                                        <div className="p-3 bg-blue-500 rounded-full">
                                                            <Mail className="h-6 w-6 text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-blue-700 font-medium">البريد الإلكتروني</p>
                                                            <p className="text-lg font-bold text-blue-900">{pkg.office.email}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {pkg.office?.website && (
                                                    <div className="md:col-span-2">
                                                        <div className="flex items-center gap-4 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
                                                            <div className="p-3 bg-purple-500 rounded-full">
                                                                <Globe className="h-6 w-6 text-white" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm text-purple-700 font-medium">الموقع الإلكتروني</p>
                                                                <a 
                                                                    href={pkg.office.website} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer" 
                                                                    className="text-lg font-bold text-purple-900 hover:underline"
                                                                >
                                                                    {pkg.office.website}
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Enhanced Booking Sidebar */}
                        <div className="lg:col-span-4">
                            <div className="lg:sticky lg:top-24 space-y-6">
                                {/* Modern Booking Card */}
                                <Card className="border-0 shadow-2xl rounded-3xl  overflow-hidden">
                                    <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                                        <div className="text-center">
                                            <div className="text-4xl font-bold mb-2">
                                                {totalPrice.toLocaleString()}
                                                <span className="text-lg font-normal mr-2">ريال سعودي</span>
                                            </div>
                                            {pkg.has_discount && (
                                                <Badge className="bg-yellow-500 text-white mb-2">
                                                    <Award className="h-3 w-3 mr-1" />
                                                    خصم متاح
                                                </Badge>
                                            )}
                                            <div className="text-sm opacity-90">
                                                للشخص الواحد: {(totalPrice / numberOfPersons).toLocaleString()} ريال
                                            </div>
                                            {couponApplied && (
                                                <div className="mt-3 p-3 bg-white/20 rounded-lg">
                                                    <div className="text-sm">
                                                        <span className="line-through opacity-75">
                                                            {(totalPrice + couponDiscount).toLocaleString()} ريال
                                                        </span>
                                                        <span className="block font-medium">
                                                            وفرت {couponDiscount.toLocaleString()} ريال
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <CardContent className="p-6">
                                        {/* User Info */}
                                        {isAuthenticated && user && (
                                            <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200 mb-6">
                                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center overflow-hidden">
                                                    {user.profile_photo || user.avatar ? (
                                                        <img 
                                                            src={user.profile_photo || user.avatar || ''} 
                                                            alt={user.name || "User"} 
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-lg font-bold text-white">
                                                            {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-green-900 truncate">{user.name || "مستخدم"}</p>
                                                    <p className="text-sm text-green-700 truncate">{user.email}</p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                                        <span className="text-xs text-green-600">موثق</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Login Required Message */}
                                        {!isAuthenticated && (
                                            <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 mb-6">
                                                <div className="flex items-center gap-2 text-yellow-800 mb-2">
                                                    <LogIn className="h-5 w-5" />
                                                    <span className="font-medium">تسجيل الدخول مطلوب</span>
                                                </div>
                                                <p className="text-sm text-yellow-700 mb-3">
                                                    يرجى تسجيل الدخول لإتمام عملية الحجز
                                                </p>
                                                <Button 
                                                    size="sm" 
                                                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                                                    onClick={() => router.push(`/${locale}/auth/login?callbackUrl=${encodeURIComponent(`/${locale}/landing/packages/${id}`)}`)}
                                                >
                                                    <LogIn className="h-4 w-4 mr-2" />
                                                    تسجيل الدخول الآن
                                                </Button>
                                            </div>
                                        )}
                                        
                                        {/* Booking Form */}
                                        <div className="space-y-6">
                                            {/* Accommodation Selection */}
                                            {pkg.accommodation_pricing && Object.keys(pkg.accommodation_pricing).length > 0 && (
                                                <div className="space-y-3">
                                                    <Label htmlFor="accommodation" className="text-sm font-semibold text-gray-700">
                                                        اختر نوع الإقامة
                                                    </Label>
                                                    <select 
                                                        id="accommodation"
                                                        className="w-full p-3 border border-gray-300 rounded-xl  focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                                                        value={selectedAccommodation}
                                                        onChange={handleAccommodationChange}
                                                    >
                                                        <option value="">اختر...</option>
                                                        {Object.entries(pkg.accommodation_pricing).map(([key, option]) => (
                                                            <option key={key} value={key}>
                                                                {option.name} - {option.type} ({Number(option.price).toLocaleString()} ريال)
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                            
                                            {/* Number of Persons */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-gray-700">
                                                    عدد الأشخاص
                                                </Label>
                                                <div className="flex items-center justify-center gap-4 p-4 border border-gray-300 rounded-xl bg-white">
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="icon"
                                                        onClick={decrementPersons}
                                                        disabled={numberOfPersons <= 1}
                                                        className="h-12 w-12 rounded-full border-2 border-primary/30 hover:bg-primary/10"
                                                    >
                                                        <span className="text-xl font-bold">-</span>
                                                    </Button>
                                                    <div className="w-20 text-center">
                                                        <span className="text-3xl font-bold text-primary">{numberOfPersons}</span>
                                                        <p className="text-xs text-gray-500">أشخاص</p>
                                                    </div>
                                                    <Button 
                                                        type="button" 
                                                        variant="outline" 
                                                        size="icon"
                                                        onClick={incrementPersons}
                                                        disabled={numberOfPersons >= (pkg.max_persons || 10)}
                                                        className="h-12 w-12 rounded-full border-2 border-primary/30 hover:bg-primary/10"
                                                    >
                                                        <span className="text-xl font-bold">+</span>
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            {/* Coupon Code */}
                                            <div className="space-y-3">
                                                <Label htmlFor="couponCode" className="text-sm font-semibold text-gray-700">
                                                    <Tag className="h-4 w-4 inline mr-1" />
                                                    كود الخصم
                                                </Label>
                                                <div className="flex gap-2">
                                                    <Input
                                                        id="couponCode"
                                                        placeholder="أدخل كود الخصم"
                                                        value={couponCode}
                                                        onChange={(e) => setCouponCode(e.target.value)}
                                                        disabled={couponApplied || isApplyingCoupon}
                                                        className="flex-1 border-gray-300 focus:border-primary rounded-xl"
                                                    />
                                                    {!couponApplied ? (
                                                        <Button 
                                                            type="button"
                                                            onClick={handleApplyCoupon}
                                                            disabled={!couponCode.trim() || isApplyingCoupon}
                                                            className="whitespace-nowrap bg-primary hover:bg-primary/90 rounded-xl"
                                                        >
                                                            {isApplyingCoupon ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                'تطبيق'
                                                            )}
                                                        </Button>
                                                    ) : (
                                                        <Button 
                                                            type="button"
                                                            variant="destructive"
                                                            onClick={handleRemoveCoupon}
                                                            className="whitespace-nowrap rounded-xl"
                                                        >
                                                            إلغاء
                                                        </Button>
                                                    )}
                                                </div>
                                                {couponMessage && (
                                                    <div className={`p-3 rounded-lg text-sm ${couponApplied ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                        {couponMessage}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Payment Method */}
                                            <div className="space-y-3">
                                                <Label className="text-sm font-semibold text-gray-700">
                                                    طريقة الدفع
                                                </Label>
                                                <RadioGroup 
                                                    value={paymentMethod} 
                                                    onValueChange={setPaymentMethod}
                                                    className="grid grid-cols-1 gap-3"
                                                >
                                                    <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                                                        <RadioGroupItem value="cash" id="cash" />
                                                        <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                                                            <div className="p-2 bg-green-100 rounded-lg">
                                                                <Banknote className="h-5 w-5 text-green-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">الدفع النقدي</p>
                                                                <p className="text-xs text-gray-500">الدفع عند التسليم</p>
                                                            </div>
                                                        </Label>
                                                    </div>
                                                    <div className="flex items-center space-x-3 rtl:space-x-reverse p-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                                                        <RadioGroupItem value="online" id="online" />
                                                        <Label htmlFor="online" className="flex items-center gap-3 cursor-pointer flex-1">
                                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                                <CreditCard className="h-5 w-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900">الدفع الإلكتروني</p>
                                                                <p className="text-xs text-gray-500">الدفع عبر جيديا</p>
                                                            </div>
                                                        </Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </div>
                                        
                                        {/* Booking Buttons */}
                                        <div className="space-y-4 mt-8">
                                            <Button 
                                                size="lg" 
                                                className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                                disabled={pkg.is_fully_booked || ((pkg.available_seats_count || 0) < numberOfPersons) || isProcessingBooking}
                                                onClick={handleBookNow}
                                            >
                                                {isProcessingBooking ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        جاري المعالجة...
                                                    </>
                                                ) : !userIsAuthenticated ? (
                                                    <>
                                                        <LogIn className="mr-2 h-4 w-4" />
                                                        تسجيل الدخول للحجز
                                                    </>
                                                ) : pkg.is_fully_booked ? 
                                                    'مكتمل الحجز' : 
                                                    'احجز الآن'
                                                }
                                            </Button>
                                            
                                            <Button 
                                                variant="outline" 
                                                size="lg" 
                                                className="w-full border-2 border-primary text-primary hover:bg-primary/5 rounded-xl transition-all duration-300"
                                                onClick={() => window.open(`tel:${pkg.office?.contact_number}`, '_self')}
                                            >
                                                <Phone className="mr-2 h-4 w-4" />
                                                تواصل مع المكتب
                                            </Button>
                                            
                                            {/* Security Info */}
                                            <div className="text-center text-xs text-gray-500 mt-4">
                                                <p>حجز آمن ومضمون</p>
                                                <div className="flex items-center justify-center gap-2 mt-1">
                                                    <Shield className="h-3 w-3" />
                                                    <span>محمي بتشفير SSL</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Quick Info Card */}
                                <Card className="border-0 shadow-lg rounded-2xl bg-white">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-gray-900">معلومات سريعة</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">المدة</span>
                                            <span className="font-medium text-gray-900">{pkg.duration_days || 1} أيام</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">أقصى عدد</span>
                                            <span className="font-medium text-gray-900">{pkg.max_persons || '∞'}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">الإقامة</span>
                                            <span className="font-medium">
                                                {pkg.includes_accommodation ? (
                                                    <span className="text-green-600">✓ متضمن</span>
                                                ) : (
                                                    <span className="text-red-500">✗ غير متضمن</span>
                                                )}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">النقل</span>
                                            <span className="font-medium">
                                                {pkg.includes_transport ? (
                                                    <span className="text-green-600">✓ متضمن</span>
                                                ) : (
                                                    <span className="text-red-500">✗ غير متضمن</span>
                                                )}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Enhanced Passenger Details Form */}
            {numberOfPersons > 0 && (
                <section className="py-8 bg-white">
                    <div className="container mx-auto px-4">
                        <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
                            <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 p-8">
                                <CardTitle className="flex items-center gap-3 text-primary text-2xl">
                                    <Users className="h-6 w-6" />
                                    بيانات المسافرين
                                </CardTitle>
                                <p className="text-gray-600 mt-2">
                                    يرجى إدخال بيانات جميع المسافرين بدقة
                                </p>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="space-y-8">
                                    {passengers.map((passenger, index) => (
                                        <motion.div 
                                            key={index} 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="p-8 border border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-sm hover:shadow-md transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="font-bold text-xl text-gray-900 flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                                        {index + 1}
                                                    </div>
                                                    المسافر {index + 1}
                                                </h4>
                                                {index === 0 && (
                                                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                                                        المسافر الرئيسي
                                                    </Badge>
                                                )}
                                            </div>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {/* Full Name */}
                                                <div className="space-y-2">
                                                    <Label htmlFor={`name-${index}`} className="text-sm font-medium text-gray-700">
                                                        الاسم الكامل *
                                                    </Label>
                                                    <Input
                                                        id={`name-${index}`}
                                                        value={passenger.name}
                                                        onChange={(e) => {
                                                            const newPassengers = [...passengers];
                                                            newPassengers[index].name = e.target.value;
                                                            setPassengers(newPassengers);
                                                        }}
                                                        placeholder="أدخل الاسم الكامل"
                                                        className="border-gray-300 focus:border-primary rounded-xl"
                                                        required
                                                    />
                                                </div>
                                                
                                                {/* Passport Number */}
                                                <div className="space-y-2">
                                                    <Label htmlFor={`passport-${index}`} className="text-sm font-medium text-gray-700">
                                                        رقم جواز السفر *
                                                    </Label>
                                                    <Input
                                                        id={`passport-${index}`}
                                                        value={passenger.passport_number}
                                                        onChange={(e) => {
                                                            const newPassengers = [...passengers];
                                                            newPassengers[index].passport_number = e.target.value;
                                                            setPassengers(newPassengers);
                                                        }}
                                                        placeholder="أدخل رقم جواز السفر"
                                                        className="border-gray-300 focus:border-primary rounded-xl"
                                                        required
                                                    />
                                                </div>
                                                
                                                {/* Nationality */}
                                                <div className="space-y-2">
                                                    <Label htmlFor={`nationality-${index}`} className="text-sm font-medium text-gray-700">
                                                        الجنسية *
                                                    </Label>
                                                    <Input
                                                        id={`nationality-${index}`}
                                                        value={passenger.nationality}
                                                        onChange={(e) => {
                                                            const newPassengers = [...passengers];
                                                            newPassengers[index].nationality = e.target.value;
                                                            setPassengers(newPassengers);
                                                        }}
                                                        placeholder="أدخل الجنسية"
                                                        className="border-gray-300 focus:border-primary rounded-xl"
                                                        required
                                                    />
                                                </div>
                                                
                                                {/* Age */}
                                                <div className="space-y-2">
                                                    <Label htmlFor={`age-${index}`} className="text-sm font-medium text-gray-700">
                                                        العمر *
                                                    </Label>
                                                    <Input
                                                        id={`age-${index}`}
                                                        type="number"
                                                        min="1"
                                                        max="120"
                                                        value={passenger.age || ''}
                                                        onChange={(e) => {
                                                            const newPassengers = [...passengers];
                                                            newPassengers[index].age = parseInt(e.target.value) || 30;
                                                            setPassengers(newPassengers);
                                                        }}
                                                        placeholder="أدخل العمر"
                                                        className="border-gray-300 focus:border-primary rounded-xl"
                                                        required
                                                    />
                                                </div>
                                                
                                                {/* Phone Number */}
                                                <div className="space-y-2">
                                                    <Label htmlFor={`phone-${index}`} className="text-sm font-medium text-gray-700">
                                                        رقم الهاتف *
                                                    </Label>
                                                    <Input
                                                        id={`phone-${index}`}
                                                        type="tel"
                                                        value={passenger.phone || ''}
                                                        onChange={(e) => {
                                                            const newPassengers = [...passengers];
                                                            newPassengers[index].phone = e.target.value;
                                                            setPassengers(newPassengers);
                                                        }}
                                                        placeholder="+966501234567"
                                                        className="border-gray-300 focus:border-primary rounded-xl"
                                                        required
                                                    />
                                                </div>
                                                
                                                {/* Gender */}
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">
                                                        الجنس *
                                                    </Label>
                                                    <RadioGroup 
                                                        value={passenger.gender} 
                                                        onValueChange={(value) => {
                                                            const newPassengers = [...passengers];
                                                            newPassengers[index].gender = value;
                                                            setPassengers(newPassengers);
                                                        }}
                                                        className="flex space-x-6 rtl:space-x-reverse"
                                                    >
                                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                            <RadioGroupItem value="male" id={`male-${index}`} />
                                                            <Label htmlFor={`male-${index}`} className="text-sm font-medium">
                                                                ذكر
                                                            </Label>
                                                        </div>
                                                        <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                                            <RadioGroupItem value="female" id={`female-${index}`} />
                                                            <Label htmlFor={`female-${index}`} className="text-sm font-medium">
                                                                أنثى
                                                            </Label>
                                                        </div>
                                                    </RadioGroup>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                
                                {/* Important Note */}
                                <Alert className="mt-8 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl">
                                    <AlertDescription className="text-sm text-gray-700">
                                        <strong>مهم:</strong> يرجى التأكد من صحة أرقام جوازات السفر وتطابقها مع الوثائق الرسمية
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </div>
                </section>
            )}
        </div>
    );
} 