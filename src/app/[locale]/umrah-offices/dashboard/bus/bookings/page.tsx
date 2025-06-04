'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, ClockIcon, Filter, Search, ChevronLeft, ChevronRight,
  Download, Eye, MoreHorizontal, RefreshCcw, AlertTriangle, Plus
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import { setFilterStatus, setSearchQuery } from '../../../redux/slices/bookingSlice';
import Link from 'next/link';
import DataTable from '../../../components/DataTable';
import { ReactNode } from 'react';

// Define the BusBooking interface
interface BusBooking {
  id: number;
  user_id: number;
  bus_id: number | null;
  campaign_id: number | null;
  booking_date: string;
  status: 'pending' | 'confirmed';
  payment_status: 'paid' | 'unpaid';
  total_price: number;
  user_name?: string;
  bus_model?: string;
  campaign_name?: string;
}

// Define the Column interface
interface Column<T> {
  header: string;
  accessor: ((item: T) => ReactNode) | keyof T;
  className?: string;
}

// Status badge component
function StatusBadge({ status }: { status: string }) {
  let bg = '';
  let text = '';
  let icon = null;
  
  switch (status) {
    case 'confirmed':
      bg = 'bg-green-100';
      text = 'text-green-800';
      icon = <CheckCircle className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          مؤكد
        </span>
      );
    case 'pending':
      bg = 'bg-yellow-100';
      text = 'text-yellow-800';
      icon = <ClockIcon className="ml-1 h-4 w-4" />;
      return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          {icon}
          معلق
        </span>
      );
    default:
      return null;
  }
}

// Payment status badge component
function PaymentBadge({ status }: { status: string }) {
  let bg = '';
  let text = '';
  
  switch (status) {
    case 'paid':
      bg = 'bg-green-100';
      text = 'text-green-800';
      return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          مدفوع
        </span>
      );
    case 'unpaid':
      bg = 'bg-yellow-100';
      text = 'text-yellow-800';
      return (
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${bg} ${text}`}>
          غير مدفوع
        </span>
      );
    default:
      return null;
  }
}

// Main bus bookings page component
export default function BusBookingsPage() {
  // Get URL params
  const searchParams = useSearchParams();
  const statusParam = searchParams.get('status');
  
  // Redux state with default values
  const dispatch = useAppDispatch();
  const bookingState = useAppSelector(state => state.booking || {});
  const filterStatus = bookingState.filterStatus || 'all';
  const searchQuery = bookingState.searchQuery || '';
  
  // Local state for UI
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isDropdownOpen, setIsDropdownOpen] = useState<string | null>(null);
  
  // Get office ID (would usually come from auth state)
  const officeId = 'office-1'; // Example ID for demonstration
  
  // Mock data for bus bookings
  const mockBusBookings: BusBooking[] = [
    {
      id: 1,
      user_id: 1,
      bus_id: 1,
      campaign_id: 1,
      booking_date: '2024-03-26',
      status: 'pending',
      payment_status: 'unpaid',
      total_price: 500,
      user_name: 'أحمد محمد',
      bus_model: 'مرسيدس بنز',
      campaign_name: 'حملة رمضان 2024'
    },
    {
      id: 2,
      user_id: 2,
      bus_id: 2,
      campaign_id: 2,
      booking_date: '2024-03-25',
      status: 'confirmed',
      payment_status: 'paid',
      total_price: 450,
      user_name: 'سارة أحمد',
      bus_model: 'تويوتا',
      campaign_name: 'حملة رمضان 2024'
    }
  ];
  
  // Filter bookings based on status
  const getFilteredBookings = () => {
    let result = [...mockBusBookings];
    
    if (filterStatus && filterStatus !== 'all') {
      result = result.filter(booking => booking.status === filterStatus);
    }
    
    return result;
  };
  
  // Filter bookings based on search
  const filteredBookings = getFilteredBookings().filter(booking => {
    const userName = booking.user_name || '';
    const bookingId = booking.id.toString();
    
    const matchesSearch = searchQuery === '' ||
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bookingId.includes(searchQuery);
    
    return matchesSearch;
  });
  
  // Table columns configuration
  const columns: Column<BusBooking>[] = [
    {
      header: 'رقم الحجز',
      accessor: (booking: BusBooking) => booking.id,
    },
    {
      header: 'المعتمر',
      accessor: (booking: BusBooking) => booking.user_name || '',
    },
    {
      header: 'الباص',
      accessor: (booking: BusBooking) => booking.bus_model || '-',
    },
    {
      header: 'الحملة',
      accessor: (booking: BusBooking) => booking.campaign_name || '-',
    },
    {
      header: 'تاريخ الحجز',
      accessor: (booking: BusBooking) => booking.booking_date,
    },
    {
      header: 'المبلغ',
      accessor: (booking: BusBooking) => `${booking.total_price} ر.س`,
    },
    {
      header: 'حالة الحجز',
      accessor: (booking: BusBooking) => <StatusBadge status={booking.status} />,
    },
    {
      header: 'حالة الدفع',
      accessor: (booking: BusBooking) => <PaymentBadge status={booking.payment_status} />,
    },
    {
      header: 'الإجراءات',
      accessor: (booking: BusBooking) => (
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(isDropdownOpen === booking.id.toString() ? null : booking.id.toString())}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
          
          {isDropdownOpen === booking.id.toString() && (
            <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-1">
                <Link
                  href={`/ar/umrah-offices/dashboard/bus/bookings/${booking.id}`}
                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Eye className="inline-block ml-1 h-4 w-4" />
                  عرض التفاصيل
                </Link>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ];
  
  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  
  // Update status filter when URL param changes
  useEffect(() => {
    if (statusParam) {
      dispatch(setFilterStatus(statusParam));
    } else if (!filterStatus) {
      dispatch(setFilterStatus('all'));
    }
  }, [statusParam, filterStatus, dispatch]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">حجوزات الباصات</h1>
        <Link 
          href="/umrah-offices/dashboard/bus/bookings/new" 
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 ml-2" />
          حجز جديد
        </Link>
      </div>
      
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="بحث في الحجوزات..."
                className="block w-full pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-gray-300"
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              />
            </div>
            
            <div className="relative">
              <select
                value={filterStatus || 'all'}
                onChange={(e) => dispatch(setFilterStatus(e.target.value))}
                className="block w-full py-2 pl-10 pr-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-gray-300"
              >
                <option value="all">جميع الحجوزات</option>
                <option value="pending">معلق</option>
                <option value="confirmed">مؤكد</option>
              </select>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <button
              className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
              onClick={() => {
                // In a real app, this would export bookings to a CSV file
                alert('تم تصدير البيانات بنجاح');
              }}
            >
              <Download className="ml-2 h-5 w-5" />
              تصدير البيانات
            </button>
          </div>
        </div>
      </div>
      
      {/* Bookings Table */}
      <DataTable
        data={filteredBookings}
        columns={columns}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        itemsPerPage={itemsPerPage}
        isLoading={false}
      />
    </div>
  );
} 