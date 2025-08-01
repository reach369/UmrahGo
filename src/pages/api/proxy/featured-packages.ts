import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_URL = 'https://admin.umrahgo.net/api/v1';

// This API route acts as a proxy to get featured packages from the Umrah API
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log('Featured packages proxy: Attempting to fetch from API...');
    
    // Try the correct endpoint first (packages with is_featured parameter)
    try {
      const response = await axios.get(`${API_URL}/public/packages`, {
        params: { is_featured: true, per_page: 6, ...req.query },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'UmrahGo-Frontend/1.0'
        },
        timeout: 10000,
      });
      
      console.log('Featured packages proxy: Successfully fetched from API');
      return res.status(200).json(response.data);
    } catch (apiError: any) {
      console.log('Featured packages proxy: Primary endpoint failed, trying fallback...');
      
      // Try alternative endpoint
      try {
        const fallbackResponse = await axios.get(`${API_URL}/public/packages/featured`, {
          params: req.query,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'UmrahGo-Frontend/1.0'
          },
          timeout: 10000,
        });
        
        console.log('Featured packages proxy: Successfully fetched from fallback endpoint');
        return res.status(200).json(fallbackResponse.data);
      } catch (fallbackError) {
        console.log('Featured packages proxy: Both endpoints failed, returning sample data');
        throw apiError; // Throw original error to be handled below
      }
    }
  } catch (error: any) {
    console.error('Featured packages proxy error:', error.message);
    
    // Return sample data as fallback
    const sampleData = [
      {
        id: 1,
        office_id: 1,
        name: 'باقة العمرة الذهبية',
        description: 'باقة عمرة متكاملة تشمل الإقامة في فندق 5 نجوم والنقل والإفطار',
        price: 2500,
        discount_price: 2200,
        duration_days: 7,
        is_featured: true,
        status: 'active',
        start_location: 'الرياض',
        end_location: 'مكة المكرمة',
        office: {
          id: 1,
          office_name: 'مكتب الحرمين للعمرة',
          rating: 4.8,
          services_offered: 'نقل، إقامة، وجبات'
        },
        images: [
          {
            id: 1,
            image: '/images/kaaba.jpg',
            is_featured: true
          }
        ]
      },
      {
        id: 2,
        office_id: 2,
        name: 'باقة العمرة الفضية',
        description: 'باقة عمرة اقتصادية مع خدمات أساسية عالية الجودة',
        price: 1800,
        duration_days: 5,
        is_featured: true,
        status: 'active',
        start_location: 'جدة',
        end_location: 'مكة المكرمة',
        office: {
          id: 2,
          office_name: 'مكتب طيبة للحج والعمرة',
          rating: 4.5,
          services_offered: 'نقل، إقامة'
        },
        images: [
          {
            id: 2,
            image: '/images/medina.jpg',
            is_featured: true
          }
        ]
      },
      {
        id: 3,
        office_id: 3,
        name: 'باقة العمرة البرونزية',
        description: 'باقة عمرة ميسرة للعائلات مع خدمات متكاملة',
        price: 1200,
        duration_days: 4,
        is_featured: true,
        status: 'active',
        start_location: 'الدمام',
        end_location: 'مكة المكرمة',
        office: {
          id: 3,
          office_name: 'مكتب الأنوار للعمرة',
          rating: 4.3,
          services_offered: 'نقل، إقامة، إرشاد'
        },
        images: [
          {
            id: 3,
            image: '/images/package-placeholder.jpg',
            is_featured: true
          }
        ]
      }
    ];

    res.status(200).json({
      status: true,
      code: 200,
      message: 'Sample featured packages data (API unavailable)',
      data: {
        data: sampleData,
        total: sampleData.length,
        per_page: 10,
        current_page: 1
      }
    });
  }
} 