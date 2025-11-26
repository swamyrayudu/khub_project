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

// ✅ Updated Products table with Google Maps fields
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerId: uuid('seller_id').notNull().references(() => sellers.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').default('').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  offerPrice: numeric('offer_price', { precision: 10, scale: 2 }).default('0').notNull(),
  quantity: integer('quantity').default(0).notNull(),
  category: varchar('category', { length: 100 }).default('').notNull(),
  brand: varchar('brand', { length: 100 }).default('').notNull(),
  sku: varchar('sku', { length: 100 }).unique(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  images: json('images').$type<string[]>().default([]).notNull(),
  weight: numeric('weight', { precision: 8, scale: 2 }).default('0').notNull(),
  dimensions: varchar('dimensions', { length: 100 }).default('').notNull(),
  tags: json('tags').$type<string[]>().default([]).notNull(),
  // ✅ NEW: Google Maps fields
  googleMapsUrl: text('google_maps_url').default('').notNull(),
  latitude: numeric('latitude', { precision: 10, scale: 8 }),
  longitude: numeric('longitude', { precision: 11, scale: 8 }),
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

// Contacts table
export const contacts = pgTable('contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  sellerEmail: varchar('seller_email', { length: 255 }).notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table for user-seller communication
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  sellerId: uuid('seller_id').notNull().references(() => sellers.id, { onDelete: 'cascade' }),
  senderType: varchar('sender_type', { length: 20 }).notNull(), // 'user' or 'seller'
  message: text('message').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notifications table for both users and sellers
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipientId: uuid('recipient_id').notNull(), // user_id or seller_id
  recipientType: varchar('recipient_type', { length: 20 }).notNull(), // 'user' or 'seller'
  type: varchar('type', { length: 50 }).notNull(), // 'message', 'order', 'product', etc.
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  relatedId: uuid('related_id'), // message_id, order_id, etc.
  relatedType: varchar('related_type', { length: 50 }), // 'message', 'order', etc.
  isRead: boolean('is_read').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Users table (OAuth)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  provider: varchar('provider', { length: 50 }).default('google'),
  providerId: varchar('provider_id', { length: 255 }),
  // Location fields
  country: varchar('country', { length: 100 }),
  countryCode: varchar('country_code', { length: 3 }),
  state: varchar('state', { length: 100 }),
  stateCode: varchar('state_code', { length: 10 }),
  city: varchar('city', { length: 100 }),
  address: text('address'),
  hasCompletedProfile: boolean('has_completed_profile').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Accounts table
export const accounts = pgTable('accounts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
  refresh_token: text('refresh_token'),
  access_token: text('access_token'),
  expires_at: integer('expires_at'),
  token_type: varchar('token_type', { length: 50 }),
  scope: text('scope'),
  id_token: text('id_token'),
  session_state: text('session_state'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sessions table
export const sessions = pgTable('sessions', {
  sessionToken: varchar('session_token', { length: 255 }).primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Verification tokens
export const verificationTokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires: timestamp('expires').notNull(),
});

// Wishlist table
export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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

export const contactsRelations = relations(contacts, ({ one }) => ({
  seller: one(sellers, {
    fields: [contacts.sellerEmail],
    references: [sellers.email],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

// Type exports
export type Contact = typeof contacts.$inferSelect;
export type NewContact = typeof contacts.$inferInsert;
export type Seller = typeof sellers.$inferSelect;
export type NewSeller = typeof sellers.$inferInsert;
export type SellerVerificationCode = typeof sellerVerificationCodes.$inferSelect;
export type NewSellerVerificationCode = typeof sellerVerificationCodes.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type Wishlist = typeof wishlists.$inferSelect;
export type NewWishlist = typeof wishlists.$inferInsert;
