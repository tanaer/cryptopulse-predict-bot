import { z } from "zod";

export const TelegramIdSchema = z.number().int().positive();

export type Language = "zh-CN" | "en";

export const LanguageSchema = z.union([z.literal("zh-CN"), z.literal("en")]);

