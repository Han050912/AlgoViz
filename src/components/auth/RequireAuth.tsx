import { useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

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
