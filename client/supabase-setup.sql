-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  shop_owner_name VARCHAR(255) NOT NULL,
  contact VARCHAR(20) NOT NULL,
  gender VARCHAR(50) NOT NULL,
  permanent_address TEXT NOT NULL,
  permanent_address_url TEXT NOT NULL,
  id_proof_url TEXT NOT NULL,
  shop_name VARCHAR(255) NOT NULL,
  shop_contact_number VARCHAR(20) NOT NULL,
  address TEXT NOT NULL,
  country VARCHAR(100) NOT NULL,
  country_code VARCHAR(3) NOT NULL,
  state VARCHAR(100) NOT NULL,
  state_code VARCHAR(10) NOT NULL,
  city VARCHAR(100) NOT NULL,
  shop_id_url TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create seller verification codes table
CREATE TABLE IF NOT EXISTS seller_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'Admin',
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- ✅ Create products table with offer_price and images
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '' NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  offer_price NUMERIC(10,2) DEFAULT 0 NOT NULL,
  quantity INTEGER DEFAULT 0 NOT NULL,
  category VARCHAR(100) DEFAULT '' NOT NULL,
  brand VARCHAR(100) DEFAULT '' NOT NULL,
  sku VARCHAR(100) UNIQUE,
  status VARCHAR(20) DEFAULT 'active' NOT NULL,
  images JSONB DEFAULT '[]' NOT NULL,
  weight NUMERIC(8,2) DEFAULT 0 NOT NULL,
  dimensions VARCHAR(100) DEFAULT '' NOT NULL,
  tags JSONB DEFAULT '[]' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_offer_price ON products(offer_price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Insert default admin user
INSERT INTO admin_users (email, password, name) 
VALUES ('localhunt.team2@gmail.com', 'Swamy@72888', 'Admin Team')
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  updated_at = NOW();
