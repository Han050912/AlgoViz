import { Button, Popconfirm, Tag, Tooltip, Spin } from "antd";
import { SettingOutlined, MinusOutlined, CheckCircleFilled, CloseCircleFilled } from "@ant-design/icons";
import type { ApiConfig } from "@/types/project";

interface ConfigCardProps {
  config: ApiConfig;
  isDefault: boolean;
  testing: boolean;
  onEdit: (config: ApiConfig) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onSetDefault: (id: string) => void;
  onCancelDefault: (id: string) => void;
}

const ConfigCard = ({ config, isDefault, testing, onEdit, onDelete, onTest, onSetDefault, onCancelDefault }: ConfigCardProps) => (
  <div className="rounded-lg transition-all hover:shadow-lg" style={{ background: "#1F2937", border: isDefault ? "2px solid var(--color-brand-gold)" : "1px solid var(--color-border)", padding: 16 }}>
    <div className="flex items-start gap-3">
      {/* 左侧信息区 */}
      <div className="flex-1 min-w-0">
        {/* 头部：名称 + 标识 */}
        <div className="flex items-center gap-2 mb-2">
          <h4 style={{ fontSize: 15, fontWeight: 600, color: "var(--color-text-primary)", margin: 0 }}>{config.label}</h4>
          {isDefault && (
            <Tooltip title="默认配置">
              <Tag color="gold" style={{ margin: 0, fontSize: 11, lineHeight: "18px", height: 18, padding: "0 6px", borderRadius: 4 }}>
                默认
              </Tag>
            </Tooltip>
          )}
        </div>
        {/* 接口地址 */}
        <div className="flex items-center gap-1.5 mb-1">
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>接口地址：</span>
          <span className="truncate" style={{ fontSize: 12, color: "var(--color-text-secondary)", fontFamily: "var(--font-mono)" }}>{config.base_url}</span>
        </div>
        {/* 模型名称 */}
        <div className="flex items-center gap-1.5 mb-2">
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>模型：</span>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{config.model_name || "—"}</span>
        </div>
        {/* 连接状态 */}
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>状态：</span>
          <span className="flex items-center gap-1" style={{ fontSize: 11, color: config.is_connected ? "#22C55E" : "#9CA3AF" }}>
            {config.is_connected ? <CheckCircleFilled /> : <CloseCircleFilled />}
            {config.is_connected ? "已连接" : "未连接"}
          </span>
        </div>
      </div>

      {/* 右侧操作区 */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {/* 操作按钮组 */}
        <div className="flex items-center gap-1">
          <Tooltip title="编辑当前 AI 模型配置">
            <Button size="small" type="text" icon={<SettingOutlined />} onClick={() => onEdit(config)} style={{ color: "var(--color-text-tertiary)" }} />
          </Tooltip>
          <Tooltip title="删除该条模型配置，删除后不可恢复">
            <Popconfirm title="确定删除此配置？" description="删除后不可恢复，关联的分析将不可用。" onConfirm={() => onDelete(config.id)} okText="确认删除" cancelText="取消">
              <Button size="small" type="text" danger icon={<MinusOutlined />} />
            </Popconfirm>
          </Tooltip>
        </div>
        {/* 功能按钮组 */}
        <div className="flex gap-1.5">
          <Tooltip title="测试当前接口地址与密钥是否可用">
            <Button size="small" onClick={() => onTest(config.id)} loading={testing} icon={testing ? <Spin size="small" /> : undefined} style={{ borderColor: "var(--color-brand-violet)", color: "var(--color-brand-violet)", fontSize: 12, height: 28 }}>
              {testing ? "检测中" : "检测连接"}
            </Button>
          </Tooltip>
          {isDefault ? (
            <Tooltip title="将该模型设为全局默认分析模型">
              <Button size="small" type="primary" onClick={() => onCancelDefault(config.id)} style={{ fontSize: 12, height: 28, background: "var(--color-bg-surface-hover)", borderColor: "var(--color-border)" }}>
                取消默认
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="将该模型设为全局默认分析模型">
              <Button size="small" type="primary" onClick={() => onSetDefault(config.id)} style={{ fontSize: 12, height: 28 }}>
                设为默认
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  </div>
);

export default ConfigCard;
