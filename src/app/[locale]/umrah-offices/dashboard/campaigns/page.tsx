'use client';

// استيراد المكتبات والمكونات اللازمة
import { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Users, CreditCard, PenSquare, Trash2, Bus, Search, Building, ChevronLeft, ChevronRight, AlertTriangle 
} from 'lucide-react';
import { useGetCampaignsQuery, useDeleteCampaignMutation, Campaign } from '../../redux/api/campaignsApiSlice';
import { useAppSelector, useAppDispatch } from '../../hooks/reduxHooks';
import { setFilterStatus, setSearchQuery } from '../../redux/slices/campaignSlice';
import Link from 'next/link';
import AddCampaignsDialog from '../../components/layout/addCompaingsDialog';

// مكون شارة الحالة
function StatusBadge({ status }: { status: 'active' | 'completed' }) {
  const styles = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800'
  };

  const labels = {
    active: 'نشطة',
    completed: 'مكتملة'
  };

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// مؤشر سعة الحملة
function CapacityIndicator({ available_seats, total_capacity }: { available_seats: number; total_capacity: number }) {
  // حساب عدد المقاعد المحجوزة والنسبة المئوية
  const booked_seats = total_capacity - available_seats;
  const percentage = Math.min(100, Math.round((booked_seats / total_capacity) * 100));
  
  let bgColor = 'bg-blue-600';
  
  if (percentage >= 90) {
    bgColor = 'bg-red-600';
  } else if (percentage >= 70) {
    bgColor = 'bg-yellow-600';
  } else if (percentage >= 40) {
    bgColor = 'bg-green-600';
  }
  
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1 text-xs">
        <span>{booked_seats} مسجل</span>
        <span>{total_capacity} مقعد</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`${bgColor} h-2 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

// تعريف نوع البيانات المحولة
interface MappedCampaign extends Campaign {
  _package_id?: string;
  _office_id?: string;
  _created_at?: string;
  _available_seats?: number;
}

// تحويل بيانات الحملات إلى الشكل المطلوب
const mapCampaignData = (campaigns: any[] | undefined): MappedCampaign[] => {
  if (!campaigns) return [];
  
  return campaigns.map((campaign: any) => ({
    id: campaign.id,
    name: campaign.name,
    description: campaign.description,
    startDate: campaign.startDate || campaign.start_date,
    endDate: campaign.endDate || campaign.end_date,
    price: campaign.price || 0,
    capacity: campaign.capacity || campaign.available_seats + 20, // تقدير سعة الحملة
    registeredCount: campaign.registeredCount || 20, // قيمة افتراضية
    status: campaign.status,
    transportationIncluded: campaign.transportationIncluded || false,
    accommodationDetails: campaign.accommodationDetails || '',
    // حقول إضافية للعرض فقط
    _package_id: campaign.package_id,
    _office_id: campaign.office_id || campaign.officeId,
    _created_at: campaign.created_at,
    _available_seats: campaign.available_seats
  }));
};

// Update campaign card display
function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4">
        <StatusBadge status={campaign.status} />
        <h3 className="text-lg font-semibold mt-2">{campaign.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{campaign.description}</p>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>المقاعد المتاحة:</span>
            <span className="font-medium">{campaign.available_seats}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>تاريخ البداية:</span>
            <span>{new Date(campaign.start_date).toLocaleDateString('ar-SA')}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>تاريخ النهاية:</span>
            <span>{new Date(campaign.end_date).toLocaleDateString('ar-SA')}</span>
          </div>
        </div>
        
        {/* ... actions buttons ... */}
      </div>
    </div>
  );
}

export default function CampaignsPage() {
  // الحصول على معرف المكتب من حالة المصادقة
  const { user } = useAppSelector(state => state.auth);
  const officeId = user?.officeId;

  // حالة Redux للتصفية
  const dispatch = useAppDispatch();
  const { filterStatus, searchQuery } = useAppSelector((state) => state.campaign as {
    filterStatus: string | null;
    searchQuery: string;
  });
  
  // حالة محلية للصفحات
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  
  // جلب الحملات باستخدام RTK Query
  const { data: campaignsData, isLoading: campaignsLoading, refetch: refetchCampaigns, error: campaignsError } = useGetCampaignsQuery(
    { status: filterStatus === 'all' || filterStatus === null ? undefined : filterStatus }
  );
  
  // دالة حذف الحملة
  const [deleteCampaign, { isLoading: isDeleting }] = useDeleteCampaignMutation();

  // تهيئة حالة التصفية إذا لزم الأمر
  useEffect(() => {
    if (!filterStatus) {
      dispatch(setFilterStatus('all'));
    }
  }, [filterStatus, dispatch]);
  
  // تحويل البيانات
  const mappedCampaigns = mapCampaignData(campaignsData);

  // فلترة البيانات
  const filteredCampaigns = mappedCampaigns ? mappedCampaigns.filter(campaign => {
    const matchesSearch = searchQuery === '' || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || filterStatus === null || campaign.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) : [];
  
  // ترقيم الصفحات
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCampaigns.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  
  // معالج حذف الحملة
  const handleDeleteCampaign = async (campaignId: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه الحملة؟')) {
      try {
        await deleteCampaign(campaignId).unwrap();
        refetchCampaigns();
      } catch (error) {
        console.error('Failed to delete campaign:', error);
        alert('حدث خطأ أثناء محاولة حذف الحملة');
      }
    }
  };
  
  // تتبع حالة البيانات
  useEffect(() => {
    console.log('Campaigns data:', campaignsData);
    console.log('Campaigns loading:', campaignsLoading);
    console.log('Campaigns error:', campaignsError);
    console.log('User office ID:', officeId);
  }, [campaignsData, campaignsLoading, campaignsError, officeId]);
  
  // تحديد إذا كانت الصفحة تستخدم بيانات افتراضية
  const useMockData = !!campaignsError;
  
  return (
    <div className="container mx-auto px-4">
      {/* API Status Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-yellow-500" />
        <div>
          <h3 className="font-bold text-yellow-800">حالة الاتصال بـ API</h3>
          <p className="text-yellow-700">
            {useMockData 
              ? "❌ هذه الصفحة تستخدم بيانات افتراضية وليست متصلة بـ API حقيقي" 
              : "✅ هذه الصفحة متصلة بـ API حقيقي"}
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-2">إدارة الحملات</h1>
            <p className="text-gray-600 dark:text-gray-300">إنشاء وتعديل حملات العمرة الخاصة بك</p>
          </div>
          <AddCampaignsDialog onSuccess={refetchCampaigns} />
        </div>
      </div>
      
      {/* التصفية والبحث */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 w-full">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="بحث في الحملات..."
                className="block w-full pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-gray-300"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />
            </div>
            
            <select
              value={filterStatus || 'all'}
              onChange={(e) => dispatch(setFilterStatus(e.target.value))}
              className="block w-full md:w-auto py-2 px-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-gray-300"
            >
              <option value="all">جميع الحملات</option>
              <option value="active">النشطة</option>
              <option value="upcoming">القادمة</option>
              <option value="completed">المكتملة</option>
              <option value="cancelled">الملغية</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* شبكة الحملات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {campaignsLoading ? (
          <div className="col-span-3 flex justify-center items-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="sr-only">جاري التحميل...</span>
            </div>
          </div>
        ) : currentItems.length > 0 ? (
          currentItems.map((campaign) => (
            <div 
              key={campaign.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* رأس الحملة */}
              <div className="bg-blue-600 text-white p-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg truncate">{campaign.name}</h3>
                  <StatusBadge status={campaign.status} />
                </div>
                <div className="mt-2 text-sm opacity-90">
                  {new Date(campaign.startDate).toLocaleDateString('ar-SA')} - {new Date(campaign.endDate).toLocaleDateString('ar-SA')}
                </div>
              </div>
              
              {/* تفاصيل الحملة */}
              <div className="p-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {campaign.description}
                </p>
                
                {/* الإحصائيات */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <CreditCard className="h-5 w-5 ml-2 text-blue-600 dark:text-blue-400" />
                      <span>رقم الباقة:</span>
                    </div>
                    <span className="font-medium">{campaign._package_id || 'غير محدد'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Building className="h-5 w-5 ml-2 text-blue-600 dark:text-blue-400" />
                      <span>رقم المكتب:</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {campaign._office_id || 'غير محدد'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                      <Calendar className="h-5 w-5 ml-2 text-blue-600 dark:text-blue-400" />
                      <span>تاريخ الإنشاء:</span>
                    </div>
                    <span>{campaign._created_at ? new Date(campaign._created_at).toLocaleDateString('ar-SA') : new Date().toLocaleDateString('ar-SA')}</span>
                  </div>
                  
                  <div>
                    <CapacityIndicator 
                      available_seats={campaign._available_seats || campaign.capacity - campaign.registeredCount} 
                      total_capacity={campaign.capacity} 
                    />
                  </div>
                </div>
                
                {/* الإجراءات */}
                <div className="mt-6 flex justify-end space-x-2 rtl:space-x-reverse">
                  <button
                    onClick={() => handleDeleteCampaign(campaign.id)}
                    disabled={isDeleting}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 rounded-md disabled:opacity-50"
                    title="حذف"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  
                  <AddCampaignsDialog 
                    mode="edit"
                    campaignId={campaign.id}
                    initialData={campaign}
                    onSuccess={refetchCampaigns}
                    triggerButton={
                      <button
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-md"
                        title="تعديل"
                      >
                        <PenSquare className="h-5 w-5" />
                      </button>
                    }
                  />
                  
                  <Link
                    href={`/umrah-offices/dashboard/campaigns/${campaign.id}`}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">لا توجد حملات</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              لم يتم العثور على حملات تطابق معايير البحث الخاصة بك.
            </p>
            {filterStatus !== 'all' || searchQuery !== '' ? (
              <button
                onClick={() => {
                  dispatch(setFilterStatus('all'));
                  dispatch(setSearchQuery(''));
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                إعادة ضبط الفلتر
              </button>
            ) : (
              <AddCampaignsDialog onSuccess={refetchCampaigns} />
            )}
          </div>
        )}
      </div>
      
      {/* الترقيم */}
      {filteredCampaigns.length > itemsPerPage && (
        <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse my-6">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">السابق</span>
          </button>
          
          {/* مؤشرات أرقام الصفحات */}
          {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
            let pageNumber;
            
            if (totalPages <= 5) {
              pageNumber = index + 1;
            } else if (currentPage <= 3) {
              pageNumber = index + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + index;
            } else {
              pageNumber = currentPage - 2 + index;
            }
            
            return (
              <button
                key={index}
                onClick={() => setCurrentPage(pageNumber)}
                className={`relative inline-flex items-center px-4 py-2 rounded-md border ${
                  currentPage === pageNumber 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900 dark:border-blue-400' 
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                } text-sm font-medium ${
                  currentPage === pageNumber 
                    ? 'text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                } hover:bg-gray-50 dark:hover:bg-gray-700`}
              >
                {pageNumber}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">التالي</span>
          </button>
        </div>
      )}
    </div>
  );
} 