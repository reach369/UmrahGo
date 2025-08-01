// استيراد المكتبات والمكونات اللازمة
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OfficeWithPackages } from '../types';

// تعريف واجهة خصائص مكون بطاقة المكتب
interface OfficeCardProps {
  office: OfficeWithPackages;
  onClick: (office: OfficeWithPackages) => void;
}

// مكون بطاقة المكتب
export const OfficeCard = ({ office, onClick }: OfficeCardProps) => {
  // حساب أقل سعر للباقات وعدد الحملات النشطة
  const lowestPrice = Math.min(...office.packages.map(pkg => pkg.price));
  const activeCampaigns = office.campaigns.filter(campaign => campaign.status === 'active').length;
  
  return (
    <Card 
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-primary/20 hover:border-primary"
      onClick={() => onClick(office)}
    >
      {/* رأس البطاقة - يحتوي على شعار المكتب واسمه وعنوانه */}
      <CardHeader className="flex flex-row items-center gap-4 pb-4">
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors">
          <Image
            src={office.logo}
            alt={office.office_name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-primary">
            {office.office_name}
          </CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {office.address}
          </div>
        </div>
      </CardHeader>
      {/* محتوى البطاقة - يعرض معلومات الباقات والحملات والأسعار */}
      <CardContent className="space-y-4 pt-4 border-t border-primary/10">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">الباقات المتاحة</p>
            <p className="text-lg font-semibold text-primary">{office.packages.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">الحملات النشطة</p>
            <p className="text-lg font-semibold text-primary">{activeCampaigns}</p>
          </div>
        </div>
        
        {/* تذييل البطاقة - يعرض السعر وحالة المكتب */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">يبدأ من</p>
            <p className="text-xl font-bold text-primary">{lowestPrice} ريال</p>
          </div>
          <Badge 
            variant={office.status === 'active' ? 'default' : 'destructive'}
            className={office.status === 'active' ? 'bg-primary/20 text-primary hover:bg-primary/30' : ''}
          >
            {office.status === 'active' ? 'نشط' : 'موقوف'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}; 