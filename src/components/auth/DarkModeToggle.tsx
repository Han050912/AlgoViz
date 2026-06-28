import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useAuthContext } from './AuthLayout';

/**
 * DarkModeToggle — 深色模式切换按钮
 * 暗色模式：SunOutlined / 亮色模式：MoonOutlined
 */
const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useAuthContext();

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center justify-center rounded transition-colors"
      style={{
        width: 36,
        height: 36,
        background: 'transparent',
        border: 'none',
        color: isDarkMode ? '#D1D5DB' : '#666666',
        cursor: 'pointer',
        fontSize: 18,
      }}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? <SunOutlined /> : <MoonOutlined />}
    </button>
  );
};

export default DarkModeToggle;
