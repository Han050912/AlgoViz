import { Modal, Form, Input, Select, Switch, message } from "antd";
import { useState, useEffect } from "react";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
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
    }
  }, [open, editing, decryptedKey, form]);

  const handlePreset = (preset: typeof presets[0]) => {
    form.setFieldsValue({ label: preset.label, base_url: preset.baseUrl, model_name: preset.model });
    setUsePreset(true);
  };

  return (
    <Modal
      title={editing ? "\u7f16\u8f91 AI \u6a21\u578b\u8fde\u63a5" : "\u65b0\u5efa AI \u6a21\u578b\u8fde\u63a5"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.validateFields().then((values) => onSave(values, editing?.id))}
      okText={"\u4fdd\u5b58"}
      cancelText={"\u53d6\u6d88"}
      width={520}
      styles={{ body: { background: "#111827" } }}
    >
      <Form form={form} layout="vertical" size="middle">
        {!editing && !usePreset && (
          <div className="mb-4 p-3 rounded" style={{ background: "#1F2937" }}>
            <p className="mb-2" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>{"\u5feb\u901f\u586b\u5145"}</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button key={p.label} onClick={() => handlePreset(p)} className="px-3 py-1 rounded cursor-pointer" style={{ fontSize: 12, background: "#374151", color: "var(--color-text-secondary)", border: "none", transition: "0.2s" }} onMouseEnter={(e) => {(e.currentTarget as HTMLElement).style.background = "#4B5563"}} onMouseLeave={(e) => {(e.currentTarget as HTMLElement).style.background = "#374151"}}>{p.label}</button>
              ))}
            </div>
          </div>
        )}
        <Form.Item name="label" label={"\u6807\u7b7e"} rules={[{ required: true, message: "\u6b64\u9879\u4e3a\u5fc5\u586b\u9879" }]}>
          <Input placeholder={"\u6211\u7684\u914d\u7f6e"} style={{ background: "#030712", border: "1px solid #374151", color: "#F9FAFB", borderRadius: 8, height: 40 }} />
        </Form.Item>
        <Form.Item name="base_url" label={"\u57fa\u7840 URL"} rules={[{ required: true, message: "\u6b64\u9879\u4e3a\u5fc5\u586b\u9879" }]}>
          <Input placeholder="https://api.openai.com/v1" style={{ background: "#030712", border: "1px solid #374151", color: "#F9FAFB", borderRadius: 8, height: 40, fontFamily: "var(--font-mono)" }} />
        </Form.Item>
        <Form.Item name="api_key" label="API Key" extra={<span style={{ fontSize: 11, color: "#6B7280" }}>{editing ? "\u5df2\u5b58\u50a8\u7684\u5bc6\u94a5" : "\u8f93\u5165\u60a8\u7684 API \u5bc6\u94a5"}</span>}>
          <Input
            placeholder={editing ? "\u7559\u7a7a\u5219\u4fdd\u6301\u4e0d\u53d8" : "sk-..."}
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
        <Form.Item name="model_name" label={"\u6a21\u578b\u540d\u79f0"} rules={[{ required: true, message: "\u6b64\u9879\u4e3a\u5fc5\u586b\u9879" }]}>
          <Input placeholder="gpt-4o" style={{ background: "#030712", border: "1px solid #374151", color: "#F9FAFB", borderRadius: 8, height: 40 }} />
        </Form.Item>
        <Form.Item name="is_default" label={"\u8bbe\u4e3a\u9ed8\u8ba4"} valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigFormModal;
