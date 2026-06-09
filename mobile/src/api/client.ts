const API_URL = process.env.EXPO_PUBLIC_APPS_SCRIPT_URL!;

export async function apiGet<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${API_URL}?${query}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API error');
  return json.data as T;
}

export async function apiPost<T>(body: object): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API error');
  return json.data as T;
}
