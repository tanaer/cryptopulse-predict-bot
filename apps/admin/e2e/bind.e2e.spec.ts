import { test, expect } from "@playwright/test";
import { prisma } from "@cryptopulse/db";

function ensureLocalDb() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) return { ok: false as const, reason: "DATABASE_URL 未设置" };
  if (!/localhost|127\.0\.0\.1/i.test(url))
    return { ok: false as const, reason: "DATABASE_URL 不是本机地址，测试已跳过" };
  return { ok: true as const };
}

test("bind: 无 code 时展示步骤与输入框", async ({ page }) => {
  await page.goto("/bind");
  await expect(page.getByRole("heading", { name: "绑定 Polymarket" })).toBeVisible();
  await expect(page.getByText("操作步骤")).toBeVisible();
  await expect(page.getByPlaceholder("请输入绑定码（例如：ABCD1234EF）")).toBeVisible();
  await expect(page.getByRole("button", { name: "继续" })).toBeVisible();
});

test("bind: 填写无效地址会出现友好错误提示", async ({ page }) => {
  const db = ensureLocalDb();
  test.skip(!db.ok, db.ok ? undefined : db.reason);

  const telegramId = 93001n;
  const code = "E2EBIND01A";
  await prisma.user.upsert({
    where: { telegramId },
    update: {},
    create: { telegramId }
  });
  await prisma.bindCode.create({
    data: { code, telegramId, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }
  });

  await page.goto(`/bind?code=${encodeURIComponent(code)}`);
  await page.getByLabel("Polymarket 钱包地址 (EOA)").fill("0x123");
  await page.getByRole("button", { name: "确认绑定" }).click();
  await expect(page.getByText("输入不合法")).toBeVisible();

  await prisma.bindCode.deleteMany({ where: { telegramId } });
  await prisma.user.deleteMany({ where: { telegramId } });
});

test("bind: 提交成功后跳转成功页并提示下一步", async ({ page }) => {
  const db = ensureLocalDb();
  test.skip(!db.ok, db.ok ? undefined : db.reason);

  const telegramId = 93002n;
  const code = "E2EBIND02B";
  await prisma.user.upsert({
    where: { telegramId },
    update: {},
    create: { telegramId }
  });
  await prisma.bindCode.create({
    data: { code, telegramId, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }
  });

  await page.goto(`/bind?code=${encodeURIComponent(code)}`);
  await page
    .getByLabel("Polymarket 钱包地址 (EOA)")
    .fill("0x2222222222222222222222222222222222222222");
  await page.getByRole("button", { name: "确认绑定" }).click();
  await expect(page).toHaveURL(/\/bind\/success$/);
  await expect(page.getByText("下一步")).toBeVisible();

  const bc = await prisma.bindCode.findUnique({ where: { code } });
  expect(Boolean(bc?.usedAt)).toBeTruthy();

  await prisma.bindCode.deleteMany({ where: { telegramId } });
  await prisma.user.deleteMany({ where: { telegramId } });
});

