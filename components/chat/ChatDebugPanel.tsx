/**
 * لوحة تصحيح المحادثات
 * Chat Debug Panel - For troubleshooting chat issues
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronRight, 
  Bug, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  User,
  MessageSquare,
  Shield
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import authChatService from '@/services/auth-chat.service';
import chatService from '@/services/chat.service';
import { getAuthToken } from '@/lib/auth.service';

interface DebugInfo {
  nextAuthSession: any;
  authChatUser: any;
  token: string | null;
  apiConnection: 'testing' | 'success' | 'failed';
  chatsCount: number;
  errors: string[];
}

export function ChatDebugPanel() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({
    nextAuthSession: null,
    authChatUser: null,
    token: null,
    apiConnection: 'testing',
    chatsCount: 0,
    errors: []
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshDebugInfo();
  }, [session, status]);

  const refreshDebugInfo = async () => {
    setIsRefreshing(true);
    const errors: string[] = [];

    try {
      // Get NextAuth session
      const nextAuthSession = session;

      // Get auth chat user
      const authChatUser = await authChatService.getCurrentUser();

      // Get token
      const token = getAuthToken();

      // Test API connection
      let apiConnection: 'testing' | 'success' | 'failed' = 'testing';
      let chatsCount = 0;

      try {
        const chats = await chatService.getChats();
        chatsCount = chats.length;
        apiConnection = 'success';
      } catch (error) {
        apiConnection = 'failed';
        errors.push(`API Connection: ${error}`);
      }

      // Validation checks
      if (!nextAuthSession) {
        errors.push('NextAuth session not found');
      }

      if (!authChatUser) {
        errors.push('Auth chat user not found');
      }

      if (!token) {
        errors.push('Authentication token not found');
      }

      if (nextAuthSession && authChatUser && 
          nextAuthSession.user?.id !== authChatUser.id.toString()) {
        errors.push('Session and auth user ID mismatch');
      }

      setDebugInfo({
        nextAuthSession,
        authChatUser,
        token,
        apiConnection,
        chatsCount,
        errors
      });

    } catch (error) {
      errors.push(`Debug refresh error: ${error}`);
      setDebugInfo(prev => ({ ...prev, errors }));
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getApiStatusIcon = () => {
    switch (debugInfo.apiConnection) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
    }
  };

  const clearAuthAndRefresh = async () => {
    authChatService.clearAuthData();
    await authChatService.refreshUser();
    await refreshDebugInfo();
  };

  return (
    <Card className="mt-4 border-yellow-200 bg-yellow-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-yellow-100 transition-colors">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-yellow-600" />
                <span className="text-yellow-800">لوحة تصحيح المحادثات</span>
                {debugInfo.errors.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {debugInfo.errors.length} مشاكل
                  </Badge>
                )}
              </div>
              {isOpen ? (
                <ChevronDown className="h-5 w-5 text-yellow-600" />
              ) : (
                <ChevronRight className="h-5 w-5 text-yellow-600" />
              )}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4">
            {/* Control Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={refreshDebugInfo} 
                disabled={isRefreshing}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                تحديث المعلومات
              </Button>
              
              <Button 
                onClick={clearAuthAndRefresh}
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Shield className="h-4 w-4 mr-2" />
                مسح المصادقة
              </Button>
            </div>

            {/* Authentication Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NextAuth Session */}
              <div className="p-3  rounded border">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(!!debugInfo.nextAuthSession)}
                  <span className="font-medium">NextAuth Session</span>
                </div>
                {debugInfo.nextAuthSession ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Status: {status}</div>
                    <div>User ID: {debugInfo.nextAuthSession.user?.id}</div>
                    <div>Name: {debugInfo.nextAuthSession.user?.name}</div>
                    <div>Email: {debugInfo.nextAuthSession.user?.email}</div>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">لا توجد جلسة NextAuth</div>
                )}
              </div>

              {/* Auth Chat User */}
              <div className="p-3  rounded border">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(!!debugInfo.authChatUser)}
                  <span className="font-medium">Auth Chat User</span>
                </div>
                {debugInfo.authChatUser ? (
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>User ID: {debugInfo.authChatUser.id}</div>
                    <div>Name: {debugInfo.authChatUser.name}</div>
                    <div>Type: {debugInfo.authChatUser.userType}</div>
                    <div>Authenticated: {debugInfo.authChatUser.isAuthenticated ? 'نعم' : 'لا'}</div>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">لا يوجد مستخدم محقق</div>
                )}
              </div>

              {/* Token Status */}
              <div className="p-3  rounded border">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(!!debugInfo.token)}
                  <span className="font-medium">Authentication Token</span>
                </div>
                {debugInfo.token ? (
                  <div className="text-sm text-gray-600">
                    <div>Length: {debugInfo.token.length} chars</div>
                    <div>Starts: {debugInfo.token.substring(0, 20)}...</div>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">لا يوجد توكن مصادقة</div>
                )}
              </div>

              {/* API Connection */}
              <div className="p-3  rounded border">
                <div className="flex items-center gap-2 mb-2">
                  {getApiStatusIcon()}
                  <span className="font-medium">API Connection</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Status: {debugInfo.apiConnection}</div>
                  <div>Chats Count: {debugInfo.chatsCount}</div>
                  {debugInfo.apiConnection === 'success' && (
                    <div className="text-green-600">✓ اتصال ناجح بالAPI</div>
                  )}
                  {debugInfo.apiConnection === 'failed' && (
                    <div className="text-red-600">✗ فشل الاتصال بالAPI</div>
                  )}
                </div>
              </div>
            </div>

            {/* Errors */}
            {debugInfo.errors.length > 0 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">مشاكل مكتشفة:</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  {debugInfo.errors.map((error, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-red-500">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Message */}
            {debugInfo.errors.length === 0 && debugInfo.apiConnection === 'success' && (
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">
                    جميع الأنظمة تعمل بشكل صحيح! تم العثور على {debugInfo.chatsCount} محادثة.
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
} 