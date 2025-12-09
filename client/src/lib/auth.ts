import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import { sellers } from "./db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      users: sellers,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  user: {
    additionalFields: {
      shopOwnerName: {
        type: "string",
        required: true,
      },
      contact: {
        type: "string",
        required: true,
      },
      gender: {
        type: "string",
        required: true,
      },
      permanentAddress: {
        type: "string",
        required: true,
      },
      permanentAddressUrl: {
        type: "string",
        required: true,
      },
      idProofUrl: {
        type: "string",
        required: true,
      },
      shopName: {
        type: "string",
        required: true,
      },
      shopContactNumber: {
        type: "string",
        required: true,
      },
      address: {
        type: "string",
        required: true,
      },
      country: {
        type: "string",
        required: true,
      },
      countryCode: {
        type: "string",
        required: true,
      },
      state: {
        type: "string",
        required: true,
      },
      stateCode: {
        type: "string",
        required: true,
      },
      city: {
        type: "string",
        required: true,
      },
      shopIdUrl: {
        type: "string",
        required: true,
      },
      emailVerified: {
        type: "boolean",
        required: false,
      },
      verifiedAt: {
        type: "date",
        required: false,
      },
      status: {
        type: "string",
        required: false,
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = Session['user'];

