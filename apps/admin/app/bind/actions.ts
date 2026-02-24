"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

const AddressSchema = z
  .string()
  .trim()
  .regex(/^0x[a-fA-F0-9]{40}$/)
  .optional()
  .or(z.literal(""));

const ConfirmSchema = z.object({
  code: z.string().trim().min(1),
  polymarketAddress: AddressSchema,
  safeAddress: AddressSchema,
  funderAddress: AddressSchema
});

export async function confirmBindAction(formData: FormData) {
  const parsed = ConfirmSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    polymarketAddress: String(formData.get("polymarketAddress") ?? ""),
    safeAddress: String(formData.get("safeAddress") ?? ""),
    funderAddress: String(formData.get("funderAddress") ?? "")
  });

  if (!parsed.success) {
    redirect(`/bind?code=${encodeURIComponent(String(formData.get("code") ?? ""))}&error=invalid_input`);
  }

  if (!process.env.DATABASE_URL) {
    redirect(`/bind?code=${encodeURIComponent(parsed.data.code)}&error=database_unavailable`);
  }

  let prisma: PrismaClient;
  try {
    prisma = (await import("@cryptopulse/db")).prisma as PrismaClient;
  } catch {
    redirect(`/bind?code=${encodeURIComponent(parsed.data.code)}&error=prisma_unavailable`);
  }

  const now = new Date();

  try {
    const bindCode = await prisma.bindCode.findUnique({
      where: { code: parsed.data.code }
    });

    if (!bindCode) {
      redirect(`/bind?code=${encodeURIComponent(parsed.data.code)}&error=code_not_found`);
    }

    if (bindCode.usedAt) {
      redirect(`/bind?code=${encodeURIComponent(parsed.data.code)}&error=code_used`);
    }

    if (new Date(bindCode.expiresAt).getTime() <= now.getTime()) {
      redirect(`/bind?code=${encodeURIComponent(parsed.data.code)}&error=code_expired`);
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
  } catch {
    redirect(`/bind?code=${encodeURIComponent(parsed.data.code)}&error=server_error`);
  }

  redirect("/bind/success");
}

