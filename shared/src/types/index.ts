// Business Types
export interface Business {
  id: string;
  name: string;
  phone: string;
  email?: string;
  whatsapp_number: string;
  owner_phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// User Types
export interface BusinessUser {
  id: string;
  business_id: string;
  phone: string;
  role: 'owner' | 'admin' | 'staff';
  created_at: string;
  updated_at: string;
}

// Service Types
export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Booking Types
export interface Booking {
  id: string;
  business_id: string;
  service_id: string;
  customer_phone: string;
  customer_name?: string;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:mm
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_id?: string;
  amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Availability Types
export interface AvailabilitySlot {
  id: string;
  business_id: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  is_available: boolean;
  is_blocked: boolean;
  service_id?: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<BusinessUser, 'password_hash'>;
}

