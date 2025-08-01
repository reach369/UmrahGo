import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_URL = 'https://admin.umrahgo.net/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Testimonials proxy: Attempting to fetch from API...');
    
    const response = await axios.get(`${API_URL}/public/testimonials`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'UmrahGo-Frontend/1.0'
      },
      timeout: 10000,
    });

    console.log('Testimonials proxy: Successfully fetched from API');
    res.status(200).json(response.data);
  } catch (error: any) {
    console.log('Testimonials proxy: API failed, returning sample data');
    
    // Return sample data as fallback
    const sampleData = [
      {
        id: '1',
        name: 'أحمد محمد',
        content: 'تجربة رائعة مع خدمة ممتازة ومنظمة جداً. أنصح بها بشدة',
        rating: 5,
        location: 'الرياض، المملكة العربية السعودية',
        date: '2024-01-15',
        avatar: '/images/testimonial-1.jpg'
      },
      {
        id: '2',
        name: 'فاطمة الزهراء',
        content: 'خدمة احترافية وأسعار مناسبة. الفريق متعاون جداً',
        rating: 5,
        location: 'جدة، المملكة العربية السعودية',
        date: '2024-01-10',
        avatar: '/images/testimonial-2.jpg'
      },
      {
        id: '3',
        name: 'محمد علي',
        content: 'باقة شاملة ومنظمة بشكل ممتاز. سأكررها إن شاء الله',
        rating: 5,
        location: 'الدمام، المملكة العربية السعودية',
        date: '2024-01-05',
        avatar: '/images/testimonial-3.jpg'
      },
      {
        id: '4',
        name: 'عائشة أحمد',
        content: 'رحلة روحانية رائعة بفضل التنظيم المتميز والاهتمام بالتفاصيل',
        rating: 5,
        location: 'مكة المكرمة، المملكة العربية السعودية',
        date: '2023-12-28',
        avatar: '/images/testimonial-4.jpg'
      }
    ];

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Sample testimonials data (API unavailable)',
      data: sampleData
    });
  }
} 