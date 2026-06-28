/**
 * AlgoVizLogo — 认证页 Logo SVG 图标（48x48）
 * 三个节点 + 曲线连线 + 播放三角
 */
const AlgoVizLogo = () => (
  <div className="flex justify-center mb-4">
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="14" r="6" fill="#D49A20" opacity="0.9" />
      <circle cx="12" cy="34" r="5" fill="#D49A20" opacity="0.7" />
      <circle cx="36" cy="34" r="5" fill="#D49A20" opacity="0.7" />
      <path
        d="M24 20 Q18 27 12 29"
        stroke="#D9D9D9"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />
      <path
        d="M24 20 Q30 27 36 29"
        stroke="#D9D9D9"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />
      <polygon points="21,10 28,14 21,18" fill="#FFFFFF" opacity="0.9" />
    </svg>
  </div>
);

export default AlgoVizLogo;
