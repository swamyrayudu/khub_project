import { pgTable, text, timestamp, uuid, boolean, integer, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Sellers table
export const sellers = pgTable('sellers', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  shopOwnerName: varchar('shop_owner_name', { length: 255 }).notNull(),
  contact: varchar('contact', { length: 20 }).notNull(),
  gender: varchar('gender', { length: 50 }).notNull(),
  permanentAddress: text('permanent_address').notNull(),
  permanentAddressUrl: text('permanent_address_url').notNull(),
  idProofUrl: text('id_proof_url').notNull(),
  shopName: varchar('shop_name', { length: 255 }).notNull(),
  shopContactNumber: varchar('shop_contact_number', { length: 20 }).notNull(),
  address: text('address').notNull(),
  country: varchar('country', { length: 100 }).notNull(),
  countryCode: varchar('country_code', { length: 3 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  stateCode: varchar('state_code', { length: 10 }).notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  shopIdUrl: text('shop_id_url').notNull(),
  emailVerified: boolean('email_verified').default(false),
  verifiedAt: timestamp('verified_at'),
  status: varchar('status', { length: 20 }).default('pending'), // pending, approved, rejected
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Seller verification codes table (for email verification)
export const sellerVerificationCodes = pgTable('seller_verification_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const sellersRelations = relations(sellers, ({ many }) => ({
  verificationCodes: many(sellerVerificationCodes),
}));

export const sellerVerificationCodesRelations = relations(sellerVerificationCodes, ({ one }) => ({
  seller: one(sellers, {
    fields: [sellerVerificationCodes.email],
    references: [sellers.email],
  }),
}));

// Type exports
export type Seller = typeof sellers.$inferSelect;
export type NewSeller = typeof sellers.$inferInsert;
export type SellerVerificationCode = typeof sellerVerificationCodes.$inferSelect;
export type NewSellerVerificationCode = typeof sellerVerificationCodes.$inferInsert;
