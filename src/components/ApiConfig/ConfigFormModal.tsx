import { Modal, Form, Input, Select, Switch, message } from 'antd';
import { useState, useEffect } from 'react';
import type { ApiConfig } from '@/types/project';

interface ConfigFormModalProps {
  open: boolean;
  editing: ApiConfig | null;
  onCancel: () => void;
  onSave: (values: { label: string; base_url: string; api_key: string; model_name: string; is_default: boolean }, editingId?: string) => void;
}

const presets = [
  { label: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', model: 'deepseek-chat' },
  { label: 'OpenAI', baseUrl: 'https://api.openai.com/v1', model: 'gpt-4o' },
  { label: 'Ollama (Local)', baseUrl: 'http://localhost:11434/v1', model: 'llama3' },
  { label: 'SiliconFlow', baseUrl: 'https://api.siliconflow.cn/v1', model: 'deepseek-ai/DeepSeek-V3' },
  { label: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', model: 'llama3-70b-8192' },
];

const ConfigFormModal = ({ open, editing, onCancel, onSave }: ConfigFormModalProps) => {
  const [form] = Form.useForm();
  const [usePreset, setUsePreset] = useState(false);

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({ label: editing.label, base_url: editing.base_url, api_key: '', model_name: editing.model_name, is_default: editing.is_default });
      } else {
        form.resetFields();
        form.setFieldsValue({ is_default: false });
      }
    }
  }, [open, editing, form]);

  const handlePreset = (preset: typeof presets[0]) => {
    form.setFieldsValue({ label: preset.label, base_url: preset.baseUrl, model_name: preset.model });
    setUsePreset(true);
  };

  return (
    <Modal title={editing ? '编辑 AI 模型连接' : '新建 AI 模型连接'} open={open} onCancel={onCancel} onOk={() => form.validateFields().then((values) => onSave(values, editing?.id))} okText="保存" cancelText="取消" width={520} styles={{ body: { background: '#111827' } }}>
      <Form form={form} layout="vertical" size="middle">
        {!editing && !usePreset && (
          <div className="mb-4 p-3 rounded" style={{ background: '#1F2937' }}>
            <p className="mb-2" style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>快速填充</p>
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button key={p.label} onClick={() => handlePreset(p)} className="px-3 py-1 rounded cursor-pointer" style={{ fontSize: 12, background: '#374151', color: 'var(--color-text-secondary)', border: 'none', transition: '0.2s' }} onMouseEnter={(e) => {(e.currentTarget as HTMLElement).style.background = '#4B5563'}} onMouseLeave={(e) => {(e.currentTarget as HTMLElement).style.background = '#374151'}}>{p.label}</button>
              ))}
            </div>
          </div>
        )}
        <Form.Item name="label" label="标签" rules={[{ required: true, message: '此项为必填项' }]}>
          <Input placeholder="我的配置" style={{ background: '#030712', border: '1px solid #374151', color: '#F9FAFB', borderRadius: 8, height: 40 }} />
        </Form.Item>
        <Form.Item name="base_url" label="基础 URL" rules={[{ required: true, message: '此项为必填项' }]}>
          <Input placeholder="https://api.openai.com/v1" style={{ background: '#030712', border: '1px solid #374151', color: '#F9FAFB', borderRadius: 8, height: 40, fontFamily: 'var(--font-mono)' }} />
        </Form.Item>
        <Form.Item name="api_key" label="API Key" extra={<span style={{ fontSize: 11, color: '#6B7280' }}>留空则保持不变</span>}>
          <Input.Password placeholder="留空则保持不变" style={{ background: '#030712', border: '1px solid #374151', color: '#F9FAFB', borderRadius: 8, height: 40 }} />
        </Form.Item>
        <Form.Item name="model_name" label="模型名称" rules={[{ required: true, message: '此项为必填项' }]}>
          <Input placeholder="gpt-4o" style={{ background: '#030712', border: '1px solid #374151', color: '#F9FAFB', borderRadius: 8, height: 40 }} />
        </Form.Item>
        <Form.Item name="is_default" label="设为默认" valuePropName="checked">
          <Switch />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigFormModal;
