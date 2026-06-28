import { InboxOutlined } from '@ant-design/icons';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="mb-4" style={{ color: 'var(--color-text-tertiary)', fontSize: 48 }}>
      {icon ?? <InboxOutlined />}
    </div>
    <h3
      className="mb-2"
      style={{
        fontSize: 16,
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
      }}
    >
      {title}
    </h3>
    {description && (
      <p
        className="mb-6 max-w-sm"
        style={{
          fontSize: 14,
          color: 'var(--color-text-tertiary)',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>
    )}
    {action}
  </div>
);

export default EmptyState;
