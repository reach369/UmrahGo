'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, Users, UserRound, Loader2, Plus, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useAuth } from '@/contexts/AuthContext';
import chatService, { Chat } from '@/services/chat.service';

// Types
type NewChatDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onChatCreated: (chat: Chat) => void;
};

type User = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  profile_photo?: string;
  role?: string;
};

/**
 * NewChatDialog component for starting new conversations
 * with individual users or creating group chats
 */
export function NewChatDialog({ isOpen, onOpenChange, onChatCreated }: NewChatDialogProps) {
  const t = useTranslations('chat');
  const { state: authState } = useAuth();
  
  // State variables
  const [tab, setTab] = useState<'users' | 'groups'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [chatType, setChatType] = useState<'individual' | 'group'>('individual');
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Load users on dialog open
  useEffect(() => {
    if (isOpen) {
      loadUsers();
    } else {
      // Reset state when dialog closes
      setSearchQuery('');
      setSelectedUsers([]);
      setChatType('individual');
      setGroupName('');
      setError(null);
    }
  }, [isOpen]);
  
  // Load users when search query changes
  useEffect(() => {
    if (isOpen) {
      const delayDebounceFn = setTimeout(() => {
        loadUsers();
      }, 300);
      
      return () => clearTimeout(delayDebounceFn);
    }
  }, [searchQuery, isOpen]);
  
  // Load users from API
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) return;

      const response = await chatService.getChatParticipants(token, searchQuery);

      // Filter out current user
      const filteredUsers = response.data.filter((user: User) => 
        user.id !== authState.user?.id
      );
      
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Failed to load users. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get auth token
  const getToken = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return null;
      }
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      setError('Authentication error. Please login again.');
      return null;
    }
  };

  // Toggle user selection
  const toggleUserSelection = (user: User) => {
    if (chatType === 'individual') {
      setSelectedUsers([user]);
    } else {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u.id === user.id);
        return isSelected 
          ? prev.filter(u => u.id !== user.id)
          : [...prev, user];
      });
    }
  };
  
  // Check if a user is selected
  const isUserSelected = (user: User) => {
    return selectedUsers.some(u => u.id === user.id);
  };
  
  // Remove user from selection
  const removeUser = (user: User) => {
    setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
  };
  
  // Create new chat
  const createChat = async () => {
    try {
    if (selectedUsers.length === 0) {
        setError('Please select at least one user');
      return;
    }

      if (chatType === 'group' && !groupName.trim()) {
        setError('Please enter a group name');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      const token = await getToken();
      if (!token) return;
      
      const userIds = selectedUsers.map(user => user.id);
      
      let chat: Chat;
      
      if (chatType === 'individual') {
        // Create individual chat
        chat = await chatService.createChat(userIds[0], token, 'office', false) as unknown as Chat;
      } else {
        // Create group chat
        chat = await chatService.createChat(userIds[0], token, 'office', true, groupName) as unknown as Chat;
      }
      
      onChatCreated(chat);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Failed to create chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filtered users based on search and already selected users (for group chat)
  const filteredUsers = users.filter(user => {
    // For individual chat, show all users
    // For group chat, don't show already selected users
    return chatType === 'individual' || !isUserSelected(user);
  });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('newChat')}</DialogTitle>
          <DialogDescription>
            {chatType === 'individual' 
              ? t('selectChatDescription') 
              : t('newChatDescription', { default: 'Select users to add to the group' })}
          </DialogDescription>
        </DialogHeader>

          {/* Chat Type Selection */}
            <RadioGroup
          defaultValue="individual" 
          className="flex flex-row space-y-0 gap-4"
              value={chatType}
          onValueChange={(value) => setChatType(value as 'individual' | 'group')}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="individual" id="r1" />
            <Label htmlFor="r1" className="flex items-center gap-1">
              <UserRound className="h-4 w-4" />
              {t('privateChat', { default: 'Private Chat' })}
                </Label>
              </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="group" id="r2" />
            <Label htmlFor="r2" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
              {t('groupChat', { default: 'Group Chat' })}
                </Label>
              </div>
            </RadioGroup>

        {/* Group Name Input (for group chat) */}
          {chatType === 'group' && (
            <div className="space-y-2">
            <Label htmlFor="group-name">{t('groupTitle', { default: 'Group Name' })}</Label>
              <Input
              id="group-name"
              placeholder={t('groupTitle', { default: 'Enter group name' })}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full"
              />
            </div>
          )}

        {/* Selected Users Display */}
        {selectedUsers.length > 0 && (
          <div className="space-y-2">
            <Label>{t('selectedUsers', { default: 'Selected Users' })}</Label>
              <div className="flex flex-wrap gap-2">
              {selectedUsers.map(user => (
                <Badge key={user.id} variant="secondary" className="flex items-center gap-1 py-1 pl-1">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={user.avatar || user.profile_photo} alt={user.name} />
                    <AvatarFallback className="text-[10px]">
                      {user.name?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{user.name}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-4 w-4 p-0 ml-1 rounded-full hover:bg-muted"
                    onClick={() => removeUser(user)}
                    >
                      <X className="h-3 w-3" />
                  </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {/* Search and User List */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('searchUsers', { default: 'Search users...' })}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
                </div>
          
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
          
          <ScrollArea className="h-64 border rounded-md">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full p-4">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground mt-2">
                  {t('loading', { default: 'Loading users...' })}
                </p>
                </div>
            ) : filteredUsers.length > 0 ? (
              <div className="p-1">
                {filteredUsers.map(user => (
                    <div
                      key={user.id}
                    className={`
                      flex items-center p-2 rounded-md cursor-pointer
                      ${isUserSelected(user) ? 'bg-primary/10' : 'hover:bg-muted'}
                    `}
                      onClick={() => toggleUserSelection(user)}
                    >
                    <div className="flex items-center flex-1 gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar || user.profile_photo} />
                        <AvatarFallback>
                          {user.name?.substring(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </div>
                    
                    {chatType === 'group' ? (
                      <Checkbox
                        checked={isUserSelected(user)}
                        onCheckedChange={() => toggleUserSelection(user)}
                        className="h-4 w-4"
                        aria-label={`Select ${user.name}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <Button 
                        variant={isUserSelected(user) ? "default" : "outline"} 
                        size="sm"
                        className="ml-2"
                      >
                        {isUserSelected(user) ? (
                          <span>{t('selected', { default: 'Selected' })}</span>
                        ) : (
                          <span>{t('select', { default: 'Select' })}</span>
                        )}
                      </Button>
                    )}
                    </div>
                  ))}
                </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Users className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">
                  {searchQuery ? 
                    t('noSearchResults', { default: 'No users found matching your search' }) : 
                    t('noUsersFound', { default: 'No users available' })}
                </p>
              </div>
              )}
            </ScrollArea>
          </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel', { default: 'Cancel' })}
            </Button>
            <Button
            onClick={createChat} 
            disabled={isLoading || selectedUsers.length === 0}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {chatType === 'group' ? 
              t('createGroup', { default: 'Create Group' }) : 
              t('startChat', { default: 'Start Chat' })}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 