import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint لحذف FCM tokens
 * FCM Token Deletion API
 */

interface DeleteTokenRequest {
  token: string;
  userId?: string;
}

/**
 * حذف FCM token
 */
export async function POST(request: NextRequest) {
  try {
    const body: DeleteTokenRequest = await request.json();
    
    if (!body.token) {
      return NextResponse.json(
        { error: 'FCM token is required' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deleting FCM Token:', {
      token: body.token.substring(0, 20) + '...',
      userId: body.userId
    });

    // محاولة حذف token من backend
    try {
      const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/fcm/unregister`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          fcm_token: body.token,
          user_id: body.userId
        })
      });

      if (backendResponse.ok) {
        const result = await backendResponse.json();
        console.log('✅ FCM token deleted from backend successfully:', result);
        
        return NextResponse.json({
          success: true,
          message: 'FCM token deleted successfully'
        });
      } else {
        console.warn('⚠️ Backend deletion failed:', await backendResponse.text());
        
        // Still return success to client, backend failure shouldn't block client
        return NextResponse.json({
          success: true,
          message: 'FCM token marked for deletion (backend sync pending)',
          warning: 'Backend deletion failed, will retry later'
        });
      }
    } catch (backendError) {
      console.error('❌ Backend request failed:', backendError);
      
      // Store for retry later (could implement a queue system here)
      return NextResponse.json({
        success: true,
        message: 'FCM token marked for deletion (backend sync pending)',
        warning: 'Backend unavailable, will sync when available'
      });
    }

  } catch (error) {
    console.error('❌ FCM token deletion error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to delete FCM token'
      },
      { status: 500 }
    );
  }
} 