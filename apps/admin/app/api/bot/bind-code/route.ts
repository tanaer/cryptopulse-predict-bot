import { NextResponse } from "next/server";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const BodySchema = z.object({
  telegramId: z.number().int().positive(),
  language: z.string().min(1).optional()
});

function getBearerToken(req: Request) {
  const h = req.headers.get("authorization") ?? "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m?.[1] ?? "";
}

function randomCode(length = 10) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

function isPrismaUniqueConstraintError(e: unknown) {
  if (typeof e !== "object" || e === null) return false;
  if (!("code" in e)) return false;
  return (e as Record<string, unknown>).code === "P2002";
}

export async function POST(req: Request) {
  const apiToken = process.env.BOT_API_TOKEN ?? "";
  const provided = getBearerToken(req);

  if (apiToken) {
    if (!provided || provided !== apiToken) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const { telegramId, language } = parsed.data;

  let prisma: PrismaClient;
  try {
    prisma = (await import("@cryptopulse/db")).prisma as PrismaClient;
  } catch {
    return NextResponse.json({ error: "prisma_unavailable" }, { status: 503 });
  }

  try {
    await prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: { language: language ?? undefined },
      create: {
        telegramId: BigInt(telegramId),
        language: language ?? undefined
      }
    });

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = randomCode(10);
      try {
        await prisma.bindCode.create({
          data: {
            code,
            telegramId: BigInt(telegramId),
            expiresAt
          }
        });
        return NextResponse.json({ code, expiresAt: expiresAt.toISOString() });
      } catch (e: unknown) {
        if (!isPrismaUniqueConstraintError(e)) throw e;
      }
    }

    return NextResponse.json({ error: "code_generation_failed" }, { status: 500 });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

