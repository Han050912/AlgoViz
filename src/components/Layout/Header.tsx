import { useNavigate, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import {
  SettingOutlined,
  HistoryOutlined,
  CodeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import Logo from '@/components/common/Logo';

const navItems = [
  { key: '/workspace', label: '工作台', icon: <CodeOutlined /> },
  { key: '/history', label: '历史记录', icon: <HistoryOutlined /> },
  { key: '/settings', label: '设置', icon: <SettingOutlined /> },
];

/**
 * Header — 透明顶栏（56px），Logo + 导航 + 用户菜单
 */
const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header
      className="flex items-center justify-between px-6 select-none"
      style={{
        height: 56,
        background: 'transparent',
        borderBottom: 'none',
      }}
    >
      {/* 左侧：Logo + 导航 */}
      <div className="flex items-center gap-8">
        <div
          className="cursor-pointer"
          onClick={() => navigate('/workspace')}
        >
          <Logo />
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded transition-colors"
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: isActive(item.key)
                  ? 'var(--color-brand-gold)'
                  : 'var(--color-text-secondary)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderBottom: isActive(item.key)
                  ? '2px solid var(--color-brand-gold)'
                  : '2px solid transparent',
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* 右侧：用户 */}
      <Tooltip title="用户">
        <div
          className="flex items-center justify-center rounded-full cursor-pointer transition-colors"
          style={{
            width: 32,
            height: 32,
            border: '1.5px solid var(--color-brand-gold)',
            color: 'var(--color-text-tertiary)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#F9FAFB';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#9CA3AF';
          }}
        >
          <UserOutlined style={{ fontSize: 14 }} />
        </div>
      </Tooltip>
    </header>
  );
};

export default Header;
