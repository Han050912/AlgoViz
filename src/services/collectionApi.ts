import api from "./api";
import type { FavoriteItem, FavoriteListResponse } from "@/types/collection";

// 后端统一响应包装
interface APIResponseWrapper<T> {
  code: number;
  message: string;
  data: T;
}

/**
 * 获取收藏列表（分页）
 */
export async function fetchFavorites(page: number = 1, pageSize: number = 12): Promise<FavoriteListResponse> {
  const { data } = await api.get<APIResponseWrapper<FavoriteListResponse>>("/favorites", {
    params: { page, page_size: pageSize },
  });
  return data.data;
}

/**
 * 切换收藏状态
 * 未收藏 → 收藏，已收藏 → 取消收藏
 */
export async function toggleFavorite(projectId: string): Promise<{ favorited: boolean }> {
  const { data } = await api.post<APIResponseWrapper<{ favorited: boolean }>>(`/favorites/${projectId}/toggle`);
  return data.data;
}

/**
 * 检查项目是否已收藏
 */
export async function checkFavoriteStatus(projectId: string): Promise<boolean> {
  const { data } = await api.get<APIResponseWrapper<{ favorited: boolean }>>(`/favorites/${projectId}/status`);
  return data.data.favorited;
}

/**
 * 取消收藏（快捷方式）
 */
export async function removeFavorite(projectId: string): Promise<void> {
  await api.delete(`/favorites/${projectId}`);
}
