import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// 请求拦截器：自动附加 access_token
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

// 响应拦截器：401 -> 尝试 refresh_token -> 失败则跳转 /login
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken =
        localStorage.getItem('refresh_token') ||
        sessionStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            (api.defaults.baseURL ?? '') + '/auth/refresh',
            { refresh_token: refreshToken }
          );
          const store = localStorage.getItem('refresh_token')
            ? localStorage
            : sessionStorage;
          store.setItem('access_token', data.data.access_token);
          store.setItem('refresh_token', data.data.refresh_token);
          error.config.headers.Authorization = 'Bearer ' + data.data.access_token;
          return api(error.config);
        } catch {
          // refresh 也失败 -> 清空 token 跳转登录
        }
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
