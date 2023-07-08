import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // DATABASE_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]),
    TWILIO_SID: z.string().min(1),
    TWILIO_AUTH_TOKEN: z.string().min(1),
    TWILIO_NUMBER: z.string().min(10),
    TWILIO_WEBHOOK_URL: z.string().min(1),
    TWILIO_USE_TEST_CREDENTIALS: z.string().min(4).max(5),
    TWILIO_SID_TEST_CREDENTIALS: z.string().min(1),
    TWILIO_AUTH_TOKEN_TEST_CREDENTIALS: z.string().min(1),
    TWILIO_NUMBER_TEST_CREDENTIALS: z.string().min(10),
    TWILIO_WEBHOOK_SERVEO_URL: z.string().min(1),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    TWILIO_SID: process.env.TWILIO_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_NUMBER: process.env.TWILIO_NUMBER,
    TWILIO_WEBHOOK_URL: process.env.TWILIO_WEBHOOK_URL,

    TWILIO_USE_TEST_CREDENTIALS: process.env.TWILIO_USE_TEST_CREDENTIALS,
    TWILIO_SID_TEST_CREDENTIALS: process.env.TWILIO_SID_TEST_CREDENTIALS,
    TWILIO_AUTH_TOKEN_TEST_CREDENTIALS:
      process.env.TWILIO_AUTH_TOKEN_TEST_CREDENTIALS,
    TWILIO_NUMBER_TEST_CREDENTIALS: process.env.TWILIO_NUMBER_TEST_CREDENTIALS,
    TWILIO_WEBHOOK_SERVEO_URL: process.env.TWILIO_WEBHOOK_SERVEO_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
