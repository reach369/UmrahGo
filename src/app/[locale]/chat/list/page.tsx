'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

// Components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, Loader2, MessageCircle, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Services and hooks
import { useAuth } from '@/contexts/AuthContext';
import chatService, { Chat } from '@/services/chat.service';
import { getAuthToken } from '@/lib/auth.service';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export default async function ChatListPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('chat');
  const router = useRouter();
  const { state: authState } = useAuth();
  const user = authState.user;
  const userType = authState.user?.roles[0] || 'pilgrim';
  const locale = (await params).locale;
  const dateLocale = locale === 'ar' ? ar : enUS;

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Load chats
  useEffect(() => {
    async function loadChats() {
      if (typeof window === 'undefined' || !user) return;
      
      const token = getAuthToken();
      if (!token) {
        router.push(`/login`);
        return;
      }
      
      setIsLoading(true);
      try {
        const response = await chatService.getChats(token, userType);
        if (response.success && response.data) {
          setChats(response.data);
        } else {
          toast.error(t('error_loading_chats'));
        }
      } catch (error) {
        console.error('Error loading chats:', error);
        toast.error(t('error_loading_chats'));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadChats();
  }, [user, userType, router, t]);

  // Filter chats based on search and tab
  const filteredChats = chats.filter(chat => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.last_message?.message?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tab filter
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'unread') return matchesSearch && (chat.unread_count || 0) > 0;
    if (activeTab === 'groups') return matchesSearch && chat.is_group;
    if (activeTab === 'direct') return matchesSearch && !chat.is_group;
    
    return matchesSearch;
  });

  // Navigate to chat   
  const goToChat = (chatId: number) => {
    router.push(`/chat?id=${chatId}&userType=${userType}`);
  };

  // Render loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex items-center p-4 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold ml-4">{t('chats')}</h1>
      </div>
      
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            placeholder={t('search_chats')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">{t('all')}</TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">{t('unread')}</TabsTrigger>
            <TabsTrigger value="groups" className="flex-1">{t('groups')}</TabsTrigger>
          </TabsList>
        </div>
        
        <ScrollArea className="flex-1">
          <TabsContent value={activeTab} className="m-0 p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">{t('no_chats_found')}</h3>
                <p className="text-sm text-muted-foreground">
                  {activeTab === 'unread' 
                    ? t('no_unread_messages') 
                    : activeTab === 'groups' 
                      ? t('no_group_chats') 
                      : t('no_chats_start_conversation')}
                </p>
              </div>
            ) : (
              <div className="px-2 pt-2 pb-20">
                {filteredChats.map((chat) => (
                  <div 
                    key={chat.id}
                    onClick={() => goToChat(chat.id)}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent transition-colors"
                  >
                    {chat.is_group ? (
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          <Users className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={chat.recipient?.profile_photo_path} />
                        <AvatarFallback>
                          {(chat.recipient?.name || chat.title || '?')[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium truncate">
                          {chat.title || chat.recipient?.name || t('unnamed_chat')}
                        </h3>
                        {chat.last_message && (
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(chat.last_message.created_at), {
                              addSuffix: false,
                              locale: dateLocale
                            })}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.last_message ? (
                            <>
                              {chat.is_group && chat.last_message.sender_id !== user.id && (
                                <span className="font-medium">
                                  {chat.last_message.sender?.name?.split(' ')[0]}: 
                                </span>
                              )}{' '}
                              {chat.last_message.message}
                            </>
                          ) : (
                            <span className="italic">{t('no_messages')}</span>
                          )}
                        </p>
                        
                        {(chat.unread_count || 0) > 0 && (
                          <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
} 