import { NextResponse } from "next/server";
import { createHmac } from "crypto";

/**
 * Builder Attribution Headers 签名端点
 * 用于为 CLOB/Relayer 请求提供 Builder 签名
 * 
 * 安全要求:
 * - 仅服务端可访问 (SIGNING_TOKEN 鉴权)
 * - Builder Key/Secret 不暴露给客户端
 */

export const runtime = "nodejs";

export async function POST(req: Request) {
  // 鉴权
  const signingToken = process.env.SIGNING_TOKEN ?? "";
  const authHeader = req.headers.get("authorization") ?? "";
  const providedToken = authHeader.replace(/^Bearer\s+/i, "");

  if (!signingToken || providedToken !== signingToken) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { timestamp, method, path, body: requestBody } = body;

    if (!timestamp || !method || !path) {
      return NextResponse.json({ error: "missing_params" }, { status: 400 });
    }

    // 获取 Builder 凭据
    const apiKey = process.env.POLY_BUILDER_API_KEY;
    const secret = process.env.POLY_BUILDER_SECRET;
    const passphrase = process.env.POLY_BUILDER_PASSPHRASE;

    if (!apiKey || !secret || !passphrase) {
      return NextResponse.json({ error: "builder_credentials_not_configured" }, { status: 503 });
    }

    // 生成签名 (Polymarket Builder Signing 格式)
    const message = timestamp + method.toUpperCase() + path + (requestBody ? JSON.stringify(requestBody) : "");
    const signature = createHmac("sha256", secret).update(message).digest("base64");

    // 生成 passphrase 签名
    const passphraseSig = createHmac("sha256", secret).update(timestamp + passphrase).digest("base64");

    return NextResponse.json({
      success: true,
      headers: {
        "POLYMARKET-API-KEY": apiKey,
        "POLYMARKET-SIGNATURE": signature,
        "POLYMARKET-PASSPHRASE": passphraseSig,
        "POLYMARKET-TIMESTAMP": timestamp.toString(),
      }
    });
  } catch (error) {
    console.error("Signing error:", error);
    return NextResponse.json({ error: "signing_failed" }, { status: 500 });
  }
}
