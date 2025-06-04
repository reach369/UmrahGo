'use client';

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatList } from './ChatList';
import { useChatWebSocket } from '../../hooks/useChatWebSocket';
import {
  useGetChatsQuery,
  useGetChatMessagesQuery,
  useSendMessageMutation,
  useUpdateMessageStatusMutation,
  useCreateGroupChatMutation,
} from '../../redux/chatApiSlice';
import { setSelectedChat } from '../../redux/chatSlice';
import { FiPlus, FiUsers } from 'react-icons/fi';

interface ChatContainerProps {
  userId: string;
  userType: 'bus_operator' | 'office' | 'pilgrim';
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ userId, userType }) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendWebSocketMessage } = useChatWebSocket(userId);

  // Redux queries and mutations
  const { data: chats = [] } = useGetChatsQuery();
  const selectedChatId = useSelector((state: any) => state.busChat.selectedChatId);
  const { data: messages = [] } = useGetChatMessagesQuery(selectedChatId || '', {
    skip: !selectedChatId,
  });
  const [sendMessage] = useSendMessageMutation();
  const [updateMessageStatus] = useUpdateMessageStatusMutation();
  const [createGroupChat] = useCreateGroupChatMutation();

  // Calculate unread counts
  const unreadCounts = chats.reduce((acc: { [key: string]: number }, chat) => {
    acc[chat.id] = messages.filter(
      (msg) => msg.senderId !== userId && msg.status !== 'read'
    ).length;
    return acc;
  }, {});

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (selectedChatId) {
      messages
        .filter((msg) => msg.senderId !== userId && msg.status !== 'read')
        .forEach((msg) => {
          updateMessageStatus({
            messageId: msg.id,
            chatId: selectedChatId,
            status: 'read',
          });
        });
    }
  }, [selectedChatId, messages, userId, updateMessageStatus]);

  const handleSendMessage = async (content: string, contentType: 'text' | 'image' | 'document', file?: File) => {
    if (!selectedChatId) return;

    try {
      const result = await sendMessage({
        chatId: selectedChatId,
        content,
        contentType,
        file,
      }).unwrap();

      // Notify other participants through WebSocket
      sendWebSocketMessage('new_message', {
        ...result,
        chatId: selectedChatId,
      });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleCreateGroupChat = async () => {
    try {
      const name = prompt('أدخل اسم المجموعة:');
      if (!name) return;

      const participantIds = prompt('أدخل معرفات المشاركين (مفصولة بفواصل):')
        ?.split(',')
        .map((id) => id.trim())
        .filter(Boolean);

      if (!participantIds?.length) return;

      const result = await createGroupChat({
        name,
        participantIds,
      }).unwrap();

      dispatch(setSelectedChat(result.id));
    } catch (error) {
      console.error('Failed to create group chat:', error);
    }
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Chat List */}
      <div className="w-80 border-l dark:border-gray-700">
        <div className="h-full flex flex-col">
          <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
            <button
              onClick={handleCreateGroupChat}
              className="flex items-center space-x-2 text-blue-500 hover:text-blue-600 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              <FiUsers className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">المحادثات</h2>
          </div>
          <ChatList
            chats={chats}
            selectedChatId={selectedChatId}
            onSelectChat={(chatId) => dispatch(setSelectedChat(chatId))}
            unreadCounts={unreadCounts}
          />
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 flex flex-col">
        {selectedChatId ? (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isOwnMessage={message.senderId === userId}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <p>اختر محادثة للبدء</p>
          </div>
        )}
      </div>
    </div>
  );
}; 