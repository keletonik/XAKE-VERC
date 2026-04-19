import { z } from "zod";

const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().default("XAKE"),
  NEXT_PUBLIC_ENVIRONMENT: z.enum(["paper", "live"]).default("paper"),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),
  ANTHROPIC_FALLBACK_MODEL: z.string().default("claude-haiku-4-5-20251001"),
  CRON_SECRET: z.string().optional(),
  ENABLE_COINBASE_FEED: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
});

type Env = z.infer<typeof EnvSchema>;

let cached: Env | undefined;

export function env(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Invalid env: ${parsed.error.message}`);
    }
    console.warn("[env] falling back to defaults:", parsed.error.flatten().fieldErrors);
    cached = EnvSchema.parse({});
    return cached;
  }
  cached = parsed.data;
  return cached;
}

export const isLiveEnv = () => env().NEXT_PUBLIC_ENVIRONMENT === "live";
export const isPaperEnv = () => env().NEXT_PUBLIC_ENVIRONMENT === "paper";
