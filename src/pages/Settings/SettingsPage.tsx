import { useState } from 'react';
import { message } from 'antd';
import ConfigCard from '@/components/ApiConfig/ConfigCard';
import ConfigEmptyState from '@/components/ApiConfig/ConfigEmptyState';
import ConfigFormModal from '@/components/ApiConfig/ConfigFormModal';
import type { ApiConfig } from '@/types/project';

const SettingsPage = () => {
  const [configs, setConfigs] = useState<ApiConfig[]>([
    { id: '1', label: 'My DeepSeek', base_url: 'https://api.deepseek.com/v1', model_name: 'deepseek-chat', is_default: true, is_connected: true },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiConfig | null>(null);

  const handleSave = (values: { label: string; base_url: string; api_key: string; model_name: string; is_default: boolean }, editingId?: string) => {
    if (editingId) {
      setConfigs((prev) => prev.map((c) => c.id === editingId ? { ...c, label: values.label, base_url: values.base_url, model_name: values.model_name, is_default: values.is_default } : c));
    } else {
      const newConfig: ApiConfig = { id: String(Date.now()), label: values.label, base_url: values.base_url, model_name: values.model_name, is_default: values.is_default, is_connected: false };
      setConfigs((prev) => [...prev, newConfig]);
    }
    setModalOpen(false);
    setEditing(null);
    message.success(editingId ? '配置已更新' : '配置已创建');
  };

  const handleDelete = (id: string) => {
    setConfigs((prev) => prev.filter((c) => c.id !== id));
    message.success('配置已删除');
  };

  const handleTest = (id: string) => {
    message.info('正在测试连接...');
    setTimeout(() => {
      setConfigs((prev) => prev.map((c) => c.id === id ? { ...c, is_connected: true, last_tested: new Date().toISOString() } : c));
      message.success('连接成功');
    }, 1500);
  };

  const handleSetDefault = (id: string) => {
    setConfigs((prev) => prev.map((c) => ({ ...c, is_default: c.id === id })));
    message.success('默认配置已更新');
  };

  const defaultConfig = configs.find((c) => c.is_default);

  return (
    <div className="h-full overflow-auto" style={{ background: 'var(--color-bg-page)' }}>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="mb-6" style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>设置</h2>

        {/* AI Model Config Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2" style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              AI 模型配置
              <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: configs.some((c) => c.is_connected) ? '#22C55E' : '#F59E0B', animation: configs.some((c) => c.is_connected) ? 'none' : 'dotPulse 2s ease-in-out infinite' }} />
            </h3>
            <button
              onClick={() => { setEditing(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors"
              style={{ fontSize: 14, background: 'var(--color-brand-gold)', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: 8 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-gold-hover)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-brand-gold)'; }}
            >
              + 新增配置
            </button>
          </div>

          {configs.length === 0 ? (
            <ConfigEmptyState onAdd={() => { setEditing(null); setModalOpen(true); }} onPresetSelect={(p) => { setEditing(null); setModalOpen(true); }} />
          ) : (
            <div className="space-y-3">
              {configs.map((config) => (
                <ConfigCard
                  key={config.id}
                  config={config}
                  isDefault={config.id === defaultConfig?.id}
                  onEdit={(c) => { setEditing(c); setModalOpen(true); }}
                  onDelete={handleDelete}
                  onTest={handleTest}
                  onSetDefault={handleSetDefault}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfigFormModal open={modalOpen} editing={editing} onCancel={() => { setModalOpen(false); setEditing(null); }} onSave={handleSave} />
    </div>
  );
};

export default SettingsPage;
