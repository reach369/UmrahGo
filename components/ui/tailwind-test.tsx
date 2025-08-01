'use client';

import { useState } from 'react';

export function TailwindTest() {
  const [active, setActive] = useState(false);
  
  return (
    <div className="p-8 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-primary mb-4">اختبار تنسيقات Tailwind CSS</h2>
      
      <div className="space-y-4">
        {/* اختبار الألوان */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-primary text-primary-foreground p-4 rounded-lg text-center">primary</div>
          <div className="bg-secondary text-secondary-foreground p-4 rounded-lg text-center">secondary</div>
          <div className="bg-accent text-accent-foreground p-4 rounded-lg text-center">accent</div>
          <div className="bg-muted text-muted-foreground p-4 rounded-lg text-center">muted</div>
        </div>
        
        {/* اختبار التحولات والحركات */}
        <button
          className={`w-full p-3 rounded-lg transition-all duration-300 ${
            active
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted hover:bg-primary/20 text-foreground'
          }`}
          onClick={() => setActive(!active)}
        >
          انقر للتبديل ({active ? 'نشط' : 'غير نشط'})
        </button>
        
        {/* اختبار التدرجات اللونية */}
        <div className="grid grid-cols-2 gap-2">
          <div className="btn-gradient-primary p-4 rounded-lg text-center">تدرج أساسي</div>
          <div className="btn-gradient-gold p-4 rounded-lg text-center">تدرج ذهبي</div>
        </div>
        
        {/* اختبار المساحات والحدود */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground mb-2">اختبار الحدود والمساحات</p>
          <div className="flex justify-between">
            <span className="bg-primary/10 px-3 py-1 rounded-full text-xs font-medium">صغير</span>
            <span className="bg-primary/20 px-3 py-1 rounded-md text-xs font-medium">متوسط</span>
            <span className="bg-primary/30 px-3 py-1 rounded-lg text-xs font-medium">كبير</span>
          </div>
        </div>
        
        {/* اختبار أحجام النص */}
        <div className="space-y-2">
          <p className="text-xs">نص صغير جدًا (xs)</p>
          <p className="text-sm">نص صغير (sm)</p>
          <p className="text-base">نص أساسي (base)</p>
          <p className="text-lg">نص كبير (lg)</p>
          <p className="text-xl">نص كبير جدًا (xl)</p>
          <p className="text-2xl">عنوان مستوى 2 (2xl)</p>
        </div>
      </div>
    </div>
  );
} 