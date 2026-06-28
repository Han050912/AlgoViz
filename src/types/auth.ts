// ---- 通用 ----
export interface APIResponse<T = null> {
  code: number;
  message: string;
  data: T;
}

export interface User {
  id: string;
  email: string;
  nickname: string | null;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
}

// ---- 登录 ----
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  message: string;
  data: { user: User } & TokenPair;
}

// ---- 注册 ----
export interface RegisterRequest {
  email: string;
  password: string;
  nickname?: string;
}

export type RegisterResponse = LoginResponse;

// ---- Token 刷新 ----
export interface TokenResponse {
  code: number;
  message: string;
  data: TokenPair;
}

// ---- 忘记密码 ----
export interface ResetPasswordRequest {
  email: string;
  verification_code: string;
  new_password: string;
  confirm_password: string;
}

// ---- 获取当前用户 ----
export interface UserResponse {
  code: number;
  message: string;
  data: { user: User };
}
