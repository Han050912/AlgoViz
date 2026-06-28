import { Button, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import type { ApiConfig } from '@/types/project';

interface ConfigCardProps {
  config: ApiConfig;
  isDefault: boolean;
  onEdit: (config: ApiConfig) => void;
  onDelete: (id: string) => void;
  onTest: (id: string) => void;
  onSetDefault: (id: string) => void;
}

const ConfigCard = ({ config, isDefault, onEdit, onDelete, onTest, onSetDefault }: ConfigCardProps) => (
  <div className="flex items-center p-4 gap-4 rounded-lg transition-all" style={{ background: '#1F2937', border: '1px solid var(--color-border)' }}>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="truncate" style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>{config.label || '未命名'}</h4>
        {isDefault && <Tag color="gold" style={{ margin: 0, fontSize: 11 }}>默认</Tag>}
        <span className="flex items-center gap-1" style={{ fontSize: 11, color: config.is_connected ? '#22C55E' : '#9CA3AF' }}>
          {config.is_connected ? <CheckCircleFilled /> : <MinusCircleFilled />}
          {config.is_connected ? '已连接' : '未测试'}
        </span>
      </div>
      <p className="truncate mb-1" style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontFamily: 'var(--font-mono)' }}>{config.base_url}</p>
      <p className="truncate" style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>Model: {config.model_name || 'N/A'}</p>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <Button size="small" type="text" icon={<EditOutlined />} onClick={() => onEdit(config)} style={{ color: 'var(--color-text-tertiary)' }} />
      <Popconfirm title={'删除 "' + config.label + '"?'} description="使用该配置的所有分析将不可用。" onConfirm={() => onDelete(config.id)} okText="确定" cancelText="取消">
        <Button size="small" type="text" danger icon={<DeleteOutlined />} disabled={isDefault} />
      </Popconfirm>
      <div className="flex gap-1">
        <Button size="small" onClick={() => onTest(config.id)} style={{ borderColor: 'var(--color-brand-violet)', color: 'var(--color-brand-violet)' }}>测试</Button>
        <Button size="small" type="primary" onClick={() => onSetDefault(config.id)} disabled={isDefault} style={{ background: isDefault ? 'var(--color-bg-surface-hover)' : undefined, borderColor: isDefault ? 'var(--color-border)' : undefined }}>{isDefault ? '默认' : '设为默认'}</Button>
      </div>
    </div>
  </div>
);

export default ConfigCard;
