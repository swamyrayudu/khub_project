import { pgTable, text, timestamp, uuid, boolean, integer, varchar, numeric, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Sellers table (unchanged)
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
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ✅ Updated Products table with offer_price and images
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').notNull().references(() => sellers.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').default('').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  offerPrice: numeric('offer_price', { precision: 10, scale: 2 }).default('0').notNull(), // ✅ Added offer price
  quantity: integer('quantity').default(0).notNull(),
  category: varchar('category', { length: 100 }).default('').notNull(),
  brand: varchar('brand', { length: 100 }).default('').notNull(),
  sku: varchar('sku', { length: 100 }).unique(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  images: json('images').$type<string[]>().default([]).notNull(), // ✅ Images array
  weight: numeric('weight', { precision: 8, scale: 2 }).default('0').notNull(),
  dimensions: varchar('dimensions', { length: 100 }).default('').notNull(),
  tags: json('tags').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Seller verification codes table (unchanged)
export const sellerVerificationCodes = pgTable('seller_verification_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  code: varchar('code', { length: 6 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  used: boolean('used').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Admin users table (unchanged)
export const adminUsers = pgTable('admin_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull().default('Admin'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relations
export const sellersRelations = relations(sellers, ({ many }) => ({
  verificationCodes: many(sellerVerificationCodes),
  products: many(products),
}));

export const sellerVerificationCodesRelations = relations(sellerVerificationCodes, ({ one }) => ({
  seller: one(sellers, {
    fields: [sellerVerificationCodes.email],
    references: [sellers.email],
  }),
}));

export const productsRelations = relations(products, ({ one }) => ({
  seller: one(sellers, {
    fields: [products.sellerId],
    references: [sellers.id],
  }),
}));

// Type exports
export type Seller = typeof sellers.$inferSelect;
export type NewSeller = typeof sellers.$inferInsert;
export type SellerVerificationCode = typeof sellerVerificationCodes.$inferSelect;
export type NewSellerVerificationCode = typeof sellerVerificationCodes.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
