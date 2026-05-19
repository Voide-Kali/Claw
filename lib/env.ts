// @ts-ignore - dotenv types issue
import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const envSchema = z.object({
  OLLAMA_API_URL: z.string().url().default('http://127.0.0.1:11434'),
  WEB_SEARCH_API: z.string().url().default('http://127.0.0.1:11434/api/experimental/web_search'),
  WEB_FETCH_API: z.string().url().default('http://127.0.0.1:11434/api/experimental/web_fetch'),
  OLLAMA_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  MAX_RESULTS: z.coerce.number().int().positive().default(5),
  TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  CONTENT_TRUNCATE_LENGTH: z.coerce.number().int().positive().default(300),
  RETRY_ATTEMPTS: z.coerce.number().int().nonnegative().default(6),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  LOG_FILE: z.string().default('logs/openclaw.log'),
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(false),
  RATE_LIMIT_REQUESTS: z.coerce.number().int().positive().default(1000),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  GITHUB_TOKEN: z.string().optional(),
  GITHUB_REPO: z.string().optional(),
  GATEWAY_TOKEN: z.string().optional(),
  GATEWAY_PORT: z.coerce.number().int().positive().default(18789),
  GATEWAY_MODE: z.enum(['local', 'tailscale']).default('local'),
  WHATSAPP_ENABLED: z.coerce.boolean().default(false),
  WHATSAPP_SESSION_NAME: z.string().default('default')
});

function loadEnvConfig() {
  const currentModuleDir = dirname(fileURLToPath(import.meta.url));
  const repositoryRoot = resolve(currentModuleDir, '..');
  const envFiles = [
    resolve(process.cwd(), '.env'),
    resolve(process.cwd(), '.env.local'),
    resolve(repositoryRoot, '.env'),
    resolve(repositoryRoot, '.env.local')
  ];

  envFiles.forEach((path, index) => {
    dotenv.config({ path, override: index >= 1 });
  });

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const problems = result.error.errors
      .map(issue => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid environment configuration: ${problems}`);
  }

  return result.data;
}

export const envConfig = loadEnvConfig();
export type EnvConfig = z.infer<typeof envSchema>;
