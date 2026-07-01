import api from './api';
import type {
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  APIResponse,
} from '@/types/auth';

export const authService = {
  login: (data: LoginRequest): Promise<{ user: { id: string; email: string; nickname: string | null } } & { access_token: string; refresh_token: string; token_type: 'bearer' }> =>
    api.post('/auth/login', data).then(r => r.data),

  register: (data: RegisterRequest): Promise<{ user: { id: string; email: string; nickname: string | null } } & { access_token: string; refresh_token: string; token_type: 'bearer' }> =>
    api.post('/auth/register', data).then(r => r.data),

  refreshToken: (refreshToken: string): Promise<{ access_token: string; refresh_token: string; token_type: 'bearer' }> =>
    api.post('/auth/refresh', { refresh_token: refreshToken }).then(r => r.data),

  getMe: (): Promise<{ user: { id: string; email: string; nickname: string | null } }> =>
    api.get('/auth/me').then(r => r.data),

  sendResetCode: (email: string): Promise<APIResponse> =>
    api.post('/auth/send-reset-code', { email }).then(r => r.data),

  resetPassword: (data: ResetPasswordRequest): Promise<APIResponse> =>
    api.post('/auth/reset-password', data).then(r => r.data),
};
