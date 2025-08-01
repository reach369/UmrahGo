'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2, MessageSquare } from 'lucide-react';

// Import ChatPage component with SSR disabled
const SimpleChatDynamic = dynamic(
  () => import('./page-simple'),
  { 
    loading: () => (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4 p-6 rounded-lg bg-card shadow-md">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-b-2 border-primary mb-4"></div>
            <p className="text-lg font-medium text-foreground">Loading Chat System</p>
            <p className="text-sm text-muted-foreground mt-2">Connecting to real-time messaging service...</p>
          </div>
        </div>
      </div>
    ),
    ssr: false // Important: disable SSR for this component
  }
);

export default function ChatPage() {
  return <SimpleChatDynamic />;
} 