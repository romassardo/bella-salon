import { z } from 'zod';

const serverSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),
  N8N_WEBHOOK_URL: z.string().url().optional(),
  N8N_WEBHOOK_SECRET: z.string().min(16).optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_OWNER_CHAT_ID: z.string().optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export const serverEnv = serverSchema.parse({
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL,
  N8N_WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  TELEGRAM_OWNER_CHAT_ID: process.env.TELEGRAM_OWNER_CHAT_ID,
});

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
