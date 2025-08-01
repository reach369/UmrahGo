'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedChatContainer } from '@/components/chat/UnifiedChatContainer';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  MessageCircle, 
  Bell, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  XCircle, 
  Clock,
  RefreshCw,
  Send,
  Users,
  Settings
} from 'lucide-react';
import chatService from '@/services/chat.service';
import notificationService from '@/services/notification.service';
import { useChatWebSocket } from '@/hooks/useChatWebSocket';
import { getAuthToken } from '@/lib/auth.service';

export default function TestChatPage() {
  const { state: authState } = useAuth();
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [testChatId, setTestChatId] = useState('1');
  const [testMessage, setTestMessage] = useState('مرحبا، هذه رسالة اختبار');
  const [userType, setUserType] = useState<'pilgrim' | 'office' | 'bus_operator' | 'admin'>('office');
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const [testResults, setTestResults] = useState<Array<{
    test: string;
    status: 'pending' | 'success' | 'error';
    message: string;
    timestamp: string;
  }>>([]);

  // Initialize WebSocket for testing
  const { 
    connectionStatus: wsStatus,
    sendMessage,
    markAsRead,
    unreadCount
  } = useChatWebSocket({
    chatId: selectedChatId,
    userType,
    onNewMessage: (message) => {
      addTestResult('WebSocket Message Received', 'success', `Message: ${message.message || message.content}`);
    },
    onMessageStatusUpdate: (messageId, status) => {
      addTestResult('Message Status Update', 'success', `Message ${messageId}: ${status}`);
    },
    onConnectionStatusChange: (status) => {
      setConnectionStatus(status);
      addTestResult('Connection Status', status === 'connected' ? 'success' : 'error', `Status: ${status}`);
    },
  });

  // Add test result
  const addTestResult = (test: string, status: 'pending' | 'success' | 'error', message: string) => {
    const result = {
      test,
      status,
      message,
      timestamp: new Date().toLocaleTimeString('ar-SA')
    };
    
    setTestResults(prev => [result, ...prev.slice(0, 19)]); // Keep last 20 results
    
    if (status === 'success') {
      toast.success(`✅ ${test}: ${message}`);
    } else if (status === 'error') {    
      toast.error(`❌ ${test}: ${message}`);
    }
  };

  // Test functions
  const testRestAPI = async () => {
    addTestResult('REST API Test', 'pending', 'Testing REST API...');
    
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token');
      }

      // Test getting chats
      const chats = await chatService.getChats(token, userType);
      addTestResult('Get Chats API', 'success', `Found ${chats.length} chats`);

      // Test sending message if chat ID is provided
      if (testChatId && testMessage) {
        const response = await chatService.sendMessage(token, testChatId, testMessage, 'text', 'normal', userType);
        if (response.success) {
          addTestResult('Send Message API', 'success', 'Message sent successfully');
        } else {
          throw new Error(response.error || 'Failed to send message');
        }
      }

    } catch (error: any) {
      addTestResult('REST API Test', 'error', error.message);
    }
  };

  const testWebSocket = async () => {
    addTestResult('WebSocket Test', 'pending', 'Testing WebSocket...');
    
    try {
      if (wsStatus !== 'connected') {
        throw new Error('WebSocket not connected');
      }

      if (!testMessage.trim()) {
        throw new Error('No test message provided');
      }

      const result = await sendMessage(testMessage);
      if (result && result.success) {
        addTestResult('WebSocket Send', 'success', 'Message sent via WebSocket');
      } else {
        throw new Error('WebSocket send failed');
      }

    } catch (error: any) {
      addTestResult('WebSocket Test', 'error', error.message);
    }
  };

  const testNotifications = async () => {
    addTestResult('Notifications Test', 'pending', 'Testing notifications...');
    
    try {
      // Test getting notifications
      const notifications = await notificationService.getLatestNotifications(5);
      addTestResult('Get Notifications', 'success', `Found ${notifications.length} notifications`);

      // Test getting unread count
      const unreadCount = await notificationService.getUnreadCount();
      addTestResult('Get Unread Count', 'success', `Unread: ${unreadCount}`);

    } catch (error: any) {
      addTestResult('Notifications Test', 'error', error.message);
    }
  };

  const testFallback = async () => {
    addTestResult('Fallback Test', 'pending', 'Testing fallback mechanisms...');
    
    try {
      // First try WebSocket
      if (wsStatus === 'connected') {
        try {
          const wsResult = await sendMessage('Fallback test message');
          if (wsResult && wsResult.success) {
                addTestResult('WebSocket Fallback', 'success', 'WebSocket working, no fallback needed');
            return;
          }
        } catch (wsError) {
          addTestResult('WebSocket Fallback', 'error', 'WebSocket failed, trying REST API...');
        }
      }

      // Fallback to REST API
        const token = getAuthToken();
      if (!token) {
        throw new Error('No authentication token for fallback');
      }

      const response = await chatService.sendMessage(token, testChatId, 'Fallback test message', 'text', 'normal', userType);
      if (response.success) {
        addTestResult('REST API Fallback', 'success', 'REST API fallback successful');
      } else {
        throw new Error(response.error || 'REST API fallback failed');
      }

    } catch (error: any) {
      addTestResult('Fallback Test', 'error', error.message);
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    addTestResult('Starting Tests', 'pending', 'Running comprehensive tests...');
    
    await testRestAPI();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testWebSocket();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testNotifications();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testFallback();
    
    addTestResult('All Tests Complete', 'success', 'Test suite finished');
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'connecting':
      case 'reconnecting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <WifiOff className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTestIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">اختبار نظام المحادثات والإشعارات</h1>
          <p className="text-muted-foreground mt-2">
            صفحة شاملة لاختبار جميع وظائف المحادثات والإشعارات
          </p>
        </div>
        <div className="flex items-center gap-4">
          <NotificationCenter />
          <div className="flex items-center gap-2">
            {getStatusIcon(connectionStatus)}
            <span className="text-sm">
              {connectionStatus === 'connected' ? 'متصل' : 
               connectionStatus === 'connecting' ? 'جاري الاتصال' :
               connectionStatus === 'error' ? 'خطأ في الاتصال' : 'غير متصل'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات الاختبار
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="userType">نوع المستخدم</Label>
                <Select value={userType} onValueChange={(value: any) => setUserType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pilgrim">حاج</SelectItem>
                    <SelectItem value="office">مكتب عمرة</SelectItem>
                    <SelectItem value="bus_operator">مشغل حافلات</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="chatId">معرف المحادثة</Label>
                <Input
                  id="chatId"
                  value={testChatId}
                  onChange={(e) => setTestChatId(e.target.value)}
                  placeholder="أدخل معرف المحادثة"
                />
              </div>

              <div>
                <Label htmlFor="message">رسالة الاختبار</Label>
                <Input
                  id="message"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  placeholder="أدخل رسالة الاختبار"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Button onClick={testRestAPI} className="w-full" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  اختبار REST API
                </Button>
                
                <Button onClick={testWebSocket} className="w-full" variant="outline">
                  <Wifi className="h-4 w-4 mr-2" />
                  اختبار WebSocket
                </Button>
                
                <Button onClick={testNotifications} className="w-full" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  اختبار الإشعارات
                </Button>
                
                <Button onClick={testFallback} className="w-full" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  اختبار Fallback
                </Button>
                
                <Separator />
                
                <Button onClick={runAllTests} className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  تشغيل جميع الاختبارات
                </Button>
                
                <Button onClick={clearResults} variant="destructive" className="w-full">
                  مسح النتائج
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                الحالة الحالية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>المستخدم:</span>
                <Badge variant="outline">{authState.user?.name || 'غير معروف'}</Badge>
              </div>
              <div className="flex justify-between">
                <span>النوع:</span>
                <Badge variant="outline">{userType}</Badge>
              </div>
              <div className="flex justify-between">
                <span>الاتصال:</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(connectionStatus)}
                  <span className="text-sm">{connectionStatus}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span>الرسائل غير المقروءة:</span>
                <Badge variant="destructive">{unreadCount}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Results */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                نتائج الاختبارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لم يتم تشغيل أي اختبارات بعد</p>
                  <p className="text-sm">اضغط على أحد أزرار الاختبار لبدء الاختبار</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {testResults.map((result, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                      {getTestIcon(result.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-sm">{result.test}</h4>
                          <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Live Chat Test */}
          {testChatId && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>اختبار المحادثة المباشرة</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-96">
                  <UnifiedChatContainer
                    chatId={testChatId}
                    userType={userType}
                    showHeader={true}
                    maxHeight="h-96"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 