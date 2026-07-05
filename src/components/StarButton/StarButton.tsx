import { useState, useEffect, useCallback } from "react";
import { StarOutlined, StarFilled } from "@ant-design/icons";
import { message, Tooltip } from "antd";
import { toggleFavorite, checkFavoriteStatus } from "@/services/collectionApi";

interface StarButtonProps {
  projectId: string;
  initialFavorited?: boolean;
  onToggle?: (favorited: boolean) => void;
}

const StarButton = ({ projectId, initialFavorited, onToggle }: StarButtonProps) => {
  const [favorited, setFavorited] = useState(initialFavorited ?? false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(initialFavorited !== undefined || !projectId);

  // 项目未创建（无 id）时不显示收藏按钮
  if (!projectId) {
    return null;
  }

  // 如果没有传入初始值，主动查询
  useEffect(() => {
    if (initialFavorited !== undefined) return;
    let cancelled = false;

    checkFavoriteStatus(projectId)
      .then((status) => {
        if (!cancelled) {
          setFavorited(status);
          setInitialized(true);
        }
      })
      .catch(() => {
        // 查询失败不影响使用，默认未收藏
        if (!cancelled) setInitialized(true);
      });

    return () => {
      cancelled = true;
    };
  }, [projectId, initialFavorited]);

  const handleToggle = useCallback(async () => {
    // 防抖锁
    if (loading) return;
    setLoading(true);

    // 乐观更新：取反
    const nextFavorited = !favorited;
    setFavorited(nextFavorited);

    try {
      const result = await toggleFavorite(projectId);
      // 接口返回与乐观更新一致则成功
      if (result.favorited !== nextFavorited) {
        // 不一致则回滚
        setFavorited(!nextFavorited);
        message.warning("收藏状态异常，已恢复");
      } else {
        message.success(nextFavorited ? "已收藏" : "已取消收藏");
      }
      onToggle?.(result.favorited);
    } catch {
      // 失败回滚
      setFavorited(!nextFavorited);
      message.error("操作失败，请重试");
    } finally {
      setLoading(false);
    }
  }, [projectId, favorited, loading, onToggle]);

  if (!initialized) {
    // 加载中占位
    return (
      <Tooltip title="加载中">
        <StarOutlined style={{ fontSize: 16, opacity: 0.3, color: "var(--color-text-tertiary)" }} />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={favorited ? "取消收藏" : "收藏此项目"}>
      <button
        onClick={handleToggle}
        disabled={loading}
        style={{
          background: "transparent",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          color: favorited ? "var(--color-brand-gold)" : "var(--color-text-tertiary)",
          padding: "4px 8px",
          borderRadius: 4,
          transition: "0.2s",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 13,
          fontWeight: 500,
          opacity: loading ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!loading) (e.currentTarget as HTMLElement).style.opacity = "0.8";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.opacity = "1";
        }}
      >
        {favorited ? <StarFilled style={{ fontSize: 16 }} /> : <StarOutlined style={{ fontSize: 16 }} />}
        <span>{favorited ? "已收藏" : "收藏"}</span>
      </button>
    </Tooltip>
  );
};

export default StarButton;
