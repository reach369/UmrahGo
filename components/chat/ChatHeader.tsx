'use client';

import { useTranslations } from 'next-intl';
import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHeaderProps {
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  typingUsers?: string[];
  onBack?: () => void;
  onAudioCall?: () => void;
  onVideoCall?: () => void;
  onViewProfile?: () => void;
  onClearHistory?: () => void;
  onMuteNotifications?: () => void;
  onBlockUser?: () => void;
  onReportUser?: () => void;
  userCount?: number;
  showCallButtons?: boolean;
  className?: string;
}

/**
 * Universal Chat Header Component
 * 
 * This component provides a header for chat conversations that can be used
 * across all user types (Pilgrims, Offices, Bus Operators, etc.)
 */
export function ChatHeader({
  name,
  avatar,
  status = 'offline',
  typingUsers = [],
  onBack,
  onAudioCall,
  onVideoCall,
  onViewProfile,
  onClearHistory,
  onMuteNotifications,
  onBlockUser,
  onReportUser,
  userCount,
  showCallButtons = true,
  className = ''
}: ChatHeaderProps) {
  const t = useTranslations();
  
  const statusColor = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  };
  
  const isTyping = typingUsers && typingUsers.length > 0;
  
  return (
    <div className={`flex items-center justify-between p-3 border-b border-border ${className}`}>
      <div className="flex items-center space-x-3">
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={onBack}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback>
              {name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span 
            className={`absolute bottom-0 right-0 rounded-full w-3 h-3 border-2 border-white ${statusColor[status]}`}
          />
        </div>
        
        <div>
          <h3 className="font-medium text-sm">{name}</h3>
          <p className="text-xs text-muted-foreground">
            {isTyping ? (
              <span className="italic">{t('chat.typing')}</span>
            ) : (
              status === 'online' ? t('chat.online') : t('chat.offline')
            )}
            {userCount && userCount > 0 && (
              <span className="ml-1">• {userCount} {t('chat.participants')}</span>
            )}
          </p>
        </div>
      </div>
      
      <div className="flex items-center space-x-1">
        {showCallButtons && (
          <>
            {onAudioCall && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9" 
                onClick={onAudioCall}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            
            {onVideoCall && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full h-9 w-9" 
                onClick={onVideoCall}
              >
                <Video className="h-4 w-4" />
              </Button>
            )}
          </>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('chat.options')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {onViewProfile && (
              <DropdownMenuItem onClick={onViewProfile}>
                {t('chat.view_profile')}
              </DropdownMenuItem>
            )}
            
            {onMuteNotifications && (
              <DropdownMenuItem onClick={onMuteNotifications}>
                {t('chat.mute_notifications')}
              </DropdownMenuItem>
            )}
            
            {onClearHistory && (
              <DropdownMenuItem onClick={onClearHistory}>
                {t('chat.clear_history')}
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            {onBlockUser && (
              <DropdownMenuItem 
                onClick={onBlockUser}
                className="text-destructive focus:text-destructive"
              >
                {t('chat.block_user')}
              </DropdownMenuItem>
            )}
            
            {onReportUser && (
              <DropdownMenuItem 
                onClick={onReportUser}
                className="text-destructive focus:text-destructive"
              >
                {t('chat.report_user')}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 