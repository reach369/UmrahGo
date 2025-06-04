"use client";

// استيراد المكتبات والأدوات اللازمة من React والسياقات المخصصة
// - useEffect: للتعامل مع التأثيرات الجانبية عند تحميل المكون
// - useRef: لتخزين قيمة مرجعية ثابتة بين عمليات إعادة التصيير
import { useEffect, useRef } from 'react';
// استيراد خطاف useAuth للوصول إلى سياق المصادقة وإدارة حالة المستخدم
import { useAuth } from '@/context/AuthContext';
// استيراد نوع خصائص مكون ملف تعريف المستخدم
import { UserProfileProps } from '@/types/components.types';
import { User } from '@/types/auth.types';

// مكون ملف تعريف المستخدم (UserProfile)
// الغرض: عرض المعلومات التفصيلية للمستخدم في واجهة منظمة
// المدخلات: 
// - initialData: البيانات الأولية للمستخدم من نوع User
// الوظائف:
// - تهيئة بيانات المستخدم في سياق المصادقة
// - عرض معلومات المستخدم بشكل منسق ومنظم
export default function UserProfile({ initialData }: UserProfileProps) {
  // استخدام سياق المصادقة للوصول إلى حالة المستخدم وإمكانية تحديثها
  // - state: يحتوي على بيانات المستخدم الحالية
  // - dispatch: دالة لإرسال الإجراءات وتحديث الحالة
  const { state, dispatch } = useAuth();
  
  // مرجع للتحقق من حالة تهيئة البيانات
  // يستخدم لضمان تهيئة البيانات مرة واحدة فقط عند تحميل المكون
  const initialized = useRef(false);

  // تأثير جانبي لإدارة تهيئة بيانات المستخدم
  // يعمل عند تحميل المكون وعند تغيير البيانات الأولية أو دالة dispatch
  useEffect(() => {
    // التحقق من شرطين:
    // 1. عدم تهيئة البيانات مسبقاً (initialized.current === false)
    // 2. توفر البيانات الأولية (initialData !== null/undefined)
    if (!initialized.current && initialData) {
      // إرسال إجراء لتسجيل دخول المستخدم مع البيانات الأولية
      // يؤدي إلى تحديث حالة المصادقة وتخزين بيانات المستخدم
      dispatch({ type: 'LOGIN_SUCCESS', payload: initialData });
      
      // تحديث حالة التهيئة لمنع التهيئة المتكررة
      initialized.current = true;
    }
  }, [initialData, dispatch]);

  // عرض حالة التحميل إذا لم تكن بيانات المستخدم متوفرة بعد
  // يظهر أثناء تحميل البيانات أو في حالة عدم وجود مستخدم
  if (!state.user) {
    return (
      <div className="p-4">
        <p>Loading data...</p>
      </div>
    );
  }

  // عرض واجهة المستخدم الرئيسية مع كافة المعلومات
  // تنظيم المعلومات في أقسام مع تنسيق مناسب
  return (
    <div className="p-4 space-y-4">
      {state.user.map((user: User) => (
        <div key={user.id} className="border p-4 rounded-lg mb-4">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Website:</strong> {user.website}</p>
            <p><strong>Company:</strong> {user.company?.name}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 