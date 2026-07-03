import { Modal, Form, Input, Switch, Tooltip } from "antd";
import { useState, useEffect } from "react";
import { EyeOutlined, EyeInvisibleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import type { ApiConfig } from "@/types/project";

interface ConfigFormModalProps {
  open: boolean;
  editing: ApiConfig | null;
  decryptedKey: string;
  onCancel: () => void;
  onSave: (values: { label: string; base_url: string; api_key: string; model_name: string; is_default: boolean }, editingId?: string) => void;
}

const presets = [
  { label: "DeepSeek", baseUrl: "https://api.deepseek.com/v1", model: "deepseek-chat" },
  { label: "OpenAI", baseUrl: "https://api.openai.com/v1", model: "gpt-4o" },
  { label: "Ollama (Local)", baseUrl: "http://localhost:11434/v1", model: "llama3" },
  { label: "SiliconFlow", baseUrl: "https://api.siliconflow.cn/v1", model: "deepseek-ai/DeepSeek-V3" },
  { label: "Groq", baseUrl: "https://api.groq.com/openai/v1", model: "llama3-70b-8192" },
];

const ConfigFormModal = ({ open, editing, decryptedKey, onCancel, onSave }: ConfigFormModalProps) => {
  const [form] = Form.useForm();
  const [usePreset, setUsePreset] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          label: editing.label,
          base_url: editing.base_url,
          api_key: decryptedKey,
          model_name: editing.model_name,
          is_default: editing.is_default,
        });
      } else {
        form.resetFields();
        form.setFieldsValue({ is_default: false });
      }
      setShowKey(false);
      setUsePreset(false);
    }
  }, [open, editing, decryptedKey, form]);

  const handlePreset = (preset: typeof presets[0]) => {
    form.setFieldsValue({ label: preset.label, base_url: preset.baseUrl, model_name: preset.model });
    setUsePreset(true);
  };

  return (
    <Modal
      title={editing ? "\u7f16\u8f91 AI \u6a21\u578b\u914d\u7f6e" : "\u65b0\u5efa AI \u6a21\u578b\u914d\u7f6e"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.validateFields().then((values) => onSave(values, editing?.id))}
      okText="\u4fdd\u5b58"
      cancelText="\u53d6\u6d88"
      width={520}
      destroyOnClose
      styles={{ body: { background: "#111827" } }}
    >
      {!editing && !usePreset && (
        <div className="mb-4 p-3 rounded" style={{ background: "#1F2937" }}>
          <p className="mb-2" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>\u5feb\u901f\u586b\u5145</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button key={p.label} onClick={() => handlePreset(p)} className="px-3 py-1 rounded cursor-pointer" style={{ fontSize: 12, background: "#374151", color: "var(--color-text-secondary)", border: "none", transition: "0.2s" }} onMouseEnter={(e) => {(e.currentTarget as HTMLElement).style.background = "#4B5563"}} onMouseLeave={(e) => {(e.currentTarget as HTMLElement).style.background = "#374151"}}>{p.label}</button>
            ))}
          </div>
        </div>
      )}
      <Form form={form} layout="vertical" size="middle">
        <Form.Item
          name="label"
          label={
            <span>
              \u914d\u7f6e\u540d\u79f0 <Tooltip title="\u7ed9\u8fd9\u4e2a\u6a21\u578b\u914d\u7f6e\u8d77\u4e00\u4e2a\u4fbf\u4e8e\u8bc6\u522b\u7684\u540d\u79f0"><QuestionCircleOutlined style={{ color: "var(--color-text-tertiary)" }} /></Tooltip>
            </span>
          }
          rules={[{ required: true, message: "\u8bf7\u8f93\u5165\u914d\u7f6e\u540d\u79f0" }]}
        >
          <Input placeholder="\u4f8b\u5982\uff1a\u6211\u7684 DeepSeek" style={{ background: "#030712", border: "1px solid #374151", color: "#F9FAFB", borderRadius: 8, height: 40 }} />
        </Form.Item>
        <Form.Item
          name="base_url"
          label={
            <span>
              \u6a21\u578b\u63a5\u53e3\u5730\u5740 <Tooltip title="AI \u6a21\u578b\u7684 API \u57fa\u7840\u5730\u5740\uff0c\u4f8b\u5982 https://api.deepseek.com/v1"><QuestionCircleOutlined style={{ color: "var(--color-text-tertiary)" }} /></Tooltip>
            </span>
          }
          rules={[{ required: true, message: "\u8bf7\u8f93\u5165\u6a21\u578b\u63a5\u53e3\u5730\u5740" }]}
        >
          <Input placeholder="https://api.deepseek.com/v1" style={{ background: "#030712", border: "1px solid #374151", color: "#F9FAFB", borderRadius: 8, height: 40, fontFamily: "var(--font-mono)" }} />
        </Form.Item>
        <Form.Item
          name="api_key"
          label={
            <span>
              \u5bc6\u94a5 <Tooltip title="API \u5bc6\u94a5\u5c06\u52a0\u5bc6\u5b58\u50a8\uff0c\u540e\u7aef\u4e0d\u4f1a\u8fd4\u56de\u660e\u6587"><QuestionCircleOutlined style={{ color: "var(--color-text-tertiary)" }} /></Tooltip>
            </span>
          }
          extra={editing && decryptedKey ? <span style={{ fontSize: 11, color: "#6B7280" }}>\u7559\u7a7a\u5219\u4fdd\u6301\u5f53\u524d\u5bc6\u94a5\u4e0d\u53d8</span> : <span style={{ fontSize: 11, color: "#6B7280" }}>\u8f93\u5165\u60a8\u7684 API \u5bc6\u94a5</span>}
        >
          <Input
            placeholder={editing ? "sk-..." : "sk-..."}
            type={showKey ? "text" : "password"}
            style={{ background: "#030712", border: "1px solid #374151", color: "#F9FAFB", borderRadius: 8, height: 40, fontFamily: "var(--font-mono)" }}
            suffix={
              <span
                onClick={() => setShowKey(!showKey)}
                style={{ cursor: "pointer", color: "var(--color-text-tertiary)", fontSize: 14 }}
              >
                {showKey ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </span>
            }
          />
        </Form.Item>
        <Form.Item
          name="model_name"
          label={
            <span>
              \u6a21\u578b\u540d\u79f0 <Tooltip title="\u8981\u4f7f\u7528\u7684\u6a21\u578b ID\uff0c\u4f8b\u5982 deepseek-chat\u3001gpt-4o"><QuestionCircleOutlined style={{ color: "var(--color-text-tertiary)" }} /></Tooltip>
            </span>
          }
          rules={[{ required: true, message: "\u8bf7\u8f93\u5165\u6a21\u578b\u540d\u79f0" }]}
        >
          <Input placeholder="deepseek-chat" style={{ background: "#030712", border: "1px solid #374151", color: "#F9FAFB", borderRadius: 8, height: 40 }} />
        </Form.Item>
        <Form.Item
          name="is_default"
          label={
            <span>
              \u8bbe\u4e3a\u9ed8\u8ba4 <Tooltip title="\u8bbe\u4e3a\u9ed8\u8ba4\u540e\uff0c\u6240\u6709\u4ee3\u7801\u5206\u6790\u5c06\u4f7f\u7528\u6b64\u6a21\u578b"><QuestionCircleOutlined style={{ color: "var(--color-text-tertiary)" }} /></Tooltip>
            </span>
          }
          valuePropName="checked"
          extra="\u5f00\u542f\u540e\uff0c\u6b64\u914d\u7f6e\u5c06\u6210\u4e3a\u5168\u5c40\u9ed8\u8ba4\u5206\u6790\u6a21\u578b"
        >
          <Switch checkedChildren="\u5f00" unCheckedChildren="\u5173" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigFormModal;
