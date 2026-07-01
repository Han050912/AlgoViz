import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tooltip, message } from "antd";
import {
  FolderOpenOutlined,
  PlusOutlined,
  AppstoreOutlined,
  StarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";

// 模板分类映射到对应的模板 key 前缀
const templateCategoryMap: Record<string, string> = {
  "sort-tpl": "bubble-sort",
  "search-tpl": "binary-search",
  "dp-tpl": "dfs",
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const navigate = useNavigate();

  const width = collapsed ? 48 : 240;

  const projects = [
    { id: "1", name: "\u5192\u6ce1\u6392\u5e8f\u5206\u6790" },
    { id: "2", name: "\u5feb\u901f\u6392\u5e8f\u5206\u6790" },
    { id: "3", name: "\u4e8c\u5206\u67e5\u627e\u5206\u6790" },
  ];

  const sections = [
    {
      label: "\u6211\u7684\u9879\u76ee",
      icon: <FolderOpenOutlined />,
      items: projects.map((p) => ({
        key: p.id,
        label: p.name,
        icon: <StarOutlined style={{ fontSize: 12 }} />,
      })),
    },
    {
      label: "\u6a21\u677f\u5e93",
      icon: <AppstoreOutlined />,
      items: [
        { key: "sort-tpl", label: "\u6392\u5e8f\u7b97\u6cd5", icon: null },
        { key: "search-tpl", label: "\u67e5\u627e\u7b97\u6cd5", icon: null },
        { key: "dp-tpl", label: "\u52a8\u6001\u89c4\u5212", icon: null },
      ],
    },
  ];

  const handleCreateProject = () => {
    message.success("\u5df2\u521b\u5efa\u65b0\u9879\u76ee");
    navigate("/workspace");
  };

  const handleTemplateCategory = (categoryKey: string) => {
    const templateKey = templateCategoryMap[categoryKey];
    if (templateKey) {
      message.loading({ content: "\u6b63\u5728\u52a0\u8f7d\u6a21\u677f...", key: "tpl-load", duration: 0.5 });
      setTimeout(() => {
        message.success({ content: "\u5df2\u9009\u62e9\u6a21\u677f\u5e93\u9879\u76ee", key: "tpl-load" });
        navigate("/workspace", { state: { templateKey } });
      }, 400);
    }
  };

  return (
    <aside
      className="flex flex-col overflow-hidden transition-all duration-200"
      style={{
        width,
        minWidth: width,
        background: "#111827",
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
            (e.currentTarget as HTMLElement).style.color = "#F9FAFB";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#9CA3AF";
          }}
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {!collapsed && (
        <>
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
              {"\u65b0\u5efa\u9879\u76ee"}
            </button>
          </div>

          {sections.map((section) => (
            <div key={section.label} className="mb-4">
              <div
                className="flex items-center gap-2 px-4 py-1.5"
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--color-text-tertiary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
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
                    if (section.label === "\u6211\u7684\u9879\u76ee") {
                      navigate("/workspace/" + item.key);
                    } else {
                      handleTemplateCategory(item.key);
                    }
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-left transition-colors"
                  style={{
                    fontSize: 13,
                    fontWeight: 400,
                    color:
                      activeProject === item.key
                        ? "var(--color-text-primary)"
                        : "var(--color-text-secondary)",
                    background:
                      activeProject === item.key
                        ? "var(--color-bg-surface-hover)"
                        : "transparent",
                    border: "none",
                    cursor: "pointer",
                    borderLeft:
                      activeProject === item.key
                        ? "3px solid var(--color-brand-gold)"
                        : "3px solid transparent",
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
                onClick={() => navigate("/workspace/" + p.id)}
                className="flex items-center justify-center rounded transition-colors"
                style={{
                  width: 32,
                  height: 32,
                  background: "transparent",
                  border: "none",
                  color: "var(--color-text-tertiary)",
                  cursor: "pointer",
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
