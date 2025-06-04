'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { ChatContainer } from '../components/chat/ChatContainer';

export default function BusChatPage() {
  // TODO: Get actual user ID and type from authentication
  const mockUserId = '123';
  const mockUserType = 'bus_operator';

  return (
    <Provider store={store}>
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="h-screen">
          <ChatContainer 
            userId={mockUserId} 
            userType={mockUserType as 'bus_operator' | 'office' | 'pilgrim'} 
          />
        </div>
      </div>
    </Provider>
  );
} 