import { useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "antd";
import {
  SettingOutlined,
  HistoryOutlined,
  CodeOutlined,
  UserOutlined,
  LogoutOutlined,
  KeyOutlined,
} from "@ant-design/icons";
import Logo from "@/components/common/Logo";

const navItems = [
  { key: "/workspace", label: "\u5de5\u4f5c\u53f0", icon: <CodeOutlined /> },
  { key: "/history", label: "\u5386\u53f2\u8bb0\u5f55", icon: <HistoryOutlined /> },
  { key: "/settings", label: "\u8bbe\u7f6e", icon: <SettingOutlined /> },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("refresh_token");
    navigate("/login");
  };

  const userMenuItems = {
    items: [
      {
        key: "settings",
        icon: <SettingOutlined />,
        label: "\u8d26\u53f7\u8bbe\u7f6e",
        onClick: () => navigate("/settings"),
      },
      {
        key: "api-keys",
        icon: <KeyOutlined />,
        label: "API \u5bc6\u94a5\u7ba1\u7406",
        onClick: () => navigate("/settings"),
      },
      { type: "divider" as const },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "\u9000\u51fa\u767b\u5f55",
        danger: true,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <header
      className="flex items-center justify-between px-6 select-none"
      style={{
        height: 56,
        background: "transparent",
        borderBottom: "none",
      }}
    >
      <div className="flex items-center gap-8">
        <div
          className="cursor-pointer"
          onClick={() => navigate("/workspace")}
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
                  ? "var(--color-brand-gold)"
                  : "var(--color-text-secondary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                borderBottom: isActive(item.key)
                  ? "2px solid var(--color-brand-gold)"
                  : "2px solid transparent",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      <Dropdown menu={userMenuItems} placement="bottomRight" trigger={["click"]}>
        <div
          className="flex items-center justify-center rounded-full cursor-pointer transition-colors"
          style={{
            width: 32,
            height: 32,
            border: "1.5px solid var(--color-brand-gold)",
            color: "var(--color-text-tertiary)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#F9FAFB";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
          }}
        >
          <UserOutlined style={{ fontSize: 14 }} />
        </div>
      </Dropdown>
    </header>
  );
};

export default Header;
