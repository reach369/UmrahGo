'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PilgrimChatHeaderProps {
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  onBack?: () => void;
}

export function PilgrimChatHeader({
  name,
  avatar,
  status = 'offline',
  onBack
}: PilgrimChatHeaderProps) {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-1 lg:hidden" 
            onClick={onBack}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar>
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-xs text-muted-foreground flex items-center">
            <span className={`w-2 h-2 rounded-full mr-1 ${
              status === 'online' ? 'bg-green-500' : 
              status === 'away' ? 'bg-yellow-500' : 
              'bg-gray-400'
            }`} />
            {status === 'online' 
              ? t('pilgrim.chat.status.online')
              : status === 'away' 
                ? t('pilgrim.chat.status.away')
                : t('pilgrim.chat.status.offline')
            }
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <Phone className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden md:flex">
          <Video className="h-4 w-4" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="md:hidden">
              {t('pilgrim.chat.actions.call')}
            </DropdownMenuItem>
            <DropdownMenuItem className="md:hidden">
              {t('pilgrim.chat.actions.video_call')}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="md:hidden" />
            <DropdownMenuItem>
              {t('pilgrim.chat.actions.search')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              {t('pilgrim.chat.actions.mute')}
            </DropdownMenuItem>
            <DropdownMenuItem>
              {t('pilgrim.chat.actions.clear')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              {t('pilgrim.chat.actions.block')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
} 