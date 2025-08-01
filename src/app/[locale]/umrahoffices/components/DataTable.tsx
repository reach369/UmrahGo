// استيراد الأيقونات المطلوبة من مكتبة lucide-react
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

// تعريف واجهة العمود للجدول
interface Column<T> {
  header: string;
  accessor: ((item: T) => ReactNode) | keyof T;
  className?: string;
}

// تعريف خصائص مكون جدول البيانات
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  isLoading?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
}

// المكون الرئيسي لجدول البيانات
export default function DataTable<T>({
  data,
  columns,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  isLoading = false,
  emptyMessage = "لا توجد بيانات متطابقة مع معايير البحث",
  loadingMessage = "جاري التحميل..."
}: DataTableProps<T>) {
  // حسابات الصفحات
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  return (
    <div className=" dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          {/* رأس الجدول */}
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          {/* جسم الجدول */}
          <tbody className=" dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              // عرض مؤشر التحميل
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
                      <span className="sr-only">{loadingMessage}</span>
                    </div>
                  </div>
                </td>
              </tr>
            ) : currentItems.length > 0 ? (
              // عرض البيانات
              currentItems.map((item, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${column.className || ''}`}
                    >
                      {typeof column.accessor === 'function'
                        ? column.accessor(item)
                        : String(item[column.accessor])}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              // رسالة عندما لا توجد بيانات
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* شريط التنقل بين الصفحات */}
      {data.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="flex items-center  dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm">
                {/* زر الصفحة السابقة */}
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 border-l border-gray-300 dark:border-gray-600"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {/* عرض رقم الصفحة الحالية */}
                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-l border-r border-gray-300 dark:border-gray-600">
                  {currentPage} من {totalPages}
                </div>
                {/* زر الصفحة التالية */}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            {/* عرض معلومات عن نطاق البيانات المعروضة */}
            <div className="text-sm text-gray-700 dark:text-gray-300">
              عرض {indexOfFirstItem + 1} إلى {Math.min(indexOfLastItem, data.length)} من {data.length} عملية
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 