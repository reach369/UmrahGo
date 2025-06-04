import { Booking } from "../redux/api/bookingsApiSlice";

// Mock Passport Details for UI display
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

// Additional mock passport details for more variety
const extraPassportDetails = [
  {
    passportNumber: 'D98765432',
    name: 'عمر سعيد الحربي',
    nationality: 'Saudi Arabia',
    birthDate: '1990-08-20',
    expiryDate: '2030-08-19'
  },
  {
    passportNumber: 'E56789012',
    name: 'نورة عبدالله القحطاني',
    nationality: 'Saudi Arabia',
    birthDate: '1988-12-05',
    expiryDate: '2028-12-04'
  },
  {
    passportNumber: 'F34567890',
    name: 'سلطان محمد العتيبي',
    nationality: 'Saudi Arabia',
    birthDate: '1982-04-25',
    expiryDate: '2027-04-24'
  }
];

// Mock Bookings Data following the schema
export const mockBookingsData: Booking[] = [
  {
    id: 'booking-1',
    userId: 'user-1',
    busId: 'bus-1',
    campaignId: 'campaign-1',
    bookingDate: '2023-03-15',
    totalPrice: 10000,
    status: 'confirmed',
    paymentStatus: 'paid',
    commission: 500,
    notes: 'يرجى توفير وجبات خاصة',
    createdAt: '2023-02-15T10:30:00Z',
    updatedAt: '2023-02-15T10:30:00Z',
    deletedAt: null,
    // Additional UI fields
    userName: 'عبدالرحمن محمد',
    userEmail: 'abdulrahman@example.com',
    userPhone: '+966512345678',
    numberOfPilgrims: 2,
    passportDetails: [mockPassportDetails[0], mockPassportDetails[1]]
  },
  {
    id: 'booking-2',
    userId: 'user-2',
    busId: null,
    campaignId: 'campaign-1',
    bookingDate: '2023-03-20',
    totalPrice: 5000,
    status: 'pending',
    paymentStatus: 'pending',
    commission: 250,
    notes: '',
    createdAt: '2023-02-20T14:15:00Z',
    updatedAt: '2023-02-20T14:15:00Z',
    deletedAt: null,
    // Additional UI fields
    userName: 'سارة أحمد',
    userEmail: 'sarah@example.com',
    userPhone: '+966523456789',
    numberOfPilgrims: 1,
    passportDetails: [mockPassportDetails[1]]
  },
  {
    id: 'booking-3',
    userId: 'user-3',
    busId: 'bus-2',
    campaignId: 'campaign-2',
    bookingDate: '2023-07-25',
    totalPrice: 12600,
    status: 'pending',
    paymentStatus: 'pending',
    commission: 630,
    notes: 'يرجى الإقامة في الطابق الأرضي إن أمكن',
    createdAt: '2023-05-05T09:20:00Z',
    updatedAt: '2023-05-05T09:20:00Z',
    deletedAt: null,
    // Additional UI fields
    userName: 'خالد عبدالله',
    userEmail: 'khalid@example.com',
    userPhone: '+966534567890',
    numberOfPilgrims: 3,
    passportDetails: [mockPassportDetails[0], mockPassportDetails[1], mockPassportDetails[2]]
  },
  {
    id: 'booking-4',
    userId: 'user-4',
    busId: null,
    campaignId: 'campaign-1',
    bookingDate: '2023-03-25',
    totalPrice: 10000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    commission: 0,
    notes: 'تم إلغاء الحجز بسبب عدم استكمال الوثائق المطلوبة',
    createdAt: '2023-02-18T16:45:00Z',
    updatedAt: '2023-02-18T18:30:00Z',
    deletedAt: '2023-02-19T10:00:00Z',
    // Additional UI fields
    userName: 'فاطمة محمد',
    userEmail: 'fatima@example.com',
    userPhone: '+966545678901',
    numberOfPilgrims: 2,
    passportDetails: [mockPassportDetails[1], mockPassportDetails[2]]
  },
  {
    id: 'booking-5',
    userId: 'user-5',
    busId: 'bus-3',
    campaignId: 'campaign-3',
    bookingDate: '2023-02-10',
    totalPrice: 14000,
    status: 'confirmed',
    paymentStatus: 'paid',
    commission: 700,
    notes: '',
    createdAt: '2023-01-25T11:10:00Z',
    updatedAt: '2023-01-26T09:35:00Z',
    deletedAt: null,
    // Additional UI fields
    userName: 'أحمد علي',
    userEmail: 'ahmed@example.com',
    userPhone: '+966556789012',
    numberOfPilgrims: 4,
    passportDetails: [mockPassportDetails[0], mockPassportDetails[1], mockPassportDetails[2], extraPassportDetails[0]]
  },
  {
    id: 'booking-6',
    userId: 'user-6',
    busId: 'bus-2',
    campaignId: 'campaign-2',
    bookingDate: '2023-07-15',
    totalPrice: 8400,
    status: 'pending',
    paymentStatus: 'pending',
    commission: 420,
    notes: '',
    createdAt: '2023-05-10T13:30:00Z',
    updatedAt: '2023-05-10T13:30:00Z',
    deletedAt: null,
    // Additional UI fields
    userName: 'نورة سعد',
    userEmail: 'noura@example.com',
    userPhone: '+966567890123',
    numberOfPilgrims: 2,
    passportDetails: [mockPassportDetails[1], mockPassportDetails[2]]
  },
  {
    id: 'booking-7',
    userId: 'user-7',
    busId: 'bus-1',
    campaignId: 'campaign-1',
    bookingDate: '2023-03-15',
    totalPrice: 5000,
    status: 'confirmed',
    paymentStatus: 'paid',
    commission: 250,
    notes: '',
    createdAt: '2023-02-22T15:20:00Z',
    updatedAt: '2023-02-22T16:45:00Z',
    deletedAt: null,
    // Additional UI fields
    userName: 'محمد عبدالعزيز',
    userEmail: 'mohammad@example.com',
    userPhone: '+966578901234',
    numberOfPilgrims: 1,
    passportDetails: [mockPassportDetails[0]]
  },
  {
    id: 'booking-8',
    userId: 'user-8',
    busId: null,
    campaignId: 'campaign-4',
    bookingDate: '2023-12-20',
    totalPrice: 9600,
    status: 'pending',
    paymentStatus: 'pending',
    commission: 480,
    notes: '',
    createdAt: '2023-10-15T10:05:00Z',
    updatedAt: '2023-10-15T10:05:00Z',
    deletedAt: null,
    // Additional UI fields
    userName: 'عبدالله سالم',
    userEmail: 'abdullah@example.com',
    userPhone: '+966589012345',
    numberOfPilgrims: 2,
    passportDetails: [mockPassportDetails[0], mockPassportDetails[2]]
  },
  {
    id: 'booking-9',
    userId: 'user-9',
    busId: 'bus-4',
    campaignId: 'campaign-1',
    bookingDate: '2023-04-05',
    totalPrice: 7500,
    status: 'pending',
    paymentStatus: 'pending',
    commission: 375,
    notes: 'حجز جديد - يرجى توفير خدمة النقل من المطار',
    createdAt: '2023-03-25T08:45:00Z',
    updatedAt: '2023-03-25T08:45:00Z',
    deletedAt: null,
    // Additional UI fields
    userName: 'هاني عبدالرحمن',
    userEmail: 'hani@example.com',
    userPhone: '+966512987654',
    numberOfPilgrims: 2,
    passportDetails: [extraPassportDetails[0], extraPassportDetails[1]]
  },
  {
    id: 'booking-10',
    userId: 'user-10',
    busId: 'bus-2',
    campaignId: 'campaign-3',
    bookingDate: '2023-02-15',
    totalPrice: 11200,
    status: 'confirmed',
    paymentStatus: 'paid',
    commission: 560,
    notes: '',
    createdAt: '2023-01-20T16:30:00Z',
    updatedAt: '2023-01-21T09:15:00Z',
    deletedAt: null,
    // Additional UI fields
    userName: 'مريم العوفي',
    userEmail: 'mariam@example.com',
    userPhone: '+966576543210',
    numberOfPilgrims: 3,
    passportDetails: [extraPassportDetails[1], extraPassportDetails[2], mockPassportDetails[0]]
  }
]; 