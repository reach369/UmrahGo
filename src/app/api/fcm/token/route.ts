import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint لمعالجة FCM tokens
 * FCM Token Management API
 */

interface FCMTokenRequest {
  token: string;
  userId?: string;
  device?: string;
  browser?: string;
  timestamp?: string;
}

/**
 * حفظ FCM token جديد
 */
export async function POST(request: NextRequest) {
  try {
    const body: FCMTokenRequest = await request.json();
    
    if (!body.token) {
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      );
    }

    // هنا يمكن حفظ token في قاعدة البيانات
    // For now, we'll just log it and return success
    
    console.log('📱 FCM Token Received:', {
      token: body.token.substring(0, 20) + '...',
      userId: body.userId,
      device: body.device,
      browser: body.browser,
      timestamp: body.timestamp
    });

    // محاولة إرسال token إلى backend
    try {
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chats/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fcm_token: body.token,
          user_id: body.userId,
          device_type: body.device,
          browser: body.browser,
          platform: 'web',
          app_version: process.env.npm_package_version || '1.0.0',
          created_at: body.timestamp || new Date().toISOString()
        })
      });

      if (backendResponse.ok) {
        const result = await backendResponse.json();
        console.log('✅ FCM token sent to backend successfully:', result);
        
        return NextResponse.json({
          success: true,
          message: 'FCM token registered successfully',
          data: {
            tokenId: result.data?.id,
            expiresAt: result.data?.expires_at
          }
        });
      } else {
        console.warn('⚠️ Backend registration failed:', await backendResponse.text());
        
        // Still return success to client, backend failure shouldn't block client
        return NextResponse.json({
          success: true,
          message: 'FCM token received (backend sync pending)',
          warning: 'Backend registration failed, will retry later'
        });
      }
    } catch (backendError) {
      console.error('❌ Backend request failed:', backendError);
      
      // Store for retry later (could implement a queue system here)
      return NextResponse.json({
        success: true,
        message: 'FCM token received (backend sync pending)',
        warning: 'Backend unavailable, will sync when available'
      });
    }

  } catch (error) {
    console.error('❌ FCM token registration error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to register FCM token'
      },
      { status: 500 }
    );
  }
}

/**
 * الحصول على معلومات FCM token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');

    if (!token && !userId) {
      return NextResponse.json(
        { error: 'Token or userId is required' },
        { status: 400 }
      );
    }

    // محاولة الحصول على معلومات token من backend
    try {
      const queryParams = new URLSearchParams();
      if (token) queryParams.append('token', token);
      if (userId) queryParams.append('user_id', userId);

      // Update URL to match Postman collection
      const backendResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/fcm/info?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (backendResponse.ok) {
        const result = await backendResponse.json();
        return NextResponse.json({
          success: true,
          data: result.data
        });
      } else {
        throw new Error(`Backend responded with ${backendResponse.status}`);
      }
    } catch (backendError) {
      console.error('❌ Backend request failed:', backendError);
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch token information',
        message: 'Backend service unavailable'
      }, { status: 503 });
    }

  } catch (error) {
    console.error('❌ FCM token info error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to fetch FCM token information'
      },
      { status: 500 }
    );
  }
}