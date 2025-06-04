import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Office, Package, Campaign, Bus, OfficeWithPackages } from '../types';

// Mock data
const mockOffices: Office[] = [
  {
    id: 1,
    user_id: 1,
    office_name: "مكتب الرحمة للعمرة",
    address: "مكة المكرمة، حي العزيزية",
    contact_number: "+966 55 123 4567",
    logo: "/images/rahme.jpeg", // Fixed URL format
    license_document: "ترخيص رقم 12345",
    status: "active",
    rating: 4.8,
    description: "مكتب متخصص في تقديم خدمات العمرة بأعلى مستويات الجودة وبأسعار مناسبة للجميع"
  },
  {
    id: 2,
    user_id: 2,
    office_name: "مكتب النور للخدمات",
    address: "المدينة المنورة، المنطقة المركزية",
    contact_number: "+966 55 765 4321",
    logo: "/images/nor.jpeg",
    license_document: "ترخيص رقم 12346",
    status: "active",
    rating: 4.5
  },
  {
    id: 1,
    user_id: 1,
    office_name: "مكتب الرحمة للعمرة",
    address: "مكة المكرمة، حي العزيزية",
    contact_number: "+966 55 123 4567",
    logo: "/images/rahme.jpeg", // Fixed URL format
    license_document: "ترخيص رقم 12345",
    status: "active",
    rating: 4.8,
    description: "مكتب متخصص في تقديم خدمات العمرة بأعلى مستويات الجودة وبأسعار مناسبة للجميع"
  },
  {
    id: 2,
    user_id: 2,
    office_name: "مكتب النور للخدمات",
    address: "المدينة المنورة، المنطقة المركزية",
    contact_number: "+966 55 765 4321",
    logo: "/images/nor.jpeg",
    license_document: "ترخيص رقم 12346",
    status: "active",
    rating: 4.5
  },
  {
    id: 1,
    user_id: 1,
    office_name: "مكتب الرحمة للعمرة",
    address: "مكة المكرمة، حي العزيزية",
    contact_number: "+966 55 123 4567",
    logo: "/images/rahme.jpeg", // Fixed URL format
    license_document: "ترخيص رقم 12345",
    status: "active",
    rating: 4.8,
    description: "مكتب متخصص في تقديم خدمات العمرة بأعلى مستويات الجودة وبأسعار مناسبة للجميع"
  },
  {
    id: 2,
    user_id: 2,
    office_name: "مكتب النور للخدمات",
    address: "المدينة المنورة، المنطقة المركزية",
    contact_number: "+966 55 765 4321",
    logo: "/images/nor.jpeg",
    license_document: "ترخيص رقم 12346",
    status: "active",
    rating: 4.5
  }
];

const mockPackages: Package[] = [
  {
    id: 201,
    name: "الباقة الذهبية",
    price: 6500,
    includes: [
      "إقامة في فندق 5 نجوم",
      "وجبات كاملة",
      "زيارة المدينة المنورة",
      "مرشد ديني متخصص"
    ]
  },
  {
    id: 202,
    name: "الباقة الفضية",
    price: 4500,
    includes: [
      "إقامة في فندق 4 نجوم",
      "وجبة إفطار",
      "زيارة المدينة المنورة"
    ]
  },
  {
    id: 203,
    name: "باقة رمضان الشاملة",
    price: 7500,
    includes: [
      "إقامة في فندق 5 نجوم قريب من الحرم",
      "وجبات إفطار وسحور",
      "زيارة المدينة المنورة",
      "مرشد ديني متخصص"
    ]
  }
];

const mockBuses: Bus[] = [
  {
    id: 301,
    model: "مرسيدس ترافيجو",
    year: 2024,
    capacity: 45,
    condition: "ممتازة"
  },
  {
    id: 302,
    model: "كينج لونج",
    year: 2023,
    capacity: 50,
    condition: "ممتازة"
  }
];

const mockCampaigns: Campaign[] = [
  {
    id: 101,
    description: "رحلة العمرة الشاملة",
    start_date: "2025-04-15",
    end_date: "2025-04-25",
    available_seats: 30,
    status: "active",
    packages: [mockPackages[0], mockPackages[1]],
    buses: [mockBuses[0]]
  },
  {
    id: 102,
    description: "عمرة شهر رمضان",
    start_date: "2025-05-10",
    end_date: "2025-05-20",
    available_seats: 25,
    status: "active",
    packages: [mockPackages[2]],
    buses: [mockBuses[1]]
  }
];

export const officesApi = createApi({
  reducerPath: 'officesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }),
  endpoints: (builder) => ({
    getOffices: builder.query<OfficeWithPackages[], void>({
      queryFn: () => {
        const officesWithData = mockOffices.map(office => ({
          ...office,
          campaigns: mockCampaigns,
          packages: mockPackages
        }));
        return { data: officesWithData };
      }
    })
  })
});

export const {
  useGetOfficesQuery
} = officesApi;