/**
 * Logo — 通用 Logo 组件（暖金节点 + 白色文字）
 * 用于 Header 导航栏
 */
const Logo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div className="flex items-center gap-2 select-none">
    <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="14" r="6" fill="#D49A20" opacity="0.9" />
      <circle cx="12" cy="34" r="5" fill="#D49A20" opacity="0.7" />
      <circle cx="36" cy="34" r="5" fill="#D49A20" opacity="0.7" />
      <line x1="24" y1="20" x2="12" y2="29" stroke="#6D28D9" strokeWidth="1.5" opacity="0.6" />
      <line x1="24" y1="20" x2="36" y2="29" stroke="#6D28D9" strokeWidth="1.5" opacity="0.6" />
      <polygon points="22,10 28,14 22,18" fill="#FFFFFF" opacity="0.9" />
    </svg>
    {!collapsed && (
      <span
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: '#F9FAFB',
          letterSpacing: '2px',
        }}
      >
        AlgoViz
      </span>
    )}
  </div>
);

export default Logo;
