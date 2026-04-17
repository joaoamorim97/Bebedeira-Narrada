import Constants from 'expo-constants';

// Lê a variável de ambiente corretamente no Expo
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiUrl as string) ||
  process.env.EXPO_PUBLIC_API_URL ||
  'http://localhost:3001';

export async function apiPost(endpoint: string, body: object, timeoutMs = 20000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log(`[API] POST ${API_BASE_URL}${endpoint}`);
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await res.text();
    console.log(`[API] ${endpoint} → ${res.status} | ${text.slice(0, 120)}`);

    if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    return JSON.parse(text);
  } catch (e: any) {
    clearTimeout(timer);
    console.error(`[API] ERRO em ${endpoint}:`, e.message);
    throw e;
  }
}

export async function apiGet(endpoint: string): Promise<any> {
  console.log(`[API] GET ${API_BASE_URL}${endpoint}`);
  const res = await fetch(`${API_BASE_URL}${endpoint}`);
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return JSON.parse(text);
}

export async function apiDelete(endpoint: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' });
  return res.json();
}
