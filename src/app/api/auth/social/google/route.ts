import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * Proxy endpoint for Google social login
 * This endpoint forwards the Firebase ID token to our backend API
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { id_token } = data;
    
    if (!id_token) {
      return NextResponse.json(
        { success: false, message: 'ID token is required' },
        { status: 400 }
      );
    }
    
    // Forward the request to our backend API
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://admin.umrahgo.net/api/v1';
    const response = await axios.post(`${baseUrl}/auth/social/google`, {
      id_token
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': 'ar' // Default to Arabic, can be overridden
      },
      timeout: 10000 // 10 second timeout
    });
    
    // Return the response from the API
    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Google social login error:', error.message);
    
    // Format the error response
    let statusCode = 500;
    let errorMessage = 'Failed to authenticate with Google';
    
    if (error.response) {
      statusCode = error.response.status;
      console.error('Error response body:', error.response.data);
      
      // Try to extract a meaningful error message
      if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (typeof error.response.data === 'string') {
        errorMessage = error.response.data;
      }
    } else if (error.code === 'ECONNABORTED') {
      statusCode = 504; // Gateway Timeout
      errorMessage = 'Connection timed out. Please try again.';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: error.message,
        details: error.response?.data || 'No additional details available'
      },
      { status: statusCode }
    );
  }
} 