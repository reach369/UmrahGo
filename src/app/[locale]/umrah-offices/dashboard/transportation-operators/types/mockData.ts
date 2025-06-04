import { TransportChatMessage, TransportChatRoom, TransportChatParticipant } from './chat.types';

export const mockParticipants: TransportChatParticipant[] = [
  {
    id: '1',
    type: 'transport_operator',
    name: 'أحمد محمد',
    avatar: 'https://i.pravatar.cc/150?img=1',
    isOnline: true,
    lastSeen: new Date().toISOString()
  },
  {
    id: '2',
    type: 'office',
    name: 'مكتب العمرة المتميز',
    avatar: 'https://i.pravatar.cc/150?img=2',
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
  },
  {
    id: '3',
    type: 'pilgrim',
    name: 'عبدالله خالد',
    avatar: 'https://i.pravatar.cc/150?img=3',
    isOnline: true,
    lastSeen: new Date().toISOString()
  }
];

export const mockChatRooms: TransportChatRoom[] = [
  {
    id: 'chat1',
    type: 'direct',
    participants: [mockParticipants[0], mockParticipants[1]],
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
    lastMessage: {
      id: 'msg1',
      senderId: '1',
      senderType: 'transport_operator',
      senderName: 'أحمد محمد',
      content: 'مرحباً، هل لديكم أي طلبات نقل جديدة؟',
      contentType: 'text',
      timestamp: new Date().toISOString(),
      status: 'read',
      chatId: 'chat1'
    }
  },
  {
    id: 'chat2',
    type: 'group',
    name: 'مجموعة النقل - الحجاج',
    participants: [mockParticipants[0], mockParticipants[2], mockParticipants[1]],
    createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString(),
    lastMessage: {
      id: 'msg2',
      senderId: '3',
      senderType: 'pilgrim',
      senderName: 'عبدالله خالد',
      content: 'شكراً لكم على الخدمة المميزة',
      contentType: 'text',
      timestamp: new Date().toISOString(),
      status: 'delivered',
      chatId: 'chat2'
    }
  }
];

export const mockMessages: Record<string, TransportChatMessage[]> = {
  chat1: [
    {
      id: 'msg1',
      senderId: '1',
      senderType: 'transport_operator',
      senderName: 'أحمد محمد',
      content: 'مرحباً، هل لديكم أي طلبات نقل جديدة؟',
      contentType: 'text',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      status: 'read',
      chatId: 'chat1'
    },
    {
      id: 'msg2',
      senderId: '2',
      senderType: 'office',
      senderName: 'مكتب العمرة المتميز',
      content: 'نعم، لدينا مجموعة من الحجاج يحتاجون للنقل من المطار إلى الفندق',
      contentType: 'text',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      status: 'read',
      chatId: 'chat1'
    },
    {
      id: 'msg3',
      senderId: '1',
      senderType: 'transport_operator',
      senderName: 'أحمد محمد',
      content: 'كم عدد الحجاج وما هو موعد وصولهم؟',
      contentType: 'text',
      timestamp: new Date(Date.now() - 3400000).toISOString(),
      status: 'read',
      chatId: 'chat1'
    }
  ],
  chat2: [
    {
      id: 'msg1',
      senderId: '2',
      senderType: 'office',
      senderName: 'مكتب العمرة المتميز',
      content: 'مرحباً بكم في مجموعة النقل',
      contentType: 'text',
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      status: 'read',
      chatId: 'chat2'
    },
    {
      id: 'msg2',
      senderId: '3',
      senderType: 'pilgrim',
      senderName: 'عبدالله خالد',
      content: 'شكراً لكم على الخدمة المميزة',
      contentType: 'text',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      status: 'delivered',
      chatId: 'chat2'
    },
    {
      id: 'msg3',
      senderId: '1',
      senderType: 'transport_operator',
      senderName: 'أحمد محمد',
      content: 'نحن في خدمتكم دائماً',
      contentType: 'text',
      timestamp: new Date(Date.now() - 3500000).toISOString(),
      status: 'sent',
      chatId: 'chat2'
    }
  ]
}; 