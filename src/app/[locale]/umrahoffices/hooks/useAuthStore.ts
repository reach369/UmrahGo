import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';

// تعريف مخطط المستخدم باستخدام Zod
const UserSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  role: z.enum(['user', 'admin', 'office_manager']).default('user'),
  officeId: z.string().optional(), // معرف المكتب المُدار، إذا كان الدور مدير مكتب
});

export type User = z.infer<typeof UserSchema>;

// تعريف حالة مخزن المصادقة والإجراءات
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // الإجراءات
  login: (userData: User) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// إنشاء وتصدير مخزن المصادقة مع الاستمرارية
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      // إجراء تسجيل الدخول
      login: (userData) => {
        try {
          // التحقق من صحة بيانات المستخدم باستخدام Zod
          const validatedUser = UserSchema.parse(userData);
          
          set({
            user: validatedUser,
            isAuthenticated: true,
            error: null,
          });
        } catch (err) {
          let errorMessage = 'Invalid user data';
          if (err instanceof z.ZodError) {
            errorMessage = err.issues.map(e => e.message).join(', ');
          }
          set({ error: errorMessage });
        }
      },
      
      // إجراء تسجيل الخروج
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },
      
      // تعيين حالة التحميل
      setLoading: (loading) => {
        set({ isLoading: loading });
      },
      
      // تعيين رسالة الخطأ
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'umrah-offices-auth-store', // اسم مفتاح التخزين المحلي
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // حفظ هذه الخصائص فقط
    }
  )
);