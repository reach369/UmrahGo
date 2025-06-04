import React from 'react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TransportChatRoom } from '../../types/chat.types';
import { FiCheck, FiCheckCircle, FiUsers } from 'react-icons/fi';

interface TransportChatListProps {
  chats: TransportChatRoom[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  unreadCounts: { [chatId: string]: number };
}

export const TransportChatList: React.FC<TransportChatListProps> = ({
  chats,
  selectedChatId,
  onSelectChat,
  unreadCounts,
}) => {
  const getLastMessagePreview = (chat: TransportChatRoom) => {
    if (!chat.lastMessage) return '';
    
    switch (chat.lastMessage.contentType) {
      case 'image':
        return '🖼️ صورة';
      case 'document':
        return '📎 مستند';
      default:
        return chat.lastMessage.content;
    }
  };

  const getStatusIcon = (status?: 'sent' | 'delivered' | 'read') => {
    switch (status) {
      case 'sent':
        return <FiCheck className="text-gray-400 w-4 h-4" />;
      case 'delivered':
        return <div className="flex"><FiCheck className="text-green-400 w-4 h-4" /><FiCheck className="text-green-400 w-4 h-4 -ml-1" /></div>;
      case 'read':
        return <FiCheckCircle className="text-green-400 w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-900 border-l dark:border-gray-700">
      <div className="p-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-semibold text-right">المحادثات</h2>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-10rem)]">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={`w-full p-4 flex items-start space-x-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
              selectedChatId === chat.id ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
          >
            <div className="flex-shrink-0">
              {chat.type === 'group' ? (
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <FiUsers className="w-6 h-6 text-green-500" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {chat.participants[0].name.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {chat.type === 'group' ? chat.name : chat.participants[0].name}
                </span>
                {chat.lastMessage && (
                  <span className="text-xs text-gray-500">
                    {format(new Date(chat.lastMessage.timestamp), 'HH:mm', { locale: ar })}
                  </span>
                )}
              </div>
              <div className="mt-1 flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {getLastMessagePreview(chat)}
                </p>
                <div className="flex items-center space-x-2">
                  {unreadCounts[chat.id] > 0 && (
                    <span className="bg-green-500 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem]">
                      {unreadCounts[chat.id]}
                    </span>
                  )}
                  {chat.lastMessage?.status && getStatusIcon(chat.lastMessage.status)}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}; 