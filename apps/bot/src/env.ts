import { z } from "zod";

const EnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  API_BASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),
  BOT_API_TOKEN: z.string().min(1).optional(),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().min(1).optional()
});

export const env = EnvSchema.parse(process.env);

