import type { ComplexityBadgeProps } from '@/types/analysis';

const levelColors: Record<string, { bg: string; border: string; text: string }> = {
  'O(1)': { bg: 'rgba(34,197,94,0.1)', border: '#22C55E', text: '#22C55E' },
  'O(log n)': { bg: 'rgba(34,197,94,0.08)', border: '#22C55E', text: '#22C55E' },
  'O(n)': { bg: 'rgba(59,130,246,0.1)', border: '#3B82F6', text: '#3B82F6' },
  'O(n log n)': { bg: 'rgba(59,130,246,0.08)', border: '#3B82F6', text: '#3B82F6' },
  'O(n^2)': { bg: 'rgba(245,158,11,0.1)', border: '#F59E0B', text: '#F59E0B' },
  'O(2^n)': { bg: 'rgba(239,68,68,0.1)', border: '#EF4444', text: '#EF4444' },
};

const getStyle = (complexity: string) => {
  for (const [key, val] of Object.entries(levelColors)) {
    if (complexity.includes(key)) return val;
  }
  return { bg: 'rgba(156,163,175,0.1)', border: '#9CA3AF', text: '#9CA3AF' };
};

const ComplexityBadge = ({ time, space }: ComplexityBadgeProps) => {
  const timeStyle = getStyle(time);
  const spaceStyle = getStyle(space);

  return (
    <div className="flex gap-3 mb-4">
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ background: timeStyle.bg, border: '1px solid ' + timeStyle.border }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>时间</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: timeStyle.text, fontFamily: 'var(--font-mono)' }}>{time}</span>
      </div>
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-md" style={{ background: spaceStyle.bg, border: '1px solid ' + spaceStyle.border }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-text-tertiary)' }}>空间</span>
        <span style={{ fontSize: 14, fontWeight: 700, color: spaceStyle.text, fontFamily: 'var(--font-mono)' }}>{space}</span>
      </div>
    </div>
  );
};

export default ComplexityBadge;
