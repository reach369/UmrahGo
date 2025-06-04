'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { TransportChatContainer } from '../components/chat/ChatContainer';
import { AlertCircle } from 'lucide-react';

export default function TransportOperatorsChatPage() {
  // Using the mock user ID from our mock data
  const mockUserId = '1'; // This matches the transport operator ID in our mock data
  const mockUserType = 'transport_operator';

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {/* API Status Banner */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4 flex items-center gap-3">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <div>
            <h3 className="font-bold text-red-800">حالة الاتصال بـ API</h3>
            <p className="text-red-700">
              ❌ هذه الصفحة تستخدم بيانات افتراضية وليست متصلة بـ API حقيقي
            </p>
          </div>
        </div>
        
        <div className="h-screen">
          <TransportChatContainer 
            userId={mockUserId} 
            userType={mockUserType as 'transport_operator' | 'office' | 'pilgrim'} 
          />
        </div>
      </div>
    </Provider>
  );
} 