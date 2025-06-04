'use client';

import React, { useState, useRef } from 'react';
import { FiSend, FiImage, FiPaperclip } from 'react-icons/fi';

interface TransportChatInputProps {
  onSendMessage: (content: string, contentType: 'text' | 'image' | 'document', file?: File) => void;
  isLoading?: boolean;
}

export const TransportChatInput: React.FC<TransportChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = e.target.files?.[0];
    if (file) {
      onSendMessage(file.name, type, file);
    }
    e.target.value = '';
  };

  return (
    <form onSubmit={handleSubmit} className="border-t dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
      <div className="flex items-center space-x-4">
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          title="إرسال صورة"
        >
          <FiImage className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
          title="إرسال ملف"
        >
          <FiPaperclip className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="w-full px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 dark:text-white"
            dir="rtl"
          />
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className={`rounded-full p-2 ${
            message.trim() && !isLoading
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
          } text-white transition-colors`}
        >
          <FiSend className="w-5 h-5" />
        </button>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileChange(e, 'image')}
        className="hidden"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        onChange={(e) => handleFileChange(e, 'document')}
        className="hidden"
      />
    </form>
  );
}; 