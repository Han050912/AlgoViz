import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * RequireAuth — 路由守卫组件（P1-8）。
 * 仅当存在未过期的 access_token 时渲染子路由，否则跳转登录页。
 */
function getStoredToken(): string | null {
  return (
    localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
  );
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1];
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    if (!decoded.exp) return false;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    const valid = !!token && !isTokenExpired(token);
    setAuthorized(valid);
    setReady(true);
    if (!valid) {
      // 清理无效 token，避免长期滞留
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');
    }
  }, []);

  if (!ready) return null;

  if (!authorized) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
