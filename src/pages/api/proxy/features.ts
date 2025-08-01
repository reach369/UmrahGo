import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_URL = 'https://admin.umrahgo.net/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Features proxy: Attempting to fetch from API...');
    
    const response = await axios.get(`${API_URL}/public/features`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'UmrahGo-Frontend/1.0'
      },
      timeout: 10000,
    });

    console.log('Features proxy: Successfully fetched from API');
    res.status(200).json(response.data);
  } catch (error: any) {
    console.log('Features proxy: API failed, returning sample data');
    
    // Return sample data as fallback
    const sampleData = [
      {
        id: '1',
        title: 'حجز سهل وآمن',
        description: 'نظام حجز متطور وآمن يضمن حماية بياناتك الشخصية',
        icon: 'shield'
      },
      {
        id: '2',
        title: 'أسعار تنافسية',
        description: 'أفضل الأسعار في السوق مع ضمان الجودة والخدمة المميزة',
        icon: 'dollar'
      },
      {
        id: '3',
        title: 'دعم 24/7',
        description: 'فريق دعم متاح على مدار الساعة لمساعدتك في أي وقت',
        icon: 'support'
      },
      {
        id: '4',
        title: 'مكاتب معتمدة',
        description: 'جميع مكاتب العمرة على منصتنا معتمدة ومرخصة رسمياً',
        icon: 'verified'
      },
      {
        id: '5',
        title: 'باقات متنوعة',
        description: 'مجموعة واسعة من الباقات لتناسب جميع الاحتياجات والميزانيات',
        icon: 'packages'
      },
      {
        id: '6',
        title: 'خدمة متكاملة',
        description: 'خدمات شاملة من الحجز حتى العودة لضمان رحلة مريحة',
        icon: 'service'
      }
    ];

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Sample features data (API unavailable)',
      data: sampleData
    });
  }
} 