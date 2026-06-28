export interface Project {
  id: string;
  name: string;
  language: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface ApiConfig {
  id: string;
  label: string;
  base_url: string;
  model_name: string;
  is_default: boolean;
  is_connected?: boolean;
  last_tested?: string;
}
