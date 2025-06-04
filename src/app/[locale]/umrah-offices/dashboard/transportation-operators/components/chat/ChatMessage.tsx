import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TransportChatMessage as TransportChatMessageType } from '../../types/chat.types';
import { FiCheck, FiCheckCircle } from 'react-icons/fi';
import { AiOutlineFile } from 'react-icons/ai';

interface TransportChatMessageProps {
  message: TransportChatMessageType;
  isOwnMessage: boolean;
}

export const TransportChatMessage: React.FC<TransportChatMessageProps> = ({ message, isOwnMessage }) => {
  const getStatusIcon = () => {
    switch (message.status) {
      case 'sent':
        return <FiCheck className="text-gray-400" />;
      case 'delivered':
        return <div className="flex"><FiCheck className="text-blue-400" /><FiCheck className="text-blue-400 -ml-1" /></div>;
      case 'read':
        return <FiCheckCircle className="text-blue-400" />;
      default:
        return null;
    }
  };

  const renderContent = () => {
    switch (message.contentType) {
      case 'image':
        return (
          <div className="relative w-48 h-48 rounded-lg overflow-hidden">
            <Image
              src={message.mediaUrl || ''}
              alt="Shared image"
              fill
              className="object-cover"
            />
          </div>
        );
      case 'document':
        return (
          <div className="flex items-center space-x-2 bg-white/10 rounded-lg p-3">
            <AiOutlineFile className="text-2xl" />
            <div>
              <p className="text-sm font-medium">{message.fileName}</p>
              <p className="text-xs text-gray-400">{(message.fileSize || 0) / 1000000} MB</p>
            </div>
          </div>
        );
      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-end space-x-2 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isOwnMessage && (
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              {message.senderName.charAt(0)}
            </div>
          </div>
        )}
        <div className={`max-w-[70%] ${isOwnMessage ? 'ml-2' : 'mr-2'}`}>
          {!isOwnMessage && (
            <p className="text-xs text-gray-400 mb-1">{message.senderName}</p>
          )}
          <div
            className={`rounded-2xl p-3 ${
              isOwnMessage
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
            }`}
          >
            {renderContent()}
            <div className="flex items-center justify-end mt-1 space-x-1">
              <span className="text-xs opacity-70">
                {format(new Date(message.timestamp), 'HH:mm', { locale: ar })}
              </span>
              {isOwnMessage && getStatusIcon()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 