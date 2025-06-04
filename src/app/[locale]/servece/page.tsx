import Link from 'next/link';

export const metadata = {
  title: 'Our Services',
  description: 'Choose the service you want to provide',
};

export default function Service({ params }: { params: { locale: string } }) {
  const locale = params?.locale || 'ar';
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-12">
          اختر الخدمه التي تقدمها
        </h1>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {/* مكتب عمرة */}
          <Link href={`/${locale}/auth/register/office`} 
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:transform hover:scale-105 transition-all duration-300 text-center border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="bg-blue-50 p-4 rounded-full mb-4">
                {/* يمكنك إضافة أيقونة هنا */}
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">مكتب عمرة</h2>
              <p className="text-gray-600">سجل كمكتب عمرة وأدر خدماتك</p>
            </div>
          </Link>

          {/* شركة باصات */}
          <Link href={`/${locale}/auth/register`}
            className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl hover:transform hover:scale-105 transition-all duration-300 text-center border border-gray-100">
            <div className="flex flex-col items-center">
              <div className="bg-green-50 p-4 rounded-full mb-4">
                {/* يمكنك إضافة أيقونة هنا */}
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">شركة باصات</h2>
              <p className="text-gray-600">سجل كشركة نقل وأدر أسطولك</p>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}