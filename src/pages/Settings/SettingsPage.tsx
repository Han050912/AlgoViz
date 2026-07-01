import { useState, useEffect } from "react";
import { message, Spin } from "antd";
import ConfigCard from "@/components/ApiConfig/ConfigCard";
import ConfigEmptyState from "@/components/ApiConfig/ConfigEmptyState";
import ConfigFormModal from "@/components/ApiConfig/ConfigFormModal";
import { encryptApiKey, decryptApiKey } from "@/services/crypto";
import {
  createConfig,
  updateConfig,
  deleteConfig,
  testConfigConnection,
  setDefaultConfig,
} from "@/services/configApi";
import type { ApiConfig } from "@/types/project";

const CACHE_KEY = "algoviz_configs";
const ENC_KEY_PREFIX = "algoviz_enc_key_";

function writeCache(configs: ApiConfig[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(configs));
}

function readCache(): ApiConfig[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const SettingsPage = () => {
  const [configs, setConfigs] = useState<ApiConfig[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ApiConfig | null>(null);
  const [decryptedKey, setDecryptedKey] = useState("");
  const [testingId, setTestingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = readCache();
    if (cached.length > 0) {
      setConfigs(cached);
    }
    setLoading(false);
  }, []);

  const saveEncryptedKey = async (configId: string, key: string) => {
    if (!key) return;
    const encrypted = await encryptApiKey(key);
    localStorage.setItem(ENC_KEY_PREFIX + configId, encrypted);
  };

  const getDecryptedKey = async (configId: string): Promise<string> => {
    const encrypted = localStorage.getItem(ENC_KEY_PREFIX + configId);
    if (!encrypted) return "";
    return decryptApiKey(encrypted);
  };

  const handleSave = async (
    values: { label: string; base_url: string; api_key: string; model_name: string; is_default: boolean },
    editingId?: string
  ) => {
    try {
      if (editingId) {
        const payload: { label: string; base_url: string; model_name: string; api_key?: string } = {
          label: values.label,
          base_url: values.base_url,
          model_name: values.model_name,
        };
        if (values.api_key) payload.api_key = values.api_key;

        const updated = await updateConfig(editingId, payload);
        if (values.api_key) await saveEncryptedKey(editingId, values.api_key);

        setConfigs((prev) => {
          const next = prev.map((c) => (c.id === editingId ? { ...updated, last_tested: c.last_tested } : c));
          writeCache(next);
          return next;
        });
        message.success("\u914d\u7f6e\u5df2\u66f4\u65b0");
      } else {
        let created = await createConfig({
          label: values.label,
          base_url: values.base_url,
          api_key: values.api_key,
          model_name: values.model_name,
        });
        await saveEncryptedKey(created.id, values.api_key);
        if (values.is_default) {
          created = await setDefaultConfig(created.id);
        }
        setConfigs((prev) => {
          const next = [...prev, created];
          writeCache(next);
          return next;
        });
        message.success("\u914d\u7f6e\u5df2\u521b\u5efa");
      }
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      message.error("\u4fdd\u5b58\u5931\u8d25: " + errMsg.slice(0, 80));
      throw e;
    }
    setModalOpen(false);
    setEditing(null);
    setDecryptedKey("");
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteConfig(id);
    } catch (e: any) {
      if (e?.response?.status === 404) {
        // 后端已不存在，直接清理本地缓存
      } else {
        message.error("\u5220\u9664\u5931\u8d25: " + (e instanceof Error ? e.message : String(e)));
        return;
      }
    }
    setConfigs((prev) => {
      const next = prev.filter((c) => c.id !== id);
      writeCache(next);
      return next;
    });
    localStorage.removeItem(ENC_KEY_PREFIX + id);
    message.success("\u914d\u7f6e\u5df2\u5220\u9664");
  };

  const handleTest = async (id: string) => {
    setTestingId(id);
    try {
      const result = await testConfigConnection(id);
      if (result.ok) {
        setConfigs((prev) => {
          const next = prev.map((c) => (c.id === id ? { ...c, is_connected: true, last_tested: new Date().toISOString() } : c));
          writeCache(next);
          return next;
        });
        message.success("Connection OK");
      } else {
        setConfigs((prev) => {
          const next = prev.map((c) => (c.id === id ? { ...c, is_connected: false } : c));
          writeCache(next);
          return next;
        });
        message.error("Connection failed: " + result.message);
      }
    } catch (e: unknown) {
      message.error("Test error: " + ((e instanceof Error ? e.message : String(e)).slice(0, 50)));
    }
    setTestingId(null);
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultConfig(id);
      setConfigs((prev) => {
        const next = prev.map((c) => ({ ...c, is_default: c.id === id }));
        writeCache(next);
        return next;
      });
      message.success("\u9ed8\u8ba4\u914d\u7f6e\u5df2\u66f4\u65b0");
    } catch (e: unknown) {
      message.error((e instanceof Error ? e.message : String(e)).slice(0, 50));
    }
  };

  const handleEdit = async (config: ApiConfig) => {
    setEditing(config);
    const key = await getDecryptedKey(config.id);
    setDecryptedKey(key);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setDecryptedKey("");
    setModalOpen(true);
  };

  const defaultConfig = configs.find((c) => c.is_default);

  return (
    <div className="h-full overflow-auto" style={{ background: "var(--color-bg-page)" }}>
      <div className="max-w-3xl mx-auto p-6">
        <h2 className="mb-6" style={{ fontSize: 20, fontWeight: 600, color: "var(--color-text-primary)" }}>{"\u8bbe\u7f6e"}</h2>
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2" style={{ fontSize: 16, fontWeight: 600, color: "var(--color-text-primary)" }}>
              {"AI \u6a21\u578b\u914d\u7f6e"}
              <span className="inline-block rounded-full" style={{ width: 8, height: 8, background: configs.some((c) => c.is_connected) ? "#22C55E" : "#F59E0B", animation: configs.some((c) => c.is_connected) ? "none" : "dotPulse 2s ease-in-out infinite" }} />
            </h3>
            <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors" style={{ fontSize: 14, background: "var(--color-brand-gold)", color: "#fff", border: "none", cursor: "pointer", borderRadius: 8 }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-brand-gold-hover)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--color-brand-gold)"; }}>
              {"+ \u65b0\u589e\u914d\u7f6e"}
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spin size="large" /></div>
          ) : configs.length === 0 ? (
            <ConfigEmptyState onAdd={handleAdd} onPresetSelect={() => handleAdd()} />
          ) : (
            <div className="space-y-3">
              {configs.map((config) => (
                <ConfigCard key={config.id} config={config} isDefault={config.id === defaultConfig?.id} testing={testingId === config.id}
                  onEdit={handleEdit} onDelete={handleDelete} onTest={handleTest} onSetDefault={handleSetDefault} />
              ))}
            </div>
          )}
        </div>
      </div>
      <ConfigFormModal open={modalOpen} editing={editing} decryptedKey={decryptedKey}
        onCancel={() => { setModalOpen(false); setEditing(null); setDecryptedKey(""); }}
        onSave={handleSave} />
    </div>
  );
};

export default SettingsPage;



