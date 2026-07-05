// 收藏项目信息
export interface FavoriteItem {
  id: string;
  project_id: string;
  project_name: string;
  language: string;
  code: string;
  created_at: string;
  updated_at: string;
}

// 收藏列表分页响应
export interface FavoriteListResponse {
  items: FavoriteItem[];
  total: number;
  page: number;
  page_size: number;
}

// 收藏操作请求
export interface FavoriteToggleRequest {
  project_id: string;
}
