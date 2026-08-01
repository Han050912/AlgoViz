import axios from 'axios';

// 运行时解析 API 基地址：优先环境变量，其次同源（部署到同域时无需跨域），最后回退 localhost。
function resolveBaseURL(): string {
  const env = import.meta.env.VITE_API_BASE_URL;
  if (env) return env;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // 生产环境：前端与后端同域部署，API 走同源 /api/v1
    return window.location.origin + '/api/v1';
  }
  return 'http://localhost:8000/api/v1';
}

const api = axios.create({
  baseURL: resolveBaseURL(),
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
          // refresh 也失败 -> 清空 token，由各页面自行处理
        }
      }
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }
    return Promise.reject(error);
  }
);

export default api;


