import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.issues);
  process.exit(1);
}

const validated = parsed.data;

export const env = {
  port: validated.PORT,
  databaseUrl: validated.DATABASE_URL,
  jwtSecret: validated.JWT_SECRET,
  jwtRefreshSecret: validated.JWT_REFRESH_SECRET,
  bcryptSaltRounds: validated.BCRYPT_SALT_ROUNDS,
  nodeEnv: validated.NODE_ENV,
  clientUrl: validated.CLIENT_URL,
} as const;
