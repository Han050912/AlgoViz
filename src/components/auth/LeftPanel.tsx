import { useEffect, useRef, useCallback, useState } from 'react';

/** Unsplash 算法/数据可视化主题图片池 */
const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',       // 数据中心
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',   // 芯片/电路
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',       // 数据可视化大屏
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80', // 科技网格
  'https://images.unsplash.com/photo-1639322537228-f710d846310a?w=1200&q=80', // 区块链网络
  'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&q=80',       // 数据分析
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&q=80',       // 代码屏幕
  'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&q=80', // 数据图表
];

/**
 * LeftPanel — 左侧品牌展示区
 * 每次进入随机选一张 Unsplash 背景图 + Canvas 粒子动画叠加层
 * 图片加载失败时显示渐变兜底，Canvas 粒子始终渲染
 */
const LeftPanel = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgImage, setBgImage] = useState<string>('');
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  const createParticles = useCallback(
    (width: number, height: number) => {
      const count = Math.min(60, Math.floor((width * height) / 8000));
      const particles: {
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
      }[] = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          radius: Math.random() * 2 + 1,
        });
      }
      return particles;
    },
    []
  );

  // 组件挂载时随机选择一张背景图
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * UNSPLASH_IMAGES.length);
    setBgImage(UNSPLASH_IMAGES[randomIndex]);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles = createParticles(canvas.width || 800, canvas.height || 600);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      particles = createParticles(parent.clientWidth, parent.clientHeight);
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 力导向连线
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(212, 154, 32, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // 节点 + 光晕
      for (const p of particles) {
        // 外发光
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 154, 32, 0.12)';
        ctx.fill();

        // 核心光点（暖金色 #D49A20）
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 154, 32, 0.8)';
        ctx.fill();
      }

      // 更新位置
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener('resize', () => {
      resize();
    });

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', () => {});
    };
  }, [createParticles]);

  if (!bgImage) return null;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 渐变兜底背景（始终存在） */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #172554 100%)',
          zIndex: 0,
        }}
      />

      {/* 背景图 */}
      <img
        src={bgImage}
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: 1 }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
      />

      {/* Canvas 粒子叠加层（常驻渲染） */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          zIndex: 2,
          opacity: imageLoaded ? 0.7 : 1,
          pointerEvents: 'none',
        }}
      />

      {/* 左上 AlgoViz 品牌标识 */}
      <div
        className="absolute flex items-center gap-2"
        style={{
          top: 30,
          left: 30,
          zIndex: 3,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="14" r="6" fill="#D49A20" opacity="0.9" />
          <circle cx="12" cy="34" r="5" fill="#D49A20" opacity="0.7" />
          <circle cx="36" cy="34" r="5" fill="#D49A20" opacity="0.7" />
          <line x1="24" y1="20" x2="12" y2="29" stroke="#A855F7" strokeWidth="1.5" opacity="0.6" />
          <line x1="24" y1="20" x2="36" y2="29" stroke="#A855F7" strokeWidth="1.5" opacity="0.6" />
          <polygon points="22,10 28,14 22,18" fill="#FFFFFF" opacity="0.9" />
        </svg>
        <span
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '2px',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          AlgoViz
        </span>
      </div>

      {/* 左下 slogan */}
      <div
        className="absolute"
        style={{
          bottom: 30,
          left: 30,
          zIndex: 3,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 400,
            color: 'rgba(255,255,255,0.7)',
            textShadow: '0 1px 4px rgba(0,0,0,0.3)',
          }}
        >
          Visualize Your Algorithm
        </span>
      </div>
    </div>
  );
};

export default LeftPanel;
