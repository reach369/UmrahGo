import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_URL = 'https://admin.umrahgo.net/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('How it works proxy: Attempting to fetch from API...');
    
    const response = await axios.get(`${API_URL}/public/how-it-works`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'UmrahGo-Frontend/1.0'
      },
      timeout: 10000,
    });

    console.log('How it works proxy: Successfully fetched from API');
    res.status(200).json(response.data);
  } catch (error: any) {
    console.log('How it works proxy: API failed, returning sample data');
    
    // Return sample data as fallback
    const sampleData = [
      {
        id: 1,
        title: 'ابحث عن الباقة المناسبة',
        description: 'تصفح مجموعة واسعة من باقات العمرة واختر ما يناسب احتياجاتك وميزانيتك',
        icon: 'search',
        order: 1
      },
      {
        id: 2,
        title: 'احجز بسهولة',
        description: 'أكمل عملية الحجز بخطوات بسيطة وآمنة عبر منصتنا الإلكترونية',
        icon: 'booking',
        order: 2
      },
      {
        id: 3,
        title: 'استمتع برحلتك',
        description: 'استمتع بتجربة روحانية مميزة مع خدماتنا المتكاملة ودعمنا على مدار الساعة',
        icon: 'journey',
        order: 3
      },
      {
        id: 4,
        title: 'تقييم التجربة',
        description: 'شاركنا تجربتك وقيّم الخدمة لنتمكن من تحسين خدماتنا باستمرار',
        icon: 'feedback',
        order: 4
      }
    ];

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Sample how it works data (API unavailable)',
      data: sampleData
    });
  }
} 