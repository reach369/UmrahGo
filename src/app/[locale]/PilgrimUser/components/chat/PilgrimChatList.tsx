'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Search, Plus, Pin, Check, CheckCheck, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getConversations } from '../../services/chatService';

interface PilgrimChatListProps {
  onSelectChat: (chatId: string, recipientName: string, recipientAvatar?: string) => void;
  selectedChatId?: string;
  className?: string;
}

interface ChatItem {
  id: string;
  title: string;
  type: 'private' | 'group' | 'support';
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
  last_message?: {
    content: string;
    sent_at: string;
    status: string;
    sender_id: string;
  };
  unread_count: number;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export function PilgrimChatList({ 
  onSelectChat, 
  selectedChatId,
  className = '' 
}: PilgrimChatListProps) {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const t = useTranslations();

  // Get token from localStorage or session
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || 
             localStorage.getItem('nextauth_token') ||
             session?.accessToken;
    }
    return null;
  };

  // Load chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoading(true);
        const token = getToken();
        
        if (!token) {
          toast.error(t('pilgrim.chat.auth_error'));
          return;
        }

        const response = await getConversations(token);
        if (response && response.success && response.data) {
          setChats(response.data);
          setFilteredChats(response.data);
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
        toast.error(t('pilgrim.chat.load_error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [t]);

  // Filter chats when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredChats(chats);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = chats.filter(chat => {
      // Search in title
      if (chat.title?.toLowerCase().includes(query)) return true;

      // Search in participants
      if (chat.participants.some(p => p.name?.toLowerCase().includes(query))) return true;
      
      // Search in last message content
      if (chat.last_message?.content?.toLowerCase().includes(query)) return true;

      return false;
    });

    setFilteredChats(filtered);
  }, [searchQuery, chats]);

  // Format message time
  const formatMessageTime = (dateString?: string) => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      
      // If less than 24 hours, show time
      if (diff < 24 * 60 * 60 * 1000) {
        return format(date, 'p', { locale: ar });
      }
      
      // If less than a week, show day name
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        return format(date, 'EEEE', { locale: ar });
      }
      
      // Otherwise show date
      return format(date, 'PP', { locale: ar });
    } catch (e) {
      return '';
    }
  };

  // Get message status icon
  const getMessageStatusIcon = (status: string, isSelf: boolean) => {
    if (!isSelf) return null;
    
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-blue-400" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-green-400" />;
      default:
        return null;
    }
  };

  // Get chat title and avatar
  const getChatDetails = (chat: ChatItem) => {
    if (chat.type === 'private' && chat.participants.length > 0) {
      // For private chats, show other participant's info
      const otherParticipant = chat.participants[0];
      return {
        title: otherParticipant.name,
        avatar: otherParticipant.avatar,
        initials: otherParticipant.name.charAt(0).toUpperCase(),
      };
    }
    
    // For groups or other chat types
    return {
      title: chat.title,
      avatar: undefined,
      initials: chat.title.charAt(0).toUpperCase(),
    };
  };

  // Determine if the last message is from the current user
  const isLastMessageFromSelf = (chat: ChatItem) => {
    if (!chat.last_message || !session?.user?.id) return false;
    return chat.last_message.sender_id === session.user.id;
  };

  // Sort chats: pinned first, then by updated_at
  const sortedChats = [...filteredChats].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    
    const dateA = new Date(a.updated_at).getTime();
    const dateB = new Date(b.updated_at).getTime();
    return dateB - dateA; // Most recent first
  });

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4 border-b border-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium text-lg">{t('pilgrim.chat.conversations')}</h2>
          <Button variant="ghost" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            {t('pilgrim.chat.new')}
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('pilgrim.chat.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))
          ) : filteredChats.length === 0 ? (
            // No chats found
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery 
                ? t('pilgrim.chat.no_results') 
                : t('pilgrim.chat.no_conversations')}
            </div>
          ) : (
            // Chat list
            sortedChats.map((chat) => {
              const { title, avatar, initials } = getChatDetails(chat);
              const isLastMessageSelf = isLastMessageFromSelf(chat);
              const isSelected = chat.id === selectedChatId;
              
              return (
                <div
                  key={chat.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected 
                      ? 'bg-muted' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => onSelectChat(chat.id, title, avatar)}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={avatar} alt={title} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <h3 className="font-medium truncate">{title}</h3>
                        {chat.is_pinned && (
                          <Pin className="h-3 w-3 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatMessageTime(chat.last_message?.sent_at || chat.updated_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      {chat.last_message ? (
                        <p className="text-sm text-muted-foreground truncate flex-1">
                          {isLastMessageSelf && (
                            <span className="text-xs mr-1">{t('pilgrim.chat.you')}: </span>
                          )}
                          {chat.last_message.content}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          {t('pilgrim.chat.start_conversation')}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 ml-2">
                        {getMessageStatusIcon(chat.last_message?.status || '', isLastMessageSelf)}
                        
                        {chat.unread_count > 0 && (
                          <Badge variant="destructive" className="h-5 min-w-5 flex items-center justify-center rounded-full px-1">
                            {chat.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 