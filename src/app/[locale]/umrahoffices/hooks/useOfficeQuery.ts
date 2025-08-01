import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

// مخطط التحقق من صحة بيانات مكتب العمرة
const OfficeSchema = z.object({
  id: z.string(),
  name: z.string(),
  licenseNumber: z.string(),
  rating: z.number().min(0).max(5),
  location: z.string(),
  address: z.string(),
  contactPerson: z.string(),
  email: z.string().email(),
  phone: z.string(),
  website: z.string().optional(),
  packages: z.array(z.string()),
  verified: z.boolean(),
  availableSeats: z.number().int().min(0),
  description: z.string(),
  createdAt: z.string(),
  status: z.enum(['active', 'inactive', 'pending', 'suspended'])
});

// مخطط التحقق من صحة بيانات الباقة
const PackageSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  duration: z.number().int().positive(),
  price: z.number().positive(),
  includes: z.array(z.string()),
  accommodationLevel: z.string(),
  transportation: z.string(),
  meals: z.string(),
  maxPersons: z.number().int().positive()
});

type Office = z.infer<typeof OfficeSchema>;
type OfficeList = Office[];
type UmrahPackage = z.infer<typeof PackageSchema>;
type PackageList = UmrahPackage[];

// دوال واجهة برمجة التطبيقات (ستقوم هذه الدوال بالاتصال بنقاط النهاية الفعلية الخاصة بك)
const fetchOffices = async (location?: string, verified?: boolean): Promise<OfficeList> => {
  let url = '/api/umrah-offices';
  const params = new URLSearchParams();
  
  if (location) params.append('location', location);
  if (verified !== undefined) params.append('verified', String(verified));
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch offices');
  }
  const data = await response.json();
  return OfficeSchema.array().parse(data);
};

const fetchOfficeById = async (id: string): Promise<Office> => {
  const response = await fetch(`/api/umrah-offices/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch office');
  }
  const data = await response.json();
  return OfficeSchema.parse(data);
};

const fetchPackagesByOfficeId = async (officeId: string): Promise<PackageList> => {
  const response = await fetch(`/api/umrah-offices/${officeId}/packages`);
  if (!response.ok) {
    throw new Error('Failed to fetch packages');
  }
  const data = await response.json();
  return PackageSchema.array().parse(data);
};

const createOffice = async (office: Omit<Office, 'id'>): Promise<Office> => {
  const response = await fetch('/api/umrah-offices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(office),
  });
  if (!response.ok) {
    throw new Error('Failed to create office');
  }
  const data = await response.json();
  return OfficeSchema.parse(data);
};

const updateOffice = async ({ id, ...updates }: Partial<Office> & { id: string }): Promise<Office> => {
  const response = await fetch(`/api/umrah-offices/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update office');
  }
  const data = await response.json();
  return OfficeSchema.parse(data);
};

// هوكس React Query
export function useOffices(location?: string, verified?: boolean) {
  return useQuery({
    queryKey: ['offices', { location, verified }],
    queryFn: () => fetchOffices(location, verified),
  });
}

export function useOffice(id: string) {
  return useQuery({
    queryKey: ['office', id],
    queryFn: () => fetchOfficeById(id),
    enabled: !!id, // يعمل فقط إذا تم توفير المعرف
  });
}

export function usePackagesByOffice(officeId: string) {
  return useQuery({
    queryKey: ['packages', officeId],
    queryFn: () => fetchPackagesByOfficeId(officeId),
    enabled: !!officeId, // يعمل فقط إذا تم توفير معرف المكتب
  });
}

export function useCreateOffice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOffice,
    onSuccess: () => {
      // إبطال صلاحية استعلام قائمة المكاتب لإعادة الجلب
      queryClient.invalidateQueries({ queryKey: ['offices'] });
    },
  });
}

export function useUpdateOffice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateOffice,
    onSuccess: (updatedOffice) => {
      // تحديث ذاكرة التخزين المؤقت للمكتب الفردي
      queryClient.setQueryData(['office', updatedOffice.id], updatedOffice);
      // إبطال صلاحية استعلام قائمة المكاتب لإعادة الجلب
      queryClient.invalidateQueries({ queryKey: ['offices'] });
    },
  });
}

export function useTopRatedOffices() {
  return useQuery({
    queryKey: ['offices', 'topRated'],
    queryFn: async () => {
      const response = await fetch('/api/umrah-offices/top-rated');
      if (!response.ok) {
        throw new Error('Failed to fetch top rated offices');
      }
      const data = await response.json();
      return OfficeSchema.array().parse(data);
    },
  });
} 