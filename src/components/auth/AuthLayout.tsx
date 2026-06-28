import { createContext, useContext, useState, useEffect } from 'react';
import LeftPanel from './LeftPanel';
import DarkModeToggle from './DarkModeToggle';

interface AuthContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * AuthLayout — 认证页 65/35 分栏布局容器
 * 左侧品牌展示区 + 右侧表单面板
 * 响应式：< 768px 变为上下布局
 */
const AuthLayout = ({ children }: AuthLayoutProps) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('algoviz-dark-mode');
    return stored !== null ? stored === 'true' : false;
  });

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('algoviz-dark-mode', String(next));
  };

  useEffect(() => {
    document.documentElement.setAttribute(
      'data-theme',
      isDarkMode ? 'dark' : 'light'
    );
  }, [isDarkMode]);

  return (
    <AuthContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* 左侧品牌区 65% */}
        <div
          className="hidden md:flex relative"
          style={{ width: '65%' }}
        >
          <LeftPanel />
        </div>

        {/* 移动端左侧品牌区 */}
        <div
          className="flex md:hidden relative"
          style={{ height: '40vh', width: '100%' }}
        >
          <LeftPanel />
        </div>

        {/* 右侧表单区 35% */}
        <div
          className="flex flex-col items-center justify-center relative md:w-[35%] w-full"
          style={{
            background: isDarkMode
              ? 'var(--color-auth-bg-right-dark)'
              : 'var(--color-auth-bg-right)',
            overflowY: 'auto',
          }}
        >
          {/* 暗色模式切换 */}
          <div className="absolute top-4 right-4">
            <DarkModeToggle />
          </div>

          {/* 表单内容：入场动画 */}
          <div
            className="animate-fade-in-up w-full px-6"
            style={{ maxWidth: 420 }}
          >
            {children}
          </div>
        </div>
      </div>
    </AuthContext.Provider>
  );
};

export default AuthLayout;
