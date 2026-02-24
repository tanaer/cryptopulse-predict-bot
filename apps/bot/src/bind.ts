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
    console.error(`Bind code API error: ${res.status}`, txt);
    if (res.status === 404) {
      throw new Error("API 接口未找到（404），请确认 admin 服务已正确部署");
    } else if (res.status === 401) {
      throw new Error("API 认证失败（401），请检查 BOT_API_TOKEN 配置");
    } else if (res.status === 503) {
      throw new Error("数据库服务不可用（503），请稍后重试");
    }
    throw new Error(`请求失败: ${res.status}`);
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

