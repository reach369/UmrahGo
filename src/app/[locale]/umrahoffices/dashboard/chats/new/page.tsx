'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Loader2, Search, Users, UserRound, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Services
import chatService from '@/services/chat.service';
import { getAuthToken } from '@/lib/auth.service';

interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_path?: string;
}

export default function NewChatPage() {
  const t = useTranslations('chat');
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale as string;
  const { state: authState } = useAuth();
  const user = authState.user;
  const userType = authState.user?.roles[0] || 'pilgrim';
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isGroup, setIsGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load contacts/users that can be messaged
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 3) {
        setSearchResults([]);
        return;
      }

      const token = getAuthToken();
      if (!token) return;

      setIsLoading(true);
      try {
        // Mock API call since we don't have the exact endpoint
        // In a real application, you would call your API to search users
        setTimeout(() => {
          // Mock data for demonstration
          setSearchResults([
            { id: 1, name: 'John Doe', email: 'john@example.com' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
            { id: 3, name: 'Ahmed Mohamed', email: 'ahmed@example.com' },
            { id: 4, name: 'Fatima Ali', email: 'fatima@example.com' }
          ].filter(u => 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
          ));
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error searching users:', error);
        toast.error(t('error_searching_users'));
        setIsLoading(false);
      }
    };

    searchUsers();
  }, [searchQuery, t]);

  const handleUserSelect = (user: User) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleUserRemove = (userId: number) => {
    setSelectedUsers(selectedUsers.filter(u => u.id !== userId));
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) {
      toast.error(t('select_at_least_one_user'));
      return;
    }

    if (isGroup && !groupTitle.trim()) {
      toast.error(t('group_title_required'));
      return;
    }

    const token = getAuthToken();
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }

    setIsCreating(true);
    try {
      if (isGroup) {
        // Create group chat
            const response = await chatService.createChat(
              token,
              selectedUsers[0].id,
              groupTitle,
              true,
              userType
            );

        if (response.success && response.data) {
          router.push(`/${locale}/umrahoffices/dashboard/chats/${response.data.id}`);
        } else {
          toast.error(t('error_creating_chat'));
        }
      } else {
        // Create direct chat with first selected user
        const response = await chatService.createChat(
          token,
          selectedUsers[0].id,
          '',
          false,
          userType
        );

        if (response.success && response.data) {
          router.push(`/${locale}/umrahoffices/dashboard/chats/${response.data.id}`);
        } else {
          toast.error(t('error_creating_chat'));
        }
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error(t('error_creating_chat'));
    } finally {
      setIsCreating(false);
    }
  };

  const goBack = () => {
    router.push(`/${locale}/umrahoffices/dashboard/chats`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .slice(0, 2)
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="mb-6 flex items-center">
        <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('new_chat')}</h1>
      </div>

      <div className=" dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6">
          {/* Chat type selection */}
          <div className="mb-8">
            <Label className="text-base font-semibold mb-4 block text-gray-900 dark:text-gray-100">{t('chat_type')}</Label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`flex flex-col items-center p-4 rounded-lg cursor-pointer border-2 transition-colors ${isGroup ? 'border-gray-200 dark:border-gray-700' : 'border-primary bg-primary/5'}`}
                onClick={() => setIsGroup(false)}
              >
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-3">
                  <UserRound className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-medium text-center">{t('direct_chat')}</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">{t('one_to_one')}</p>
              </div>
              <div 
                className={`flex flex-col items-center p-4 rounded-lg cursor-pointer border-2 transition-colors ${isGroup ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700'}`}
                onClick={() => setIsGroup(true)}
              >
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center mb-3">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-medium text-center">{t('group_chat')}</h3>
                <p className="text-xs text-muted-foreground text-center mt-1">{t('multiple_participants')}</p>
              </div>
            </div>
          </div>

          {/* Group title input (shown only for group chats) */}
          {isGroup && (
            <div className="mb-6">
              <Label htmlFor="group-title" className="text-base font-medium mb-2 block text-gray-900 dark:text-gray-100">
                {t('group_title')}
              </Label>
              <Input
                id="group-title"
                placeholder={t('enter_group_title')}
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              />
            </div>
          )}

          {/* Search users */}
          <div className="mb-8">
            <Label htmlFor="search-users" className="text-base font-medium mb-3 block text-gray-900 dark:text-gray-100">
              {isGroup ? t('add_participants') : t('select_recipient')}
            </Label>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search-users"
                placeholder={t('search_users')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              />
            </div>
            
            {/* Search results */}
            {isLoading ? (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <Skeleton className="h-12 w-full" />
                </div>
                <div className="p-3">
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                {searchResults.map((result) => (
                  <div
                    key={result.id}
                    onClick={() => handleUserSelect(result)}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-700 last:border-0"
                  >
                    <Avatar className="h-10 w-10 border border-gray-200 dark:border-gray-700">
                      <AvatarImage src={result.profile_photo_path} />
                      <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {getInitials(result.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{result.name}</p>
                      <p className="text-sm text-muted-foreground">{result.email}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="rounded-full">
                      <UserPlus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : searchQuery.length >= 3 ? (
              <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-800 mx-auto flex items-center justify-center mb-3">
                  <UserRound className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="font-medium mb-1">{t('no_users_found')}</p>
                <p className="text-sm text-muted-foreground">{t('try_different_search')}</p>
              </div>
            ) : searchQuery.length > 0 ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-900/30">
                <p className="text-sm text-amber-800 dark:text-amber-300">{t('type_at_least_3_chars')}</p>
              </div>
            ) : null}
          </div>

          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="mb-8">
              <Label className="text-base font-medium mb-3 block text-gray-900 dark:text-gray-100">
                {isGroup ? t('participants') : t('recipient')} <span className="text-sm text-muted-foreground">({selectedUsers.length})</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map((selectedUser) => (
                  <Badge 
                    key={selectedUser.id} 
                    variant="outline"
                    className="py-1.5 px-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 flex items-center gap-2"
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={selectedUser.profile_photo_path} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{selectedUser.name}</span>
                    <button
                      onClick={() => handleUserRemove(selectedUser.id)}
                      className="text-muted-foreground hover:text-foreground ml-1"
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Create button */}
          <Button 
            onClick={handleCreateChat}
            disabled={
              isCreating || 
              selectedUsers.length === 0 || 
              (isGroup && !groupTitle.trim())
            }
            className="w-full"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('creating')}
              </>
            ) : (
              t('create_chat')
            )}
          </Button>
        </div>
      </div>
    </div>
  );
} 