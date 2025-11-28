import axios from 'axios';

// Obtener URL del backend desde variables de entorno o usar relativa
const getApiBaseURL = () => {
  // En producción, usar variable de entorno
  if (import.meta.env.VITE_API_URL) {
    console.log('[API] Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // En desarrollo, usar proxy relativo
  if (import.meta.env.DEV) {
    console.log('[API] Development mode: using /api proxy');
    return '/api';
  }
  
  // Fallback: en producción sin variable, usar Render backend
  const fallbackURL = 'https://milo-bookings.onrender.com';
  console.warn('[API] ⚠️ VITE_API_URL not set! Using fallback:', fallbackURL);
  console.warn('[API] Please configure VITE_API_URL in Vercel environment variables');
  return fallbackURL;
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth-storage');
  if (token) {
    try {
      const parsed = JSON.parse(token);
      if (parsed.state?.token) {
        config.headers.Authorization = `Bearer ${parsed.state.token}`;
      }
      
      // Si el usuario es super admin y estamos viendo un negocio específico,
      // agregar el business_id como header
      const user = parsed.state?.user;
      if (user?.is_system_user && user?.role === 'super_admin') {
        // Extraer businessId de la URL actual si estamos en la ruta de vista
        const currentPath = window.location.pathname;
        const match = currentPath.match(/\/admin\/businesses\/([^/]+)\/view/);
        if (match && match[1]) {
          const businessId = match[1];
          config.headers['X-Business-Id'] = businessId;
          console.log('[API] Super admin viewing business, adding header:', {
            path: currentPath,
            businessId,
            url: config.url,
          });
        }
      }
    } catch {
      // Ignore parse errors from stale storage entries
    }
  }
  return config;
});

export interface LoginRequest {
  business_id?: string;
  phone?: string;
  email?: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    business_id: string;
    phone: string;
    role: string;
    is_system_user?: boolean;
  };
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/api/auth/login', data);
  return response.data;
};

export const register = async (data: LoginRequest & { role?: string }): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/api/auth/register', data);
  return response.data;
};

export default api;

export interface PaymentConfigResponse {
  data: {
    publicKey: string;
    source: 'business' | 'env';
  } | null;
}

export interface UpdatePaymentConfigRequest {
  accessToken: string;
  publicKey: string;
  refreshToken?: string;
  userId?: string;
  isActive?: boolean;
}

export const getPaymentConfig = async (): Promise<PaymentConfigResponse> => {
  const response = await api.get<PaymentConfigResponse>('/api/payments/config');
  return response.data;
};

export const updatePaymentConfig = async (payload: UpdatePaymentConfigRequest): Promise<PaymentConfigResponse> => {
  const response = await api.put<PaymentConfigResponse>('/api/payments/config', payload);
  return response.data;
};

// Admin API
export interface Business {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp_number: string;
  owner_phone: string;
  is_active: boolean;
  is_trial?: boolean;
  trial_start_date?: string;
  trial_end_date?: string;
  bot_status?: string;
  has_qr?: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessListResponse {
  data: Business[];
}

export interface BusinessResponse {
  data: Business & {
    bot_info?: {
      wid?: string;
      pushname?: string;
      platform?: string;
    };
    qr?: string | null;
  };
}

export interface CreateBusinessRequest {
  name: string;
  phone: string;
  email?: string;
  whatsapp_number: string;
  owner_phone: string;
  is_active?: boolean;
  is_trial?: boolean;
}

export const getBusinesses = async (): Promise<BusinessListResponse> => {
  const response = await api.get<BusinessListResponse>('/api/admin/businesses');
  return response.data;
};

export const getBusiness = async (id: string): Promise<BusinessResponse> => {
  const response = await api.get<BusinessResponse>(`/api/admin/businesses/${id}`);
  return response.data;
};

export const createBusiness = async (data: CreateBusinessRequest): Promise<BusinessResponse> => {
  const response = await api.post<BusinessResponse>('/api/admin/businesses', data);
  return response.data;
};

export const updateBusiness = async (id: string, data: Partial<CreateBusinessRequest>): Promise<BusinessResponse> => {
  const response = await api.put<BusinessResponse>(`/api/admin/businesses/${id}`, data);
  return response.data;
};

export const deleteBusiness = async (id: string): Promise<void> => {
  await api.delete(`/api/admin/businesses/${id}`);
};

export const activateBusiness = async (id: string): Promise<void> => {
  await api.post(`/api/admin/businesses/${id}/activate`);
};

export const getBusinessQR = async (id: string): Promise<{ data: { qr: string; status: string } }> => {
  const response = await api.get<{ data: { qr: string; status: string } }>(`/api/admin/businesses/${id}/qr`);
  return response.data;
};

export const reconnectBusinessBot = async (id: string): Promise<void> => {
  await api.post(`/api/admin/businesses/${id}/reconnect-bot`);
};

// System Config API
export interface SubscriptionPriceResponse {
  data: {
    price: string;
  };
}

export const getSubscriptionPrice = async (): Promise<SubscriptionPriceResponse> => {
  const response = await api.get<SubscriptionPriceResponse>('/api/admin/config/subscription-price');
  return response.data;
};

export const updateSubscriptionPrice = async (price: string): Promise<SubscriptionPriceResponse> => {
  const response = await api.put<SubscriptionPriceResponse>('/api/admin/config/subscription-price', { price });
  return response.data;
};

export interface MigrateShortlinksResponse {
  message: string;
  results: Array<{
    shortlink: string;
    business_id?: string;
    status: 'success' | 'error';
    error?: string;
  }>;
}

export const migrateShortlinksToBusinesses = async (): Promise<MigrateShortlinksResponse> => {
  const response = await api.post<MigrateShortlinksResponse>('/api/admin/migrate-shortlinks-to-businesses');
  return response.data;
};

// Shortlinks API
export interface Shortlink {
  slug: string;
  name: string;
  url: string;
  business_id?: string;
  created_at?: string;
  updated_at?: string;
  usage_count?: number;
}

export interface ShortlinksResponse {
  shortlinks: Shortlink[];
}

export interface CreateShortlinkRequest {
  name: string;
  slug: string;
  businessId?: string;
  settings?: any;
}

export interface CreateShortlinkResponse {
  slug: string;
  name: string;
  url: string;
  business_id?: string;
  created_at?: string;
  updated_at?: string;
  usage_count?: number;
}

export const getShortlinks = async (): Promise<ShortlinksResponse> => {
  const response = await api.get<ShortlinksResponse>('/api/shortlinks');
  return response.data;
};

export const createShortlink = async (data: CreateShortlinkRequest): Promise<CreateShortlinkResponse> => {
  const response = await api.post<CreateShortlinkResponse>('/api/shortlinks', data);
  return response.data;
};

