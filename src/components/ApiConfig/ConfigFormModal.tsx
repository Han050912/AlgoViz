import { Modal, Form, Input, Switch, Tooltip, Select, Button, Spin, message } from "antd";
import { useState, useEffect, useRef, useCallback } from "react";
import { EyeOutlined, EyeInvisibleOutlined, QuestionCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import type { ApiConfig } from "@/types/project";
import { useTheme } from "@/hooks/ThemeContext";

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
  const { theme } = useTheme();
  const [modelOptions, setModelOptions] = useState<{ label: string; value: string }[]>([]);
  const [fetchingModels, setFetchingModels] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // 取消未完成的请求
  const cancelPendingRequest = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  // 获取模型列表
  const handleFetchModels = async () => {
    // 1. 获取 BaseURL 并清理
    const baseUrl = form.getFieldValue('base_url');
    const cleanedUrl = (baseUrl || '').trim().replace(/\/+$/, '');

    if (!cleanedUrl) {
      Modal.warning({
        title: '请先填写接口地址',
        content: '需要先填写并保存正确的模型接口地址（BaseURL），才能获取模型列表。',
        okText: '确定',
      });
      return;
    }

    // 2. 获取 API Key
    const apiKey = form.getFieldValue('api_key') || decryptedKey;
    if (!apiKey) {
      Modal.warning({
        title: '请先填写 API 密钥',
        content: '需要先填写 API Key 才能发起模型列表请求。',
        okText: '确定',
      });
      return;
    }

    // 3. 取消上一次未完成的请求
    cancelPendingRequest();
    setFetchingModels(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(cleanedUrl + '/models', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + apiKey,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
        // 跨域问题：不依赖 CORS preflight 的简单请求
      });

      if (!response.ok) {
        let errorMsg = `请求失败 (${response.status})`;
        try {
          const errBody = await response.json();
          errorMsg = errBody.message || errBody.error || errorMsg;
        } catch {
          // 非 JSON 响应，使用默认消息
        }
        Modal.error({
          title: '获取模型列表失败',
          content: errorMsg,
          okText: '确定',
        });
        return;
      }

      const data = await response.json();

      // 4. 兼容多种返回结构，安全提取模型列表
      let models: string[] = [];
      if (data && typeof data === 'object') {
        // 标准 OpenAI 兼容格式: { data: [{ id: 'xxx' }] }
        if (Array.isArray(data.data)) {
          models = data.data
            .map((item: any) => item?.id)
            .filter((id: any): id is string => !!id && typeof id === 'string');
        }
        // 兼容格式: { models: [{ id: 'xxx' }] } 或 { models: ['xxx'] }
        else if (Array.isArray(data.models)) {
          models = data.models
            .map((item: any) => typeof item === 'string' ? item : item?.id)
            .filter((id: any): id is string => !!id && typeof id === 'string');
        }
        // 兼容格式: { object: 'list', data: [...] }
        else if (data.object === 'list' && Array.isArray(data.data)) {
          models = data.data
            .map((item: any) => item?.id)
            .filter((id: any): id is string => !!id && typeof id === 'string');
        }
      }

      // 5. 去重
      const uniqueModels = [...new Set(models)];

      if (uniqueModels.length === 0) {
        Modal.info({
          title: '未找到可用模型',
          content: '接口返回成功，但未解析到任何模型 ID。请检查接口地址和响应格式。',
          okText: '确定',
        });
        return;
      }

      // 6. 更新下拉选项
      const options = uniqueModels.map((id) => ({ label: id, value: id }));
      setModelOptions(options);

      // 7. 默认选中第一个，并回填到表单
      form.setFieldsValue({ model_name: uniqueModels[0] });
      message.success(`成功获取 ${uniqueModels.length} 个可用模型`);
    } catch (e: unknown) {
      // 取消请求不算错误
      if (e instanceof DOMException && e.name === 'AbortError') return;

      let errorMsg = '网络请求失败';
      if (e instanceof TypeError && e.message.includes('fetch')) {
        errorMsg = '跨域请求被阻止（CORS）。请确保服务端允许跨域访问，或使用代理。';
      } else if (e instanceof Error) {
        errorMsg = e.message.slice(0, 200);
      }

      Modal.error({
        title: '获取模型列表失败',
        content: errorMsg,
        okText: '确定',
      });
    } finally {
      if (!controller.signal.aborted) {
        abortRef.current = null;
      }
      setFetchingModels(false);
    }
  };

  // 组件卸载时取消请求
  useEffect(() => {
    return cancelPendingRequest;
  }, [cancelPendingRequest]);

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
        // 新建时默认填入第一个 preset 的模型名
        form.setFieldsValue({ model_name: presets[0].model });
      }
      setShowKey(false);
      setUsePreset(false);
      setModelOptions([]);
    }
  }, [open, editing, decryptedKey, form]);

  // 当编辑的配置变化时，清空之前的模型列表
  useEffect(() => {
    if (open && editing) {
      setModelOptions([]);
    }
  }, [open, editing?.id]);

  // 编辑模式下，将当前 model_name 加入下拉选项，方便用户查看和切换
  useEffect(() => {
    if (open && editing?.model_name) {
      setModelOptions((prev) => {
        const hasCurrent = prev.some((o) => o.value === editing.model_name);
        if (hasCurrent) return prev;
        return [{ label: editing.model_name, value: editing.model_name }, ...prev];
      });
    }
  }, [open, editing?.model_name]);

  const handlePreset = (preset: typeof presets[0]) => {
    form.setFieldsValue({ label: preset.label, base_url: preset.baseUrl, model_name: preset.model });
    setUsePreset(true);
  };

  return (
    <Modal
      title={editing ? "编辑 AI 模型配置" : "新建 AI 模型配置"}
      open={open}
      onCancel={onCancel}
      onOk={() => form.validateFields().then((values) => onSave(values, editing?.id))}
      okText="保存"
      cancelText="取消"
      width={520}
      destroyOnClose
      styles={{ body: { background: theme === 'dark' ? '#111827' : '#F9FAFB' } }}
    >
      {!editing && !usePreset && (
        <div className="mb-4 p-3 rounded" style={{ background: theme === 'dark' ? '#1F2937' : '#F3F4F6' }}>
          <p className="mb-2" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-tertiary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>快速填充</p>
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button key={p.label} onClick={() => handlePreset(p)} className="px-3 py-1 rounded cursor-pointer" style={{ fontSize: 12, background: theme === 'dark' ? "#374151" : "#E5E7EB", color: "var(--color-text-secondary)", border: "none", transition: "0.2s" }} onMouseEnter={(e) => {(e.currentTarget as HTMLElement).style.background = theme === 'dark' ? "#4B5563" : "#D1D5DB"}} onMouseLeave={(e) => {(e.currentTarget as HTMLElement).style.background = theme === 'dark' ? "#374151" : "#E5E7EB"}}>{p.label}</button>
            ))}
          </div>
        </div>
      )}
      <Form form={form} layout="vertical" size="middle">
        <Form.Item
          name="label"
          label={
            <span>
              配置名称 <Tooltip title="给这个模型配置起一个便于识别的名称"><QuestionCircleOutlined style={{ color: "var(--color-text-tertiary)" }} /></Tooltip>
            </span>
          }
          rules={[{ required: true, message: "请输入配置名称" }]}
        >
          <Input placeholder="例如：我的 DeepSeek" style={{ background: theme === 'dark' ? '#030712' : '#FFFFFF', border: `1px solid ${theme === 'dark' ? '#374151' : '#D1D5DB'}`, color: theme === 'dark' ? '#F9FAFB' : '#111827', borderRadius: 8, height: 40 }} />
        </Form.Item>
        <Form.Item
          name="base_url"
          label={
            <span>
              模型接口地址 <Tooltip title="AI 模型的 API 基础地址，例如 https://api.deepseek.com/v1"><QuestionCircleOutlined style={{ color: "var(--color-text-tertiary)" }} /></Tooltip>
            </span>
          }
          rules={[{ required: true, message: "请输入模型接口地址" }]}
        >
          <Input placeholder="https://api.deepseek.com/v1" style={{ background: theme === 'dark' ? '#030712' : '#FFFFFF', border: `1px solid ${theme === 'dark' ? '#374151' : '#D1D5DB'}`, color: theme === 'dark' ? '#F9FAFB' : '#111827', borderRadius: 8, height: 40, fontFamily: "var(--font-mono)" }} />
        </Form.Item>
        <Form.Item
          name="api_key"
          label={
            <span>
              密钥 <Tooltip title="API 密钥将加密存储，后端不会返回明文"><QuestionCircleOutlined style={{ color: "var(--color-text-tertiary)" }} /></Tooltip>
            </span>
          }
          extra={editing && decryptedKey ? <span style={{ fontSize: 11, color: theme === 'dark' ? '#6B7280' : '#9CA3AF' }}>留空则保持当前密钥不变</span> : <span style={{ fontSize: 11, color: theme === 'dark' ? '#6B7280' : '#9CA3AF' }}>输入您的 API 密钥</span>}
        >
          <Input
            placeholder={editing ? "sk-..." : "sk-..."}
            type={showKey ? "text" : "password"}
            style={{ background: theme === 'dark' ? '#030712' : '#FFFFFF', border: `1px solid ${theme === 'dark' ? '#374151' : '#D1D5DB'}`, color: theme === 'dark' ? '#F9FAFB' : '#111827', borderRadius: 8, height: 40, fontFamily: "var(--font-mono)" }}
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
              模型名称 <Tooltip title="要使用的模型 ID，例如 deepseek-chat、gpt-4o"><QuestionCircleOutlined style={{ color: "var(--color-text-tertiary)" }} /></Tooltip>
            </span>
          }
          rules={[{ required: true, message: "请选择或输入模型名称" }]}
        >
          <div className="flex gap-2">
            <Select
              placeholder="选择或输入模型名称"
              allowClear
              showSearch
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              style={{ background: theme === 'dark' ? '#030712' : '#FFFFFF', border: `1px solid ${theme === 'dark' ? '#374151' : '#D1D5DB'}`, color: theme === 'dark' ? '#F9FAFB' : '#111827', borderRadius: 8, flex: 1 }}
              options={modelOptions}
            />
            <Button
              size="middle"
              icon={fetchingModels ? <Spin size="small" /> : <ReloadOutlined />}
              onClick={handleFetchModels}
              loading={fetchingModels}
              disabled={fetchingModels}
              title="从接口获取可用模型列表"
              style={{ borderRadius: 8, height: 40, minWidth: 40 }}
            />
          </div>
        </Form.Item>
        <Form.Item
          name="is_default"
          label={
            <span>
              设为默认 <Tooltip title="设置为默认后，所有代码分析将使用此模型"><QuestionCircleOutlined style={{ color: "var(--color-text-tertiary)" }} /></Tooltip>
            </span>
          }
          valuePropName="checked"
          extra="开启后，此配置将成为全局默认分析模型"
        >
          <Switch checkedChildren="开" unCheckedChildren="关" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigFormModal;
