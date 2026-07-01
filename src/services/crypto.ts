// 基于 Web Crypto API 的 API Key 加密存储工具
const STORAGE_KEY = "algoviz_crypto_key";

// 获取或生成 AES-GCM 加密密钥
async function getCryptoKey(): Promise<CryptoKey> {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    const raw = Uint8Array.from(atob(existing), (c) => c.charCodeAt(0));
    return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
  }
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
  const exported = await crypto.subtle.exportKey("raw", key);
  const encoded = btoa(String.fromCharCode(...new Uint8Array(exported)));
  localStorage.setItem(STORAGE_KEY, encoded);
  return key;
}

// 加密明文 API Key
export async function encryptApiKey(plaintext: string): Promise<string> {
  if (!plaintext) return "";
  const key = await getCryptoKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(plaintext)
  );
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}

// 解密密文到原文
export async function decryptApiKey(ciphertext: string): Promise<string> {
  if (!ciphertext) return "";
  try {
    const key = await getCryptoKey();
    const data = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
    const iv = data.slice(0, 12);
    const encrypted = data.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, encrypted);
    return new TextDecoder().decode(decrypted);
  } catch {
    return "";
  }
}
