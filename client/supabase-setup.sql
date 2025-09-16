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
-- Run these SQL commands in your Supabase SQL editor
CREATE TABLE IF NOT EXISTS sellers (
  -- your existing schema
);

CREATE TABLE IF NOT EXISTS seller_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);


INSERT INTO admin_users (email, password, name) 
VALUES ('localhunt.team2@gmail.com', 'Swamy@72888', 'Admin Team')
ON CONFLICT (email) 
DO UPDATE SET 
  password = EXCLUDED.password,
  updated_at = NOW();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
