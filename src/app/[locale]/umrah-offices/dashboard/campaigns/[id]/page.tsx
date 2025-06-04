'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowRight, Calendar, Users, CreditCard, MapPin, Phone, Mail, 
  CheckCircle, AlertCircle, Clock, Info, Bus, Building 
} from 'lucide-react';
import { useGetCampaignByIdQuery } from '../../../redux/api/campaignsApiSlice';
import { useAppSelector } from '../../../hooks/reduxHooks';
import Link from 'next/link';
import AddCampaignsDialog from '../../../components/layout/addCompaingsDialog';

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;
  
  // جلب بيانات الحملة باستخدام RTK Query
  const { data: campaign, isLoading, error } = useGetCampaignByIdQuery(campaignId);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="sr-only">جاري التحميل...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">خطأ</p>
          <p>حدث خطأ أثناء تحميل بيانات الحملة. يرجى المحاولة مرة أخرى لاحقًا.</p>
        </div>
        <Link href="/umrah-offices/dashboard/campaigns" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-4">
          <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
          العودة إلى قائمة الحملات
        </Link>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-400 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">تنبيه</p>
          <p>لم يتم العثور على الحملة المطلوبة.</p>
        </div>
        <Link href="/umrah-offices/dashboard/campaigns" className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mt-4">
          <ArrowRight className="ms-2 h-5 w-5 rtl:rotate-180" />
          العودة إلى قائمة الحملات
        </Link>
      </div>
    );
  }

  // تحويل تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  };
  
  // حساب نسبة الحجز
  const bookedPercentage = Math.round((campaign.registeredCount / campaign.capacity) * 100);
  
  // تحديد لون نسبة الحجز
  const getBookingStatusColor = () => {
    if (bookedPercentage >= 90) return 'text-red-600 dark:text-red-400';
    if (bookedPercentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    if (bookedPercentage >= 40) return 'text-green-600 dark:text-green-400';
    return 'text-blue-600 dark:text-blue-400';
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <Link href="/umrah-offices/dashboard/campaigns" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center">
              <ArrowRight className="ms-1 h-4 w-4 rtl:rotate-180" />
              الحملات
            </Link>
            <span className="mx-2 text-gray-500">/</span>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
          </div>
          <div className="flex items-center">
            <div className={`px-3 py-1 rounded-full text-sm font-medium mr-2 ${
              campaign.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
              campaign.status === 'upcoming' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' :
              campaign.status === 'completed' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
              campaign.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {campaign.status === 'active' ? 'نشطة' :
               campaign.status === 'upcoming' ? 'قادمة' :
               campaign.status === 'completed' ? 'مكتملة' :
               campaign.status === 'cancelled' ? 'ملغية' : 'غير معروفة'}
            </div>
            <span className="text-gray-500 dark:text-gray-400">
              {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <AddCampaignsDialog 
            mode="edit"
            campaignId={campaignId}
            initialData={campaign}
            triggerButton={
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center">
                تعديل الحملة
              </button>
            }
          />
          
          <button 
            onClick={() => {
              if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الحملة؟')) {
                // هنا يمكن إضافة كود لحذف الحملة
                router.push('/umrah-offices/dashboard/campaigns');
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
          >
            حذف الحملة
          </button>
        </div>
      </div>
      
      {/* محتوى الصفحة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* القسم الرئيسي */}
        <div className="lg:col-span-2 space-y-6">
          {/* بطاقة التفاصيل */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">تفاصيل الحملة</h2>
            <div className="prose dark:prose-invert max-w-none">
              <p>{campaign.description}</p>
            </div>
            
            {/* تفاصيل الإقامة */}
            {campaign.accommodationDetails && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <Building className="ml-1 h-5 w-5 text-blue-600 dark:text-blue-400" />
                  تفاصيل الإقامة
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {campaign.accommodationDetails}
                </p>
              </div>
            )}
            
            {/* المواصلات */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 flex items-center">
                <Bus className="ml-1 h-5 w-5 text-blue-600 dark:text-blue-400" />
                المواصلات
              </h3>
              <p className="text-gray-700 dark:text-gray-300">
                {campaign.transportationIncluded ? 
                  'تشمل الحملة خدمة المواصلات' : 
                  'لا تشمل الحملة خدمة المواصلات'
                }
              </p>
            </div>
          </div>

          {/* برنامج الرحلة */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">برنامج الرحلة</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="min-w-10 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">1</div>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">اليوم الأول: الوصول واستقبال المعتمرين</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">استقبال المعتمرين في المطار والانتقال إلى مقر الإقامة.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="min-w-10 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">2</div>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">اليوم الثاني: أداء مناسك العمرة</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">الانتقال إلى الحرم المكي وأداء مناسك العمرة مع المرشد.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="min-w-10 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">3</div>
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">الأيام التالية: زيارة المعالم الإسلامية</h3>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">زيارة المعالم الإسلامية في مكة المكرمة والمدينة المنورة.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* الشريط الجانبي */}
        <div className="space-y-6">
          {/* بطاقة معلومات الحملة */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">معلومات الحملة</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">السعر:</span>
                <span className="font-semibold">{campaign.price.toLocaleString('ar-SA')} ر.س</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">المدة:</span>
                <span className="font-semibold">
                  {Math.ceil((new Date(campaign.endDate).getTime() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24))} أيام
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">تاريخ البداية:</span>
                <span className="font-semibold">{formatDate(campaign.startDate)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">تاريخ النهاية:</span>
                <span className="font-semibold">{formatDate(campaign.endDate)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">السعة الكلية:</span>
                <span className="font-semibold">{campaign.capacity} مقعد</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">المقاعد المحجوزة:</span>
                <span className="font-semibold">{campaign.registeredCount} مقعد</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">المقاعد المتبقية:</span>
                <span className={`font-semibold ${getBookingStatusColor()}`}>{campaign.capacity - campaign.registeredCount} مقعد</span>
              </div>
              
              <div className="pt-2">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:text-blue-300 dark:bg-blue-900">
                        نسبة الحجز
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold inline-block ${getBookingStatusColor()}`}>
                        {bookedPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                    <div style={{ width: `${bookedPercentage}%` }} className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                      bookedPercentage >= 90 ? 'bg-red-500' :
                      bookedPercentage >= 70 ? 'bg-yellow-500' :
                      bookedPercentage >= 40 ? 'bg-green-500' : 'bg-blue-500'
                    }`}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* بطاقة الإجراءات */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 dark:border-gray-700">إجراءات</h2>
            <div className="space-y-3">
              <Link 
                href={`/umrah-offices/dashboard/bookings?campaignId=${campaign.id}`}
                className="w-full bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 block"
              >
                عرض الحجوزات
              </Link>
              
              <button 
                onClick={() => window.print()}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-center py-2 px-4 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 block"
              >
                طباعة معلومات الحملة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}