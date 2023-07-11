import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

import { env } from "~/env.mjs";
import { EventEmitter } from "stream";

import { Device } from "@twilio/voice-sdk";
import TwilioSDK from "twilio";

const t: boolean = env.TWILIO_USE_TEST_CREDENTIALS === "true";
const accountSid = t ? env.TWILIO_SID_TEST_CREDENTIALS : env.TWILIO_SID;
const authToken = t
  ? env.TWILIO_AUTH_TOKEN_TEST_CREDENTIALS
  : env.TWILIO_AUTH_TOKEN;
const fromPhoneNumber = t
  ? env.TWILIO_NUMBER_TEST_CREDENTIALS
  : env.TWILIO_NUMBER;

const client = TwilioSDK(accountSid, authToken);

const createTwilioCall = async (number: string) => {
  const webhookURL =
    env.NODE_ENV === "production"
      ? env.TWILIO_WEBHOOK_URL
      : env.TWILIO_WEBHOOK_SERVEO_URL;

  const data = await client.calls.create({
    url: `https://handler.twilio.com/twiml/EH2494992acb1672294953af3c9d04e282`, // Replace with your webhook URL
    // statusCallback: `https://${webhookURL}/api/callback`, // Replace with your webhook URL
    to: number, // Replace with the recipient's phone number
    from: fromPhoneNumber, // Replace with your Twilio phone number
    applicationSid: "APdd2c123aa5c11634dbd37cf2e2825077",
  });

  return data;
};

export const phoneRouter = createTRPCRouter({
  call: publicProcedure
    .input(z.object({ number: z.string() }))
    .mutation(async ({ input }) => {
      if (input.number.length < 10) {
        return {
          success: false,
          error: "Invalid phone number",
        };
      }
      try {
        const data = await createTwilioCall(input.number);

        return {
          success: true,
          data: data,
        };
      } catch (e) {
        const error = e as Error;
        return {
          success: false,
          error: error.message,
        };
      }
    }),
  callLogs: publicProcedure
    .input(z.object({ number: z.string() }))
    .query(async ({ input }) => {
      if (env.TWILIO_USE_TEST_CREDENTIALS === "true") {
        return [];
      }
      return await client.calls.list({
        to: input.number,
        limit: 1,
      });
    }),
  text: publicProcedure
    .input(z.object({ number: z.string(), message: z.string() }))
    .mutation(async ({ input }) => {
      if (input.number.length < 10) {
        return {
          success: false,
          error: "Invalid phone number",
        };
      }
      try {
        const data = await client.messages.create({
          body: input.message,
          to: input.number, // Replace with your phone number
          from: fromPhoneNumber, // Replace with a Twilio number
        });

        return {
          success: true,
          data: data,
        };
      } catch (e) {
        const error = e as Error;
        return {
          success: false,
          error: error.message,
        };
      }
    }),
});
