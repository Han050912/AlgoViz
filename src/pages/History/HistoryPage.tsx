import { useNavigate } from 'react-router-dom';
import { Empty, Card, Tag, Tooltip } from 'antd';
import { CodeOutlined, ClockCircleOutlined, RightOutlined } from '@ant-design/icons';

const mockHistory = [
  { id: '1', name: '冒泡排序分析', language: 'python', steps: 15, createdAt: '2026-06-27 14:30' },
  { id: '2', name: '快速排序分析', language: 'python', steps: 22, createdAt: '2026-06-26 09:15' },
  { id: '3', name: '二分查找分析', language: 'python', steps: 8, createdAt: '2026-06-25 16:45' },
];

const langColors: Record<string, string> = { python: '#3B82F6', javascript: '#F59E0B', java: '#EF4444', cpp: '#22C55E', go: '#06B6D4', rust: '#F97316' };

const HistoryPage = () => {
  const navigate = useNavigate();

  if (mockHistory.length === 0) {
    return (
      <div className="flex items-center justify-center h-full" style={{ background: 'var(--color-bg-page)' }}>
        <Empty description={<span style={{ color: 'var(--color-text-tertiary)' }}>暂无历史记录</span>} />
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-auto" style={{ background: 'var(--color-bg-page)' }}>
      <h2 className="mb-6" style={{ fontSize: 20, fontWeight: 600, color: 'var(--color-text-primary)' }}>分析历史</h2>
      <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
        {mockHistory.map((item) => (
          <Card
            key={item.id}
            hoverable
            onClick={() => navigate('/history/' + item.id)}
            style={{ background: 'var(--color-bg-surface)', border: '1px solid var(--color-border)', borderRadius: 8, cursor: 'pointer' }}
            bodyStyle={{ padding: '16px 20px' }}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>{item.name}</h3>
              <RightOutlined style={{ color: 'var(--color-text-tertiary)', fontSize: 12, marginTop: 4 }} />
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Tag color={langColors[item.language]} style={{ margin: 0 }}>{item.language}</Tag>
              <Tooltip title="总步数">
                <span className="flex items-center gap-1" style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                  <CodeOutlined /> {item.steps} 步
                </span>
              </Tooltip>
            </div>
            <div className="flex items-center gap-1" style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
              <ClockCircleOutlined /> {item.createdAt}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
