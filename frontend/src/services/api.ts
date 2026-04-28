import axios from 'axios';

const API_BASE_URL = 'http://localhost:5220/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface RegisterData {
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  expiresAt: string;
}

export interface ProfileData {
  userId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface UpdateProfileData {
  fullName: string;
  phoneNumber?: string;
  address?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface Vehicle {
  vehicleId: number;
  vehicleNumber: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  createdAt: string;
}

export interface CreateVehicleData {
  vehicleNumber: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
}

export interface UpdateVehicleData {
  vehicleNumber: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
}

export const authApi = {
  register: (data: RegisterData) => 
    api.post<LoginResponse>('/customer/auth/register', data),
  
  login: (data: LoginData) => 
    api.post<LoginResponse>('/customer/auth/login', data),
};

export const profileApi = {
  getProfile: () => 
    api.get<ProfileData>('/customer/profile'),
  
  updateProfile: (data: UpdateProfileData) => 
    api.put<ProfileData>('/customer/profile', data),
  
  changePassword: (data: ChangePasswordData) => 
    api.post('/customer/profile/change-password', data),
};

export const vehicleApi = {
  getVehicles: () => 
    api.get<Vehicle[]>('/customer/vehicles'),
  
  getVehicle: (id: number) => 
    api.get<Vehicle>(`/customer/vehicles/${id}`),
  
  createVehicle: (data: CreateVehicleData) => 
    api.post<Vehicle>('/customer/vehicles', data),
  
  updateVehicle: (id: number, data: UpdateVehicleData) => 
    api.put<Vehicle>(`/customer/vehicles/${id}`, data),
  
  deleteVehicle: (id: number) => 
    api.delete(`/customer/vehicles/${id}`),
};

export default api;
