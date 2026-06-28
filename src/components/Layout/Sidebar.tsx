import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'antd';
import {
  FolderOpenOutlined,
  PlusOutlined,
  AppstoreOutlined,
  StarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

/**
 * Sidebar — 项目列表侧边栏（240px，支持折叠到 48px）
 */
const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const navigate = useNavigate();

  const width = collapsed ? 48 : 240;

  const projects = [
    { id: '1', name: '冒泡排序分析' },
    { id: '2', name: '快速排序分析' },
    { id: '3', name: '二分查找分析' },
  ];

  const sections = [
    {
      label: '我的项目',
      icon: <FolderOpenOutlined />,
      items: projects.map((p) => ({
        key: p.id,
        label: p.name,
        icon: <StarOutlined style={{ fontSize: 12 }} />,
      })),
    },
    {
      label: '模板库',
      icon: <AppstoreOutlined />,
      items: [
        { key: 'sort-tpl', label: '排序算法', icon: null },
        { key: 'search-tpl', label: '查找算法', icon: null },
        { key: 'dp-tpl', label: '动态规划', icon: null },
      ],
    },
  ];

  return (
    <aside
      className="flex flex-col overflow-hidden transition-all duration-200"
      style={{
        width,
        minWidth: width,
        background: '#111827',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      <div className="flex items-center justify-end px-2 py-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center rounded transition-colors"
          style={{
            width: 28,
            height: 28,
            background: 'transparent',
            border: 'none',
            color: 'var(--color-text-tertiary)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#F9FAFB';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = '#9CA3AF';
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="px-3 mb-3">
            <button
              className="flex items-center justify-center gap-2 w-full rounded-md transition-colors"
              style={{
                height: 36,
                fontSize: 14,
                fontWeight: 500,
                color: 'var(--color-brand-gold)',
                background: 'rgba(212, 154, 32, 0.1)',
                border: '1px solid var(--color-brand-gold)',
                cursor: 'pointer',
              }}
            >
              <PlusOutlined />
              新建项目
            </button>
          </div>

          {sections.map((section) => (
            <div key={section.label} className="mb-4">
              <div
                className="flex items-center gap-2 px-4 py-1.5"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--color-text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {section.icon}
                {section.label}
              </div>
              {section.items.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setActiveProject(item.key);
                    if (section.label === '我的项目') {
                      navigate('/workspace/' + item.key);
                    }
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left transition-colors"
                  style={{
                    fontSize: 13,
                    fontWeight: 400,
                    color:
                      activeProject === item.key
                        ? 'var(--color-text-primary)'
                        : 'var(--color-text-secondary)',
                    background:
                      activeProject === item.key
                        ? 'var(--color-bg-surface-hover)'
                        : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    borderLeft:
                      activeProject === item.key
                        ? '3px solid var(--color-brand-gold)'
                        : '3px solid transparent',
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </>
      )}

      {collapsed && (
        <div className="flex flex-col items-center gap-2 px-1 py-2">
          {projects.map((p) => (
            <Tooltip key={p.id} title={p.name} placement="right">
              <button
                onClick={() => navigate('/workspace/' + p.id)}
                className="flex items-center justify-center rounded transition-colors"
                style={{
                  width: 32,
                  height: 32,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-tertiary)',
                  cursor: 'pointer',
                }}
              >
                <StarOutlined style={{ fontSize: 14 }} />
              </button>
            </Tooltip>
          ))}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
