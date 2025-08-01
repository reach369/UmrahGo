import { Office } from "../redux/api/officesApiSlice";

// Mock offices data for development and testing
export const mockOffices: Office[] = [
  {
    id: "office-001",
    name: "مكتب الفجر للعمرة",
    licenseNumber: "SA1234567",
    rating: 4.8,
    location: "مكة المكرمة",
    address: "شارع العزيزية العام، بجوار فندق الحرم",
    contactPerson: "خالد عبدالله",
    email: "info@alfajr-umrah.com",
    phone: "+966512345678",
    website: "www.alfajr-umrah.com",
    packages: ["pkg-gold", "pkg-silver", "pkg-bronze"],
    verified: true,
    availableSeats: 120,
    description: "مكتب رائد في مجال خدمات العمرة منذ أكثر من 15 عاماً",
    createdAt: "2019-05-12",
    status: "active"
  },
  {
    id: "office-002",
    name: "شركة البركة للعمرة والحج",
    licenseNumber: "SA7654321",
    rating: 4.5,
    location: "المدينة المنورة",
    address: "شارع السلام، قرب المسجد النبوي",
    contactPerson: "محمد أحمد",
    email: "contact@albaraka-umrah.com",
    phone: "+966523456789",
    website: "www.albaraka-umrah.com",
    packages: ["pkg-gold", "pkg-vip"],
    verified: true,
    availableSeats: 85,
    description: "نقدم خدمات متميزة للمعتمرين والحجاج من جميع أنحاء العالم",
    createdAt: "2017-08-23",
    status: "active"
  },
  {
    id: "office-003",
    name: "مكتب النور للخدمات الدينية",
    licenseNumber: "SA9876543",
    rating: 4.2,
    location: "جدة",
    address: "حي الروضة، شارع الأمير سلطان",
    contactPerson: "فهد العتيبي",
    email: "alnoor@umrahservices.com",
    phone: "+966534567890",
    website: "www.alnoor-services.com",
    packages: ["pkg-silver", "pkg-bronze", "pkg-economy"],
    verified: true,
    availableSeats: 50,
    description: "خبرة أكثر من 10 سنوات في خدمة ضيوف الرحمن",
    createdAt: "2020-02-15",
    status: "active"
  },
  {
    id: "office-004",
    name: "شركة الإيمان للسياحة الدينية",
    licenseNumber: "SA2468135",
    rating: 4.9,
    location: "مكة المكرمة",
    address: "حي العوالي، طريق الملك عبدالعزيز",
    contactPerson: "عبدالرحمن السعدي",
    email: "booking@aliman-umrah.com",
    phone: "+966545678901",
    website: "www.aliman-umrah.com",
    packages: ["pkg-vip", "pkg-gold", "pkg-silver"],
    verified: true,
    availableSeats: 200,
    description: "نوفر أرقى الخدمات وأفضل الإقامات في مكة المكرمة والمدينة المنورة",
    createdAt: "2018-11-05",
    status: "active"
  },
  {
    id: "office-005",
    name: "مؤسسة الصفوة لخدمات العمرة",
    licenseNumber: "SA1357924",
    rating: 4.3,
    location: "الرياض",
    address: "حي الملز، شارع الثلاثين",
    contactPerson: "سلطان القحطاني",
    email: "info@alsafwa-umrah.com",
    phone: "+966556789012",
    website: "www.alsafwa-umrah.com",
    packages: ["pkg-bronze", "pkg-economy"],
    verified: true,
    availableSeats: 70,
    description: "خدمات اقتصادية لأداء العمرة بكل يسر وسهولة",
    createdAt: "2021-06-20",
    status: "active"
  },
  {
    id: "office-006",
    name: "شركة الرضوان للحج والعمرة",
    licenseNumber: "SA3692581",
    rating: 4.6,
    location: "المدينة المنورة",
    address: "حي العنابية، شارع أبي ذر الغفاري",
    contactPerson: "عبدالله محمد",
    email: "alradwan@umrah.sa",
    phone: "+966567890123",
    website: "www.alradwan-umrah.com",
    packages: ["pkg-gold", "pkg-silver"],
    verified: true,
    availableSeats: 110,
    description: "نسعى لتقديم أفضل تجربة روحانية لضيوف الرحمن",
    createdAt: "2016-09-30",
    status: "active"
  },
  {
    id: "office-007",
    name: "مكتب الرحمة للخدمات الدينية",
    licenseNumber: "SA1472583",
    rating: 4.0,
    location: "جدة",
    address: "حي الفيصلية، شارع الملك فهد",
    contactPerson: "راشد الشمري",
    email: "alrahma@umrahservices.com",
    phone: "+966578901234",
    website: "www.alrahma-services.com",
    packages: ["pkg-economy", "pkg-bronze"],
    verified: true,
    availableSeats: 45,
    description: "خدمات ميسرة بأسعار مناسبة لجميع الفئات",
    createdAt: "2020-12-10",
    status: "active"
  },
  {
    id: "office-008",
    name: "مؤسسة الهدى للحج والعمرة",
    licenseNumber: "SA9638527",
    rating: 4.7,
    location: "مكة المكرمة",
    address: "حي النسيم، طريق المسجد الحرام",
    contactPerson: "سعد الغامدي",
    email: "alhuda@hajjumrah.com",
    phone: "+966589012345",
    website: "www.alhuda-hajjumrah.com",
    packages: ["pkg-vip", "pkg-gold"],
    verified: true,
    availableSeats: 150,
    description: "رحلات عمرة وحج مميزة مع أفضل الخدمات الفندقية والتنقلات",
    createdAt: "2017-03-18",
    status: "active"
  },
  {
    id: 'office-1',
    name: 'مكتب الإيمان للسياحة',
    licenseNumber: 'LIC123456',
    rating: 4.8,
    location: 'مكة المكرمة',
    address: 'شارع أبراج البيت، مكة المكرمة',
    contactPerson: 'أحمد الشريف',
    email: 'info@aliman-tourism.com',
    phone: '+966512345678',
    website: 'www.aliman-tourism.com',
    packages: ['package-1', 'package-2'],
    verified: true,
    availableSeats: 150,
    description: 'مكتب الإيمان للسياحة هو أحد المكاتب الرائدة في مجال تنظيم رحلات العمرة والحج منذ عام 1995.',
    createdAt: '2023-01-15T08:30:00Z',
    status: 'active'
  }
];

// Define package interface
export interface UmrahPackage {
  id: string;
  name: string;
  description: string;
  duration: number; // in days
  price: number;
  includes: string[];
  accommodationLevel: string;
  transportation: string;
  meals: string;
  maxPersons: number;
}

// Define a type for the packageData mapping
export type PackageData = {
  [key: string]: UmrahPackage;
};

// Mock package data
export const packageData: PackageData = {
  "pkg-vip": {
    id: "pkg-vip",
    name: "باقة VIP للعمرة",
    description: "تجربة فاخرة لأداء العمرة بأقصى درجات الراحة والرفاهية",
    duration: 10,
    price: 15000,
    includes: [
      "إقامة فاخرة في فنادق 5 نجوم",
      "تنقلات خاصة من وإلى المطار",
      "وجبات فاخرة يومياً",
      "زيارة للمعالم الإسلامية",
      "مرشد ديني خاص",
      "خدمة 24 ساعة"
    ],
    accommodationLevel: "5 نجوم - قريب من الحرم",
    transportation: "سيارات فاخرة خاصة",
    meals: "ثلاث وجبات يومياً في مطاعم فاخرة",
    maxPersons: 50
  },
  "pkg-gold": {
    id: "pkg-gold",
    name: "الباقة الذهبية للعمرة",
    description: "باقة متميزة لأداء العمرة مع خدمات ممتازة ومريحة",
    duration: 7,
    price: 10000,
    includes: [
      "إقامة في فنادق 5 نجوم",
      "تنقلات من وإلى المطار",
      "وجبات يومية",
      "زيارة للمعالم الإسلامية",
      "مرشد ديني"
    ],
    accommodationLevel: "5 نجوم - قريب من الحرم",
    transportation: "حافلات حديثة مكيفة",
    meals: "ثلاث وجبات يومياً",
    maxPersons: 75
  },
  "pkg-silver": {
    id: "pkg-silver",
    name: "الباقة الفضية للعمرة",
    description: "باقة متوازنة تجمع بين الجودة والتكلفة المناسبة",
    duration: 5,
    price: 7500,
    includes: [
      "إقامة في فنادق 4 نجوم",
      "تنقلات من وإلى المطار",
      "وجبتين يومياً",
      "زيارة للمعالم الإسلامية"
    ],
    accommodationLevel: "4 نجوم - مسافة معقولة من الحرم",
    transportation: "حافلات حديثة مكيفة",
    meals: "وجبتين يومياً (إفطار وعشاء)",
    maxPersons: 100
  },
  "pkg-bronze": {
    id: "pkg-bronze",
    name: "الباقة البرونزية للعمرة",
    description: "باقة اقتصادية مع الحفاظ على مستوى جيد من الخدمات",
    duration: 5,
    price: 5000,
    includes: [
      "إقامة في فنادق 3 نجوم",
      "تنقلات من وإلى المطار",
      "وجبة إفطار يومياً",
      "زيارة للمعالم الإسلامية"
    ],
    accommodationLevel: "3 نجوم",
    transportation: "حافلات مكيفة",
    meals: "وجبة إفطار يومياً",
    maxPersons: 120
  },
  "pkg-economy": {
    id: "pkg-economy",
    name: "الباقة الاقتصادية للعمرة",
    description: "باقة بتكلفة منخفضة لإتاحة العمرة للجميع",
    duration: 3,
    price: 3000,
    includes: [
      "إقامة في فنادق 2-3 نجوم",
      "تنقلات جماعية",
      "خدمات أساسية"
    ],
    accommodationLevel: "2-3 نجوم",
    transportation: "حافلات جماعية",
    meals: "بدون وجبات",
    maxPersons: 150
  }
};

// Mock Campaign Data
export const mockCampaigns = [
  {
    id: 1,
    office_id: 1,
    package_id: 1,
    name: 'عمرة رمضان المباركة',
    start_date: '2023-03-22',
    end_date: '2023-04-10',
    available_seats: 15,
    description: 'عمرة شهر رمضان المبارك - إقامة في فندق المروة ريحان روتانا - 5 نجوم',
    status: 'active'
  },
  {
    id: 2,
    office_id: 1,
    package_id: 2,
    name: 'عمرة الإجازة الصيفية',
    start_date: '2023-07-15',
    end_date: '2023-07-30',
    available_seats: 45,
    description: 'عمرة الإجازة الصيفية - إقامة في فندق هيلتون مكة - 4 نجوم',
    status: 'upcoming'
  },
  {
    id: 3,
    office_id: 1,
    package_id: 3,
    name: 'عمرة شهر شعبان',
    start_date: '2023-02-15',
    end_date: '2023-02-28',
    available_seats: 60,
    description: 'عمرة شهر شعبان - إقامة في فندق مكة ميلينيوم - 5 نجوم',
    status: 'completed'
  },
  {
    id: 4,
    office_id: 1,
    package_id: 4,
    name: 'عمرة آخر العام',
    start_date: '2023-12-10',
    end_date: '2023-12-25',
    available_seats: 40,
    description: 'عمرة آخر العام - إقامة في فندق موفنبيك - 5 نجوم',
    status: 'upcoming'
  },
  {
    id: 5,
    office_id: 1,
    package_id: 5,
    name: 'عمرة رجب المميزة',
    start_date: '2023-01-20',
    end_date: '2023-02-05',
    available_seats: 70,
    description: 'عمرة شهر رجب - إقامة في فندق كونراد - 4 نجوم',
    status: 'completed'
  },
  {
    id: 6,
    office_id: 1,
    package_id: 6,
    name: 'عمرة نهاية الأسبوع',
    start_date: '2023-11-09',
    end_date: '2023-11-12',
    available_seats: 30,
    description: 'عمرة نهاية الأسبوع - إقامة في فندق شيراتون - 4 نجوم',
    status: 'upcoming'
  },
];

// Mock Transportation Providers
export const mockTransportation = [
  {
    id: 'transport-1',
    name: 'شركة النجم الذهبي للنقل',
    contact: 'محمد العمري',
    phone: '+966512345678',
    email: 'info@goldstar-transport.com',
    fleetSize: 25,
    available: true
  },
  {
    id: 'transport-2',
    name: 'شركة الشريف للنقل والمواصلات',
    contact: 'عبدالله الشريف',
    phone: '+966523456789',
    email: 'info@sharif-transport.com',
    fleetSize: 40,
    available: true
  },
  {
    id: 'transport-3',
    name: 'المهيدب للنقل السياحي',
    contact: 'خالد المهيدب',
    phone: '+966534567890',
    email: 'info@muhaydib-tourism.com',
    fleetSize: 15,
    available: false
  }
];

// Mock Passport Details
const mockPassportDetails = [
  {
    passportNumber: 'A12345678',
    name: 'محمد أحمد علي',
    nationality: 'Saudi Arabia',
    birthDate: '1980-05-15',
    expiryDate: '2028-05-14'
  },
  {
    passportNumber: 'B87654321',
    name: 'فاطمة محمد عبدالله',
    nationality: 'Saudi Arabia',
    birthDate: '1985-09-23',
    expiryDate: '2029-09-22'
  },
  {
    passportNumber: 'C45678901',
    name: 'خالد عبدالعزيز محمد',
    nationality: 'Saudi Arabia',
    birthDate: '1976-03-10',
    expiryDate: '2027-03-09'
  }
];

// Mock Booking Data
export const mockBookings = [
  {
    id: 'booking-1',
    campaignId: 'campaign-1',
    userId: 'user-1',
    userName: 'عبدالرحمن محمد',
    userEmail: 'abdulrahman@example.com',
    userPhone: '+966512345678',
    bookedAt: '2023-02-15T10:30:00Z',
    status: 'approved',
    numberOfPilgrims: 2,
    totalAmount: 10000,
    paymentStatus: 'paid',
    passportDetails: [mockPassportDetails[0], mockPassportDetails[1]],
    notes: ''
  },
  {
    id: 'booking-2',
    campaignId: 'campaign-1',
    userId: 'user-2',
    userName: 'سارة أحمد',
    userEmail: 'sarah@example.com',
    userPhone: '+966523456789',
    bookedAt: '2023-02-20T14:15:00Z',
    status: 'pending',
    numberOfPilgrims: 1,
    totalAmount: 5000,
    paymentStatus: 'pending',
    passportDetails: [mockPassportDetails[1]],
    notes: ''
  },
  {
    id: 'booking-3',
    campaignId: 'campaign-2',
    userId: 'user-3',
    userName: 'خالد عبدالله',
    userEmail: 'khalid@example.com',
    userPhone: '+966534567890',
    bookedAt: '2023-05-05T09:20:00Z',
    status: 'pending',
    numberOfPilgrims: 3,
    totalAmount: 12600,
    paymentStatus: 'partial',
    passportDetails: [mockPassportDetails[0], mockPassportDetails[1], mockPassportDetails[2]],
    notes: 'يرجى الإقامة في الطابق الأرضي إن أمكن'
  },
  {
    id: 'booking-4',
    campaignId: 'campaign-1',
    userId: 'user-4',
    userName: 'فاطمة محمد',
    userEmail: 'fatima@example.com',
    userPhone: '+966545678901',
    bookedAt: '2023-02-18T16:45:00Z',
    status: 'rejected',
    numberOfPilgrims: 2,
    totalAmount: 10000,
    paymentStatus: 'refunded',
    passportDetails: [mockPassportDetails[1], mockPassportDetails[2]],
    notes: 'تم رفض الحجز بسبب عدم استكمال الوثائق المطلوبة'
  },
  {
    id: 'booking-5',
    campaignId: 'campaign-3',
    userId: 'user-5',
    userName: 'أحمد علي',
    userEmail: 'ahmed@example.com',
    userPhone: '+966556789012',
    bookedAt: '2023-01-25T11:10:00Z',
    status: 'completed',
    numberOfPilgrims: 4,
    totalAmount: 14000,
    paymentStatus: 'paid',
    passportDetails: [mockPassportDetails[0], mockPassportDetails[1], mockPassportDetails[2], mockPassportDetails[0]],
    notes: ''
  },
  {
    id: 'booking-6',
    campaignId: 'campaign-2',
    userId: 'user-6',
    userName: 'نورة سعد',
    userEmail: 'noura@example.com',
    userPhone: '+966567890123',
    bookedAt: '2023-05-10T13:30:00Z',
    status: 'pending',
    numberOfPilgrims: 2,
    totalAmount: 8400,
    paymentStatus: 'pending',
    passportDetails: [mockPassportDetails[1], mockPassportDetails[2]],
    notes: ''
  },
  {
    id: 'booking-7',
    campaignId: 'campaign-1',
    userId: 'user-7',
    userName: 'محمد عبدالعزيز',
    userEmail: 'mohammad@example.com',
    userPhone: '+966578901234',
    bookedAt: '2023-02-22T15:20:00Z',
    status: 'approved',
    numberOfPilgrims: 1,
    totalAmount: 5000,
    paymentStatus: 'paid',
    passportDetails: [mockPassportDetails[0]],
    notes: ''
  },
  {
    id: 'booking-8',
    campaignId: 'campaign-4',
    userId: 'user-8',
    userName: 'عبدالله سالم',
    userEmail: 'abdullah@example.com',
    userPhone: '+966589012345',
    bookedAt: '2023-10-15T10:05:00Z',
    status: 'pending',
    numberOfPilgrims: 2,
    totalAmount: 9600,
    paymentStatus: 'pending',
    passportDetails: [mockPassportDetails[0], mockPassportDetails[2]],
    notes: ''
  }
];

// Mock Payment Data
export const mockPayments = [
  {
    id: 'payment-1',
    bookingId: 'booking-1',
    amount: 10000,
    currency: 'ر.س',
    status: 'completed',
    method: 'credit_card',
    date: '2023-02-16T09:30:00Z',
    referenceNumber: 'PAY123456789',
    systemFee: 500,
    netAmount: 9500
  },
  {
    id: 'payment-2',
    bookingId: 'booking-3',
    amount: 6000,
    currency: 'ر.س',
    status: 'completed',
    method: 'bank_transfer',
    date: '2023-05-06T14:20:00Z',
    referenceNumber: 'PAY234567890',
    systemFee: 300,
    netAmount: 5700
  },
  {
    id: 'payment-3',
    bookingId: 'booking-4',
    amount: 10000,
    currency: 'ر.س',
    status: 'refunded',
    method: 'credit_card',
    date: '2023-02-19T11:45:00Z',
    referenceNumber: 'PAY345678901',
    systemFee: 0,
    netAmount: 0
  },
  {
    id: 'payment-4',
    bookingId: 'booking-5',
    amount: 14000,
    currency: 'ر.س',
    status: 'completed',
    method: 'cash',
    date: '2023-01-26T10:15:00Z',
    referenceNumber: 'PAY456789012',
    systemFee: 700,
    netAmount: 13300
  },
  {
    id: 'payment-5',
    bookingId: 'booking-7',
    amount: 5000,
    currency: 'ر.س',
    status: 'completed',
    method: 'credit_card',
    date: '2023-02-23T16:10:00Z',
    referenceNumber: 'PAY567890123',
    systemFee: 250,
    netAmount: 4750
  },
  {
    id: 'payment-6',
    bookingId: 'booking-3',
    amount: 6600,
    currency: 'ر.س',
    status: 'pending',
    method: 'bank_transfer',
    date: '2023-05-10T09:40:00Z',
    referenceNumber: 'PAY678901234',
    systemFee: 330,
    netAmount: 6270
  }
];

// Mock Payment Summary
export const mockPaymentSummary = {
  totalRevenue: 35000,
  totalSystemFees: 1750,
  totalNetAmount: 33250,
  pendingAmount: 24000
};

// Mock Subscription Packages
export const mockSubscriptionPackages = [
  {
    id: 'package-1',
    name: 'الباقة الأساسية',
    price: 1000,
    duration: 30, // days
    features: [
      'إدراج المكتب في نتائج البحث',
      'إمكانية إنشاء 3 حملات شهرياً',
      'دعم فني أساسي'
    ],
    isPopular: false
  },
  {
    id: 'package-2',
    name: 'الباقة المميزة',
    price: 3000,
    duration: 30,
    features: [
      'ظهور متقدم في نتائج البحث',
      'إمكانية إنشاء 10 حملات شهرياً',
      'دعم فني متقدم على مدار الساعة',
      'تقارير تحليلية شهرية'
    ],
    isPopular: true
  },
  {
    id: 'package-3',
    name: 'الباقة الذهبية',
    price: 5000,
    duration: 30,
    features: [
      'ظهور في الصفحة الرئيسية',
      'إمكانية إنشاء حملات غير محدودة',
      'دعم فني متميز على مدار الساعة',
      'تقارير تحليلية أسبوعية',
      'خدمة مدير حساب مخصص'
    ],
    isPopular: false
  }
]; 