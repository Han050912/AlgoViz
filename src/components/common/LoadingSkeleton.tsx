const LoadingSkeleton = ({
  lines = 4,
  className = '',
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={"animate-pulse space-y-3 p-6 " + className}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="rounded"
        style={{
          height: 14,
          width: i === lines - 1 ? '55%' : '100%',
          background: 'var(--color-bg-surface-hover)',
        }}
      />
    ))}
  </div>
);

export default LoadingSkeleton;
