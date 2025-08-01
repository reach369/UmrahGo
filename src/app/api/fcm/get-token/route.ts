import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint للحصول على FCM token
 * Get FCM Token API
 */

interface GetTokenRequest {
  vapidKey?: string;
}

/**
 * الحصول على FCM token جديد
 */
export async function POST(request: NextRequest) {
  try {
    const body: GetTokenRequest = await request.json();
    
    // التحقق من وجود VAPID key
    const vapidKey = body.vapidKey || process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    
    if (!vapidKey) {
      return NextResponse.json(
        { error: 'VAPID key is required' },
        { status: 400 }
      );
    }

    // هنا يتم محاولة الحصول على token من Firebase
    // لكن بما أن Firebase SDK قد لا يكون متاح في Server Side،
    // سنعيد token وهمي أو نرجع للـ client ليقوم بذلك

    // إنشاء token وهمي للاختبار
    const mockToken = `fake_fcm_token_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    
    console.log('🔑 Generated mock FCM token:', mockToken.substring(0, 20) + '...');

    return NextResponse.json({
      success: true,
      token: mockToken,
      message: 'FCM token generated successfully',
      data: {
        vapidKey: vapidKey.substring(0, 10) + '...',
        timestamp: new Date().toISOString(),
        expiresIn: 7 * 24 * 60 * 60 * 1000 // 7 days
      }
    });

  } catch (error) {
    console.error('❌ FCM token generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to generate FCM token'
      },
      { status: 500 }
    );
  }
}

/**
 * التحقق من حالة FCM token
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token parameter is required' },
        { status: 400 }
      );
    }

    // التحقق من صحة token (mock validation)
    const isValid = token.startsWith('fake_fcm_token_') || token.length > 50;
    
    return NextResponse.json({
      success: true,
      data: {
        token: token.substring(0, 20) + '...',
        isValid,
        createdAt: new Date().toISOString(),
        status: isValid ? 'active' : 'invalid'
      }
    });

  } catch (error) {
    console.error('❌ FCM token validation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to validate FCM token'
      },
      { status: 500 }
    );
  }
} 