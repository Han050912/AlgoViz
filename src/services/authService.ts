import api from './api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  TokenResponse,
  UserResponse,
  ResetPasswordRequest,
  APIResponse,
} from '@/types/auth';

export const authService = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post('/auth/login', data).then(r => r.data),

  register: (data: RegisterRequest): Promise<RegisterResponse> =>
    api.post('/auth/register', data).then(r => r.data),

  refreshToken: (refreshToken: string): Promise<TokenResponse> =>
    api.post('/auth/refresh', { refresh_token: refreshToken }).then(r => r.data),

  getMe: (): Promise<UserResponse> =>
    api.get('/auth/me').then(r => r.data),

  sendResetCode: (email: string): Promise<APIResponse> =>
    api.post('/auth/send-reset-code', { email }).then(r => r.data),

  resetPassword: (data: ResetPasswordRequest): Promise<APIResponse> =>
    api.post('/auth/reset-password', data).then(r => r.data),
};
