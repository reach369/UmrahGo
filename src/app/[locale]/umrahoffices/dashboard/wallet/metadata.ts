import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | نظام المحافظ - مكاتب العمرة',
    default: 'نظام المحافظ - مكاتب العمرة'
  },
  description: 'إدارة شاملة للمحافظ والمعاملات المالية لمكاتب العمرة',
  keywords: [
    'محافظ', 'مالية', 'عمرة', 'مكاتب', 'معاملات', 
    'تقارير', 'إحصائيات', 'سحب', 'ودائع',
    'wallets', 'financial', 'umrah', 'offices', 'transactions'
  ],
  authors: [{ name: 'UmrahGo Team' }],
  robots: {
    index: false, // Private dashboard pages shouldn't be indexed
    follow: false
  }
}; 