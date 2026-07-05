import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import {
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const width = collapsed ? 48 : 240;

  const handleCreateProject = () => {
    message.success("已创建新项目");
    navigate("/workspace");
  };

  return (
    <aside
      className="flex flex-col overflow-hidden transition-all duration-200"
      style={{
        width,
        minWidth: width,
        background: "var(--color-bg-elevated)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center justify-end px-2 py-3">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center rounded transition-colors"
          style={{
            width: 28,
            height: 28,
            background: "transparent",
            border: "none",
            color: "var(--color-text-tertiary)",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--color-text-tertiary)";
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {!collapsed && (
        <div className="px-3 mb-3">
          <button
            onClick={handleCreateProject}
            className="flex items-center justify-center gap-2 w-full rounded-md transition-colors"
            style={{
              height: 36,
              fontSize: 14,
              fontWeight: 500,
              color: "var(--color-brand-gold)",
              background: "rgba(212, 154, 32, 0.1)",
              border: "1px solid var(--color-brand-gold)",
              cursor: "pointer",
            }}
          >
            <PlusOutlined />
            新建项目
          </button>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
