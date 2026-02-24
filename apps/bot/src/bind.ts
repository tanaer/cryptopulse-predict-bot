export type BindCodeResponse = { code: string; expiresAt?: string };

export async function createBindCode(args: {
  apiBaseUrl: string;
  botApiToken?: string;
  telegramId: number;
  language?: string;
}) {
  const headers: Record<string, string> = {
    "content-type": "application/json"
  };
  if (args.botApiToken) {
    headers.authorization = `Bearer ${args.botApiToken}`;
  }

  const res = await fetch(`${args.apiBaseUrl}/api/bot/bind-code`, {
    method: "POST",
    headers,
    body: JSON.stringify({ telegramId: args.telegramId, language: args.language })
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`bind_code_failed:${res.status}:${txt.slice(0, 200)}`);
  }

  const json = (await res.json()) as BindCodeResponse;
  if (!json?.code) throw new Error("bind_code_failed:invalid_response");
  return json;
}

export function formatExpiresIn(expiresAt?: string) {
  if (!expiresAt) return "有效期有限，请尽快完成绑定。";
  const ms = new Date(expiresAt).getTime() - Date.now();
  const mins = Math.max(1, Math.round(ms / 60000));
  return `有效期约 ${mins} 分钟，请尽快完成绑定。`;
}

