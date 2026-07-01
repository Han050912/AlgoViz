import api from './api';
import type { ApiConfig } from '@/types/project';

// 后端返回的 ConfigOut 结构（不含 api_key）
interface ConfigOutRaw {
  id: string;
  label: string;
  base_url: string;
  model_name: string;
  is_default: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface APIResponseWrapper<T> {
  code: number;
  message: string;
  data: T;
}

// 后端映射到前端 ApiConfig（is_active -> is_connected）
function toApiConfig(raw: ConfigOutRaw): ApiConfig {
  return {
    id: raw.id,
    label: raw.label,
    base_url: raw.base_url,
    model_name: raw.model_name,
    is_default: raw.is_default,
    is_connected: raw.is_active,
    last_tested: raw.is_active ? raw.updated_at : undefined,
  };
}

// 获取用户所有配置
export async function fetchConfigs(): Promise<ApiConfig[]> {
  const { data } = await api.get<APIResponseWrapper<ConfigOutRaw[]>>('/configs');
  return (data.data || []).map(toApiConfig);
}

// 创建配置（api_key 通过后端加密存储）
export async function createConfig(values: {
  label: string;
  base_url: string;
  api_key: string;
  model_name: string;
}): Promise<ApiConfig> {
  const { data } = await api.post<APIResponseWrapper<ConfigOutRaw>>('/configs', values);
  return toApiConfig(data.data);
}

// 更新配置
export async function updateConfig(
  configId: string,
  values: {
    label?: string;
    base_url?: string;
    api_key?: string;
    model_name?: string;
  }
): Promise<ApiConfig> {
  const { data } = await api.put<APIResponseWrapper<ConfigOutRaw>>('/configs/' + configId, values);
  return toApiConfig(data.data);
}

// 删除配置
export async function deleteConfig(configId: string): Promise<void> {
  await api.delete('/configs/' + configId);
}

// 测试连接（走后端）
export async function testConfigConnection(configId: string): Promise<{ ok: boolean; message: string }> {
  const { data } = await api.post<APIResponseWrapper<{ ok: boolean; message: string }>>('/configs/' + configId + '/test');
  return data.data;
}

// 设为默认
export async function setDefaultConfig(configId: string): Promise<ApiConfig> {
  const { data } = await api.put<APIResponseWrapper<ConfigOutRaw>>('/configs/' + configId + '/default');
  return toApiConfig(data.data);
}
