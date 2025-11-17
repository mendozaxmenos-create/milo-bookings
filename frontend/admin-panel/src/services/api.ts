import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
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
    } catch (e) {
      // Ignore parse errors
    }
  }
  return config;
});

export interface LoginRequest {
  business_id: string;
  phone: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    business_id: string;
    phone: string;
    role: string;
  };
}

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export const register = async (data: LoginRequest & { role?: string }): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/register', data);
  return response.data;
};

export default api;

