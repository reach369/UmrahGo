// Types for our mock data
export interface Campaign {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  price: number;
  capacity: number;
  registeredCount: number;
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  description: string;
  transportationIncluded: boolean;
  accommodationDetails: string;
}

export interface Booking {
  id: string;
  campaignId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  bookedAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  numberOfPilgrims: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partial' | 'refunded';
  passportDetails: {
    passportNumber: string;
    name: string;
    nationality: string;
    birthDate: string;
    expiryDate: string;
  }[];
  notes: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'paypal';
  date: string;
  referenceNumber: string;
  systemFee: number;
  netAmount: number;
}

export interface TransportationProvider {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  licenseNumber: string;
  fleetSize: number;
  availableVehicles: number;
  rating: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number; // in months
  features: string[];
  isPopular: boolean;
}

export interface OfficeStats {
  totalBookings: number;
  pendingApprovals: number;
  activeCampaigns: number;
  totalRevenue: number;
  monthlyBookings: { month: string; count: number }[];
  revenueBreakdown: { category: string; amount: number }[];
}

// Mock campaigns data
export const mockCampaigns = [
  {
    id: "1",
    office_id: "101",
    package_id: "201",
    name: "رحلة عمرة رمضان 1445",
    description: "رحلة عمرة خاصة خلال شهر رمضان المبارك تشمل الإقامة في فندق 5 نجوم قريب من الحرم المكي الشريف",
    start_date: "2024-03-10",
    end_date: "2024-03-20",
    available_seats: 8, // 50 capacity - 42 registered = 8 available
    status: "active",
    created_at: "2024-01-15T10:30:00",
    updated_at: "2024-02-20T14:15:00"
  },
  {
    id: "2",
    office_id: "101",
    package_id: "202",
    name: "رحلة عمرة شعبان 1445",
    description: "رحلة عمرة خلال شهر شعبان تشمل زيارة المدينة المنورة والإقامة في فنادق 4 نجوم",
    start_date: "2024-02-05",
    end_date: "2024-02-15",
    available_seats: 0, // 40 capacity - 40 registered = 0 available
    status: "completed",
    created_at: "2023-12-10T09:45:00",
    updated_at: "2024-02-16T11:20:00"
  },
  {
    id: "3",
    office_id: "102",
    package_id: "203",
    name: "رحلة عمرة رجب الاقتصادية",
    description: "رحلة عمرة اقتصادية خلال شهر رجب مناسبة للعائلات والمجموعات",
    start_date: "2024-01-15",
    end_date: "2024-01-22",
    available_seats: 8, // 60 capacity - 52 registered = 8 available
    status: "completed",
    created_at: "2023-11-05T13:20:00",
    updated_at: "2024-01-23T16:45:00"
  },
  {
    id: "4",
    office_id: "103",
    package_id: "204",
    name: "رحلة عمرة شوال المميزة",
    description: "رحلة عمرة فاخرة تشمل الإقامة في فنادق 5 نجوم في مكة والمدينة مع برنامج سياحي",
    start_date: "2024-04-15",
    end_date: "2024-04-25",
    available_seats: 21, // 30 capacity - 9 registered = 21 available
    status: "active",
    created_at: "2024-02-01T08:30:00",
    updated_at: "2024-03-05T10:15:00"
  },
  {
    id: "5",
    office_id: "101",
    package_id: "205",
    name: "رحلة عمرة ذو القعدة",
    description: "رحلة عمرة مميزة تشمل برنامج سياحي في مكة المكرمة والمدينة المنورة وجدة",
    start_date: "2024-05-10",
    end_date: "2024-05-17",
    available_seats: 45, // 45 capacity - 0 registered = 45 available
    status: "active",
    created_at: "2024-02-15T15:10:00",
    updated_at: "2024-02-15T15:10:00"
  }
];

// Mock bookings data
export const mockBookings: Booking[] = [
  {
    id: 'book-001',
    campaignId: 'camp-001',
    userId: 'user-001',
    userName: 'عبدالله محمد',
    userEmail: 'abdullah@example.com',
    userPhone: '+966512345678',
    bookedAt: '2024-02-15T10:30:00',
    status: 'approved',
    numberOfPilgrims: 2,
    totalAmount: 13000,
    paymentStatus: 'paid',
    passportDetails: [
      {
        passportNumber: 'A12345678',
        name: 'عبدالله محمد',
        nationality: 'سعودي',
        birthDate: '1985-06-15',
        expiryDate: '2028-06-14'
      },
      {
        passportNumber: 'A87654321',
        name: 'منى عبدالله',
        nationality: 'سعودية',
        birthDate: '1988-03-25',
        expiryDate: '2027-03-24'
      }
    ],
    notes: 'يفضل غرفة بعيدة عن الضوضاء'
  },
  {
    id: 'book-002',
    campaignId: 'camp-001',
    userId: 'user-002',
    userName: 'فهد العتيبي',
    userEmail: 'fahad@example.com',
    userPhone: '+966523456789',
    bookedAt: '2024-02-18T14:45:00',
    status: 'pending',
    numberOfPilgrims: 4,
    totalAmount: 26000,
    paymentStatus: 'partial',
    passportDetails: [
      {
        passportNumber: 'B12345678',
        name: 'فهد العتيبي',
        nationality: 'سعودي',
        birthDate: '1980-11-20',
        expiryDate: '2026-11-19'
      },
      {
        passportNumber: 'B87654321',
        name: 'نورة الفهد',
        nationality: 'سعودية',
        birthDate: '1982-08-10',
        expiryDate: '2026-08-09'
      },
      {
        passportNumber: 'C12345678',
        name: 'سعود الفهد',
        nationality: 'سعودي',
        birthDate: '2010-03-15',
        expiryDate: '2025-03-14'
      },
      {
        passportNumber: 'C87654321',
        name: 'سارة الفهد',
        nationality: 'سعودية',
        birthDate: '2012-07-25',
        expiryDate: '2025-07-24'
      }
    ],
    notes: 'عائلة مع أطفال، يفضل غرف متجاورة'
  },
  {
    id: 'book-003',
    campaignId: 'camp-001',
    userId: 'user-003',
    userName: 'محمد العنزي',
    userEmail: 'mohammed@example.com',
    userPhone: '+966534567890',
    bookedAt: '2024-02-20T09:15:00',
    status: 'rejected',
    numberOfPilgrims: 1,
    totalAmount: 6500,
    paymentStatus: 'refunded',
    passportDetails: [
      {
        passportNumber: 'D12345678',
        name: 'محمد العنزي',
        nationality: 'سعودي',
        birthDate: '1990-12-05',
        expiryDate: '2029-12-04'
      }
    ],
    notes: 'تم الرفض بسبب عدم اكتمال الوثائق المطلوبة'
  },
  {
    id: 'book-004',
    campaignId: 'camp-002',
    userId: 'user-004',
    userName: 'سارة الشمري',
    userEmail: 'sarah@example.com',
    userPhone: '+966545678901',
    bookedAt: '2024-01-10T11:20:00',
    status: 'completed',
    numberOfPilgrims: 3,
    totalAmount: 17400,
    paymentStatus: 'paid',
    passportDetails: [
      {
        passportNumber: 'E12345678',
        name: 'سارة الشمري',
        nationality: 'سعودية',
        birthDate: '1987-05-18',
        expiryDate: '2027-05-17'
      },
      {
        passportNumber: 'E87654321',
        name: 'أحمد الشمري',
        nationality: 'سعودي',
        birthDate: '1985-09-28',
        expiryDate: '2027-09-27'
      },
      {
        passportNumber: 'F12345678',
        name: 'ليان الشمري',
        nationality: 'سعودية',
        birthDate: '2015-04-12',
        expiryDate: '2025-04-11'
      }
    ],
    notes: 'تمت الرحلة بنجاح'
  },
  {
    id: 'book-005',
    campaignId: 'camp-004',
    userId: 'user-005',
    userName: 'خالد السالم',
    userEmail: 'khalid@example.com',
    userPhone: '+966556789012',
    bookedAt: '2024-03-05T16:40:00',
    status: 'approved',
    numberOfPilgrims: 2,
    totalAmount: 14400,
    paymentStatus: 'paid',
    passportDetails: [
      {
        passportNumber: 'G12345678',
        name: 'خالد السالم',
        nationality: 'سعودي',
        birthDate: '1975-01-30',
        expiryDate: '2028-01-29'
      },
      {
        passportNumber: 'G87654321',
        name: 'عائشة السالم',
        nationality: 'سعودية',
        birthDate: '1978-11-15',
        expiryDate: '2028-11-14'
      }
    ],
    notes: 'يرغب في غرفة مطلة على الحرم'
  }
];

// Mock payments data
export const mockPayments: Payment[] = [
  {
    id: 'pay-001',
    bookingId: 'book-001',
    amount: 13000,
    currency: 'SAR',
    status: 'completed',
    method: 'credit_card',
    date: '2024-02-15T10:35:00',
    referenceNumber: 'REF123456789',
    systemFee: 650, // 5% system fee
    netAmount: 12350
  },
  {
    id: 'pay-002',
    bookingId: 'book-002',
    amount: 15000,
    currency: 'SAR',
    status: 'completed',
    method: 'bank_transfer',
    date: '2024-02-18T15:20:00',
    referenceNumber: 'REF234567890',
    systemFee: 750, // 5% system fee
    netAmount: 14250
  },
  {
    id: 'pay-003',
    bookingId: 'book-003',
    amount: 6500,
    currency: 'SAR',
    status: 'refunded',
    method: 'credit_card',
    date: '2024-02-20T09:20:00',
    referenceNumber: 'REF345678901',
    systemFee: 325, // 5% system fee
    netAmount: 6175
  },
  {
    id: 'pay-004',
    bookingId: 'book-004',
    amount: 17400,
    currency: 'SAR',
    status: 'completed',
    method: 'credit_card',
    date: '2024-01-10T11:25:00',
    referenceNumber: 'REF456789012',
    systemFee: 870, // 5% system fee
    netAmount: 16530
  },
  {
    id: 'pay-005',
    bookingId: 'book-005',
    amount: 14400,
    currency: 'SAR',
    status: 'completed',
    method: 'bank_transfer',
    date: '2024-03-05T16:45:00',
    referenceNumber: 'REF567890123',
    systemFee: 720, // 5% system fee
    netAmount: 13680
  }
];

// Mock transportation providers
export const mockTransportationProviders: TransportationProvider[] = [
  {
    id: 'trans-001',
    name: 'شركة النقل السريع',
    contactPerson: 'سعد العمري',
    phone: '+966512345678',
    email: 'info@fasttransport.com',
    licenseNumber: 'TR1234567',
    fleetSize: 25,
    availableVehicles: 12,
    rating: 4.8
  },
  {
    id: 'trans-002',
    name: 'شركة الراحة للنقل',
    contactPerson: 'فهد الدوسري',
    phone: '+966523456789',
    email: 'info@comforttransport.com',
    licenseNumber: 'TR2345678',
    fleetSize: 18,
    availableVehicles: 8,
    rating: 4.5
  },
  {
    id: 'trans-003',
    name: 'شركة النقل الآمن',
    contactPerson: 'عبدالرحمن السلمي',
    phone: '+966534567890',
    email: 'info@safetransport.com',
    licenseNumber: 'TR3456789',
    fleetSize: 30,
    availableVehicles: 15,
    rating: 4.7
  }
];

// Mock subscription plans
export const mockSubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'plan-001',
    name: 'الباقة الأساسية',
    price: 500,
    duration: 1,
    features: [
      'إدارة الحملات (حتى 3 حملات)',
      'إدارة الحجوزات',
      'تقارير أساسية',
      'دعم فني عبر البريد الإلكتروني'
    ],
    isPopular: false
  },
  {
    id: 'plan-002',
    name: 'الباقة المتوسطة',
    price: 1200,
    duration: 3,
    features: [
      'إدارة الحملات (حتى 10 حملات)',
      'إدارة الحجوزات',
      'تقارير متقدمة',
      'دعم فني عبر البريد الإلكتروني والهاتف',
      'موقع مخصص للمكتب',
      'ظهور مميز في نتائج البحث'
    ],
    isPopular: true
  },
  {
    id: 'plan-003',
    name: 'الباقة المتقدمة',
    price: 2000,
    duration: 6,
    features: [
      'إدارة الحملات (غير محدود)',
      'إدارة الحجوزات المتقدمة',
      'تقارير تفصيلية واحصائيات',
      'دعم فني على مدار الساعة',
      'موقع مخصص للمكتب مع تطبيق جوال',
      'ظهور في المراكز الأولى في نتائج البحث',
      'تكامل مع أنظمة المحاسبة',
      'إدارة متقدمة للموارد البشرية'
    ],
    isPopular: false
  }
];

// Mock office statistics
export const mockOfficeStats: OfficeStats = {
  totalBookings: 275,
  pendingApprovals: 18,
  activeCampaigns: 2,
  totalRevenue: 1250000,
  monthlyBookings: [
    { month: 'يناير', count: 32 },
    { month: 'فبراير', count: 48 },
    { month: 'مارس', count: 65 },
    { month: 'أبريل', count: 42 },
    { month: 'مايو', count: 35 },
    { month: 'يونيو', count: 28 }
  ],
  revenueBreakdown: [
    { category: 'حملات رمضان', amount: 650000 },
    { category: 'حملات شعبان', amount: 320000 },
    { category: 'حملات رجب', amount: 180000 },
    { category: 'حملات اخرى', amount: 100000 }
  ]
}; 