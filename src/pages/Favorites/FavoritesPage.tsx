import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { message, Empty, Pagination } from "antd";
import { StarOutlined, ClockCircleOutlined, CodeOutlined } from "@ant-design/icons";
import { fetchFavorites, toggleFavorite } from "@/services/collectionApi";
import type { FavoriteItem } from "@/types/collection";

const PAGE_SIZE = 12;
const langColors: Record<string, string> = {
  python: "#3B82F6",
  javascript: "#F59E0B",
  java: "#EF4444",
  cpp: "#22C55E",
  go: "#06B6D4",
  rust: "#F97316",
};

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [favoritingIds, setFavoritingIds] = useState<Set<string>>(new Set());

  // 加载收藏列表
  const loadFavorites = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetchFavorites(p, PAGE_SIZE);
      setFavorites(res.items);
      setTotal(res.total);
    } catch {
      message.error("加载收藏列表失败");
      setFavorites([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavorites(page);
  }, [page, loadFavorites]);

  // 切换收藏状态（乐观更新）
  const handleToggleFavorite = useCallback(
    async (item: FavoriteItem) => {
      // 防抖锁
      if (favoritingIds.has(item.id)) return;
      setFavoritingIds((prev) => new Set(prev).add(item.id));

      // 乐观更新：假设取消收藏
      const optimisticUnstar = favorites.map((f) =>
        f.id === item.id ? { ...f, id: f.id } : f
      );
      const filtered = optimisticUnstar.filter((f) => f.id !== item.id);
      setFavorites(filtered);

      try {
        const result = await toggleFavorite(item.project_id);
        if (!result.favorited) {
          // 取消收藏成功，列表已更新
          message.success("已取消收藏");
        } else {
          // 意外：接口说已收藏，恢复
          setFavorites(optimisticUnstar);
          message.warning("收藏状态异常，已恢复");
        }
      } catch {
        // 失败：恢复数据
        setFavorites(optimisticUnstar);
        message.error("操作失败，请重试");
      } finally {
        setFavoritingIds((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    },
    [favorites, favoritingIds]
  );

  // 跳转到项目详情
  const goToProject = (projectId: string) => {
    navigate("/workspace/" + projectId);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 h-full overflow-auto" style={{ background: "var(--color-bg-page)" }}>
      <h2 className="mb-6" style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)" }}>我的收藏</h2>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <p style={{ fontSize: 14, color: "var(--color-text-tertiary)" }}>加载中...</p>
          </div>
        </div>
      ) : favorites.length === 0 ? (
        <Empty
          description={
            <span style={{ color: "var(--color-text-tertiary)" }}>
              暂无收藏项目，快去工作台收藏你的算法吧
            </span>
          }
        />
      ) : (
        <>
          <div
            className="grid gap-4"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}
          >
            {favorites.map((item) => (
              <div
                key={item.id}
                className="rounded-lg transition-all hover:shadow-lg cursor-pointer"
                style={{
                  background: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                }}
                onClick={() => goToProject(item.project_id)}
              >
                <div style={{ padding: "16px 20px" }}>
                  <div className="flex items-start justify-between mb-3">
                    <h3
                      style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        margin: 0,
                        flex: 1,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.project_name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(item);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--color-brand-gold)",
                        fontSize: 16,
                        padding: "2px 4px",
                        transition: "0.2s",
                      }}
                      onMouseEnter={(ev) => {
                        (ev.currentTarget as HTMLElement).style.transform = "scale(1.2)";
                      }}
                      onMouseLeave={(ev) => {
                        (ev.currentTarget as HTMLElement).style.transform = "scale(1)";
                      }}
                      title="取消收藏"
                    >
                      <StarOutlined style={{ fontSize: 18 }} />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 11,
                        lineHeight: "18px",
                        height: 18,
                        padding: "0 6px",
                        borderRadius: 4,
                        background: langColors[item.language] || "#9CA3AF",
                        color: "#fff",
                      }}
                    >
                      {item.language}
                    </span>
                    <span className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
                      <CodeOutlined /> 算法项目
                    </span>
                  </div>
                  <div className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
                    <ClockCircleOutlined /> {item.created_at}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={page}
                total={total}
                pageSize={PAGE_SIZE}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
                style={{ color: "var(--color-text-primary)" }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FavoritesPage;
