import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Define the real API URL directly for reliability
const REAL_API_URL = 'https://umrahgo.reach369.com/api/v1';

// This is a catch-all route to proxy all API requests
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'packages';
  const timestamp = new Date().getTime();
  
  // Map endpoint type to API path
  const apiPathMap: Record<string, string> = {
    'packages': '/public/packages',
    'offices': '/public/offices',
    'featured-packages': '/public/packages/featured'
  };
  
  // Validate endpoint type
  if (!(type in apiPathMap)) {
    return NextResponse.json(
      { error: `Invalid endpoint type: ${type}` },
      { status: 400 }
    );
  }
  
  const apiPath = apiPathMap[type];
  
  // Try multiple API URLs, but start with the real API URL
  const apiUrls = [
    REAL_API_URL,
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  ];
  
  // Forward all query params except 'type'
  const forwardParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    if (key !== 'type') {
      forwardParams[key] = value;
    }
  });
  
  // Add cache-busting parameter
  forwardParams['_t'] = timestamp.toString();
  
  // Store error messages for debugging
  const errors: string[] = [];
  
  // Try each URL until one works
  for (const baseUrl of apiUrls) {
    try {
      console.log(`App router proxy attempting to fetch from: ${baseUrl}${apiPath}`);
      
      const response = await axios.get(`${baseUrl}${apiPath}`, {
        params: forwardParams,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
        },
        timeout: 8000, // Increased timeout
      });
      
      console.log(`Successful proxy response from ${baseUrl}${apiPath}`);
      
      // Add debug info to the response
      const responseData = response.data;
      responseData._debug = {
        source: baseUrl,
        timestamp: new Date().toISOString(),
        path: apiPath
      };
      
      return NextResponse.json(responseData);
    } catch (error: any) {
      const errorMessage = `Error with ${baseUrl}: ${error.message || 'Unknown error'}`;
      console.error(`App router proxy error:`, errorMessage);
      errors.push(errorMessage);
      // Continue to next URL
    }
  }
  
  // If all URLs failed, return sample data from file if available
  try {
    const sampleFileMap: Record<string, { data: any[] }> = {
      'packages': { 
        data: [
          {
            id: 1,
            name: "باكج عمرة فاخر",
            description: "استمتع بتجربة عمرة فاخرة",
            price: "1299.00",
            duration_days: 7,
            is_featured: true,
            images: [{ url: "/images/kaaba.jpg" }]
          }
        ]
      },
      'offices': { 
        data: [
          {
            id: 1,
            office_name: "مكتب النور للعمرة",
            description: "مكتب متخصص في خدمات العمرة",
            rating: 4.8,
            logo: "/images/office-placeholder.jpg"
          }
        ] 
      },
      'featured-packages': { 
        data: [
          {
            id: 1,
            name: "باكج عمرة VIP",
            description: "استمتع بتجربة عمرة فاخرة",
            price: "1999.00",
            duration_days: 12,
            is_featured: true,
            images: [{ url: "/images/kaaba.jpg" }]
          }
        ]
      }
    };
    
    const sampleData = sampleFileMap[type];
    if (type === 'featured-packages') {
      sampleData.data = sampleData.data.filter(pkg => pkg.is_featured);
    }
    
    // Add debug info to sample data
    const sampleDataWithDebug = {
      ...sampleData,
      _debug: {
        source: 'sample-data',
        timestamp: new Date().toISOString(),
        errors: errors,
        note: 'Using fallback sample data after all API attempts failed'
      }
    };
    
    console.log(`Using hardcoded sample data for ${type}`);
    return NextResponse.json(sampleDataWithDebug);
  } catch (error) {
    console.error('Error using sample data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from all sources',
        debug: {
          timestamp: new Date().toISOString(),
          errors: errors
        }
      },
      { status: 500 }
    );
  }
} 