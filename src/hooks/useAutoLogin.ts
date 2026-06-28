import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * useAutoLogin — 认证页加载时检查有效 token，存在则自动跳转 /workspace
 */
const useAutoLogin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem('access_token') ||
      sessionStorage.getItem('access_token');
    if (token) {
      navigate('/workspace', { replace: true });
    }
  }, [navigate]);
};

export default useAutoLogin;
