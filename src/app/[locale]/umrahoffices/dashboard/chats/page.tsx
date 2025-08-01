import React from 'react';
import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'chat' });
  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function ChatsPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'chat' });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">{t('description')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Chat List Card */}
        <Link 
          href={`/${params.locale}/umrahoffices/dashboard/chats/list`}
          className="block group"
        >
          <div className="h-full  dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md hover:border-primary/60">
            <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors">{t('view_chats')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{t('select_chat_description')}</p>
          </div>
        </Link>

        {/* New Chat Card */}
        <Link 
          href={`/${params.locale}/umrahoffices/dashboard/chats/new`}
          className="block group"
        >
          <div className="h-full  dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md hover:border-primary/60">
            <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors">{t('new_chat')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{t('no_chats_start_conversation')}</p>
          </div>
        </Link>

        {/* Unread Messages Card */}
        <Link 
          href={`/${params.locale}/umrahoffices/dashboard/chats/list?filter=unread`}
          className="block group"
        >
          <div className="h-full  dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-md hover:border-primary/60">
            <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-primary/10 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
                <circle cx="18" cy="6" r="3"></circle>
                <path d="M18 6h.01"></path>
                <path d="m2 16.1.5-.3a5 5 0 0 1 5.5.1a5 5 0 0 0 5-.9 4.8 4.8 0 0 1 5.2-.9l.3.1"></path>
                <path d="m2 12.1.5-.3a5 5 0 0 1 5.5.1a5 5 0 0 0 5-.9 4.8 4.8 0 0 1 5.2-.9l.3.1"></path>
                <path d="M18 8a14.2 14.2 0 0 1 2.5 1 5 5 0 0 0 2 .3A4.2 4.2 0 0 0 22 9"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors">{t('unread')}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{t('unread_messages')}</p>
          </div>
        </Link>
      </div>
    </div>
  );
} 