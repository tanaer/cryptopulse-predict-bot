import { NextResponse } from "next/server";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

export const runtime = "nodejs";

const AddressSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/)
  .optional()
  .or(z.literal(""));

const BodySchema = z.object({
  code: z.string().trim().min(1),
  polymarketAddress: AddressSchema,
  safeAddress: AddressSchema,
  funderAddress: AddressSchema
});

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "database_unavailable" }, { status: 503 });
  }

  let prisma: PrismaClient;
  try {
    prisma = (await import("@cryptopulse/db")).prisma as PrismaClient;
  } catch {
    return NextResponse.json({ error: "prisma_unavailable" }, { status: 503 });
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

  const now = new Date();

  try {
    const bindCode = await prisma.bindCode.findUnique({
      where: { code: parsed.data.code }
    });

    if (!bindCode) {
      return NextResponse.json({ error: "code_not_found" }, { status: 404 });
    }

    if (bindCode.usedAt) {
      return NextResponse.json({ error: "code_used" }, { status: 409 });
    }

    if (new Date(bindCode.expiresAt).getTime() <= now.getTime()) {
      return NextResponse.json({ error: "code_expired" }, { status: 410 });
    }

    await prisma.$transaction([
      prisma.user.upsert({
        where: { telegramId: bindCode.telegramId },
        update: {
          polymarketAddress: parsed.data.polymarketAddress || null,
          safeAddress: parsed.data.safeAddress || null,
          funderAddress: parsed.data.funderAddress || null
        },
        create: {
          telegramId: bindCode.telegramId,
          polymarketAddress: parsed.data.polymarketAddress || null,
          safeAddress: parsed.data.safeAddress || null,
          funderAddress: parsed.data.funderAddress || null
        }
      }),
      prisma.bindCode.update({
        where: { code: parsed.data.code },
        data: { usedAt: now }
      })
    ]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}

