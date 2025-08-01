'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl'; 
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { ChatErrorBoundary } from '@/components/chat/ChatErrorBoundary';
import { UnifiedChatContainer } from '@/components/chat/UnifiedChatContainer';

// Import components
import { ChatList } from '@/components/chat/ChatList';
import { NewChatDialog } from '@/components/chat/NewChatDialog';

// Import hooks and services
import { useAuth } from '@/contexts/AuthContext';
import { realtimeService } from '@/services/realtime.service';
import chatService, { Chat } from '@/services/chat.service';

/**
 * Simple Chat Page Component
 * A client-side only implementation of the chat page
 */
export default function SimpleChatPage() {
  // Initialize translations
  const t = useTranslations('chat');
  
  // Get user and auth info
  const { state: authState } = useAuth();
  const user = authState?.user;
  const isAuthenticated = !!user && !authState.isLoading;

  // Get router and params
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = typeof params?.locale === 'string' ? params.locale : 'en';

  // Get chat ID from URL
  const chatIdFromUrl = searchParams?.get('id');

  // Component state
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(chatIdFromUrl || null);
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive user type from user info
  const userType = useMemo(() => {
    if (!user || !user.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      return 'pilgrim' as const; // Default role
    }
    // Ensure userType is one of the allowed values
    const role = user.roles[0];
    return (role === 'admin' || role === 'office' || role === 'bus_operator' || role === 'pilgrim') 
      ? role 
      : 'pilgrim' as const;
  }, [user]);

  // Handle mobile view
  useEffect(() => {
    const checkMobileView = () => {
      if (typeof window === 'undefined') return;
      
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      setShowChatList(isMobile ? !selectedChatId : true);
    };

    if (typeof window !== 'undefined') {
      checkMobileView();
      window.addEventListener('resize', checkMobileView);
      return () => window.removeEventListener('resize', checkMobileView);
    }
  }, [selectedChatId]);

  // Load chats on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadChats();
    } else if (!authState.isLoading) {
      // Not authenticated and not loading
      router.push(`/${locale}/auth/login`);
    }
  }, [isAuthenticated, authState.isLoading, locale, router]);

  // Update chat ID from URL parameters
  useEffect(() => {
    if (chatIdFromUrl && chatIdFromUrl !== selectedChatId) {
      setSelectedChatId(chatIdFromUrl);
      setShowChatList(!isMobileView);
    }
  }, [chatIdFromUrl, isMobileView, selectedChatId]);

  // Load chats from API
  const loadChats = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get token from local storage
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError(t('auth_error', { default: 'Authentication error' }));
        router.push(`/${locale}/auth/login`);
        return;
      }

      // Load chats
      const response = await chatService.getChats(token, userType);
      if (response.success && Array.isArray(response.data)) {
        setChats(response.data);
      } else {
        setError(response.message || t('load_error', { default: 'Error loading chats' }));
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setError(t('load_error', { default: 'Error loading chats' }));
      toast.error(t('chat_load_error', { default: 'Error loading chats' }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    setShowChatList(!isMobileView);
    
    // Update URL without navigation
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('id', chatId);
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Handle new chat creation
  const handleChatCreated = (chat: Chat) => {
    setChats(prev => [chat, ...prev]);
    setSelectedChatId(chat.id.toString());
    setIsNewChatOpen(false);
    setShowChatList(!isMobileView);
    
    // Update URL without navigation
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('id', chat.id.toString());
      window.history.replaceState({}, '', url.toString());
    }

    toast.success(t('chat_created', { default: 'Chat created successfully' }));
  };

  // Get selected chat info
  const getSelectedChatInfo = () => {
    if (!selectedChatId) return { name: '', avatar: '' };
    
    const selectedChat = chats.find(chat => chat.id.toString() === selectedChatId);
    if (!selectedChat) return { name: t('conversation'), avatar: '' };
    
    try {
      // Group chat
      if (selectedChat.is_group) {
        return {
          name: selectedChat.title || t('group_chat'),
          avatar: ''
        };
      }
      
      // Individual chat - find the other participant
      const otherParticipant = selectedChat.participants?.find(participant => 
        participant.user_id?.toString() !== user?.id?.toString()
      );
      
      if (otherParticipant) {
        return {
          name: otherParticipant.name || selectedChat.title || t('conversation'),
          avatar: otherParticipant.profile_photo_path || ''
        };
      }
      
      return {
        name: selectedChat.title || t('conversation'),
        avatar: ''
      };
    } catch (error) {
      console.error('Error getting chat info:', error);
      return { name: t('conversation'), avatar: '' };
    }
  };

  // Not authenticated, show loading or redirect
  if (!isAuthenticated) {
    if (authState.isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-2 border-primary"></div>
            <p className="mt-4">{t('loading')}</p>
          </div>
        </div>
      );
    }
    return null; // Will redirect in useEffect
  }

  // Get selected chat info
  const selectedChatInfo = getSelectedChatInfo();

  return (
    <ChatErrorBoundary>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Chat List Sidebar */}
        <div className={`
          flex flex-col border-r border-border transition-all duration-300 bg-card/50 backdrop-blur-sm
          ${isMobileView && !showChatList ? "w-0 overflow-hidden" : "w-full md:w-80"}
        `}>
          <ChatList
            chats={chats}
            activeChatId={selectedChatId}
            onSelectChat={handleChatSelect}
            onCreateNewChat={() => setIsNewChatOpen(true)}
            isLoading={isLoading}
            className="h-full"
            showError={!!error}
            errorMessage={error || ''}
            onRetry={loadChats}
          />
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col min-w-0 bg-background">
          {selectedChatId ? (
            <UnifiedChatContainer
              chatId={selectedChatId}
              recipientName={selectedChatInfo.name}
              recipientAvatar={selectedChatInfo.avatar}
              userType={userType}
              onBack={isMobileView ? () => setShowChatList(true) : undefined}
              className="h-full"
              showCallButtons={false}
              showAttachments={true}
              showTypingIndicators={true}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center max-w-md p-8 rounded-lg bg-card/50 shadow-sm border border-border">
                <div className="mb-4 p-4 rounded-full bg-primary/10 mx-auto w-16 h-16 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t('selectChat')}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  {t('selectChatDescription')}
                </p>
                <button 
                  onClick={() => setIsNewChatOpen(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md flex items-center gap-2 mx-auto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  {t('newChat')}
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* New Chat Dialog */}
        <NewChatDialog
          isOpen={isNewChatOpen}
          onOpenChange={setIsNewChatOpen}
          onChatCreated={handleChatCreated}
        />
      </div>
    </ChatErrorBoundary>
  );
} 