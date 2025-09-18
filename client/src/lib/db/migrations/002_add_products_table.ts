
import { db } from '../index';

export async function addProductsTable() {
  try {
    console.log('🔄 Adding products table with offer_price...');

    // Create products table with offer_price and images
    await db.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        price NUMERIC(10,2) NOT NULL,
        offer_price NUMERIC(10,2) NOT NULL DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 0,
        category VARCHAR(100) NOT NULL DEFAULT '',
        brand VARCHAR(100) NOT NULL DEFAULT '',
        sku VARCHAR(100) UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        images JSONB NOT NULL DEFAULT '[]',
        weight NUMERIC(8,2) NOT NULL DEFAULT 0,
        dimensions VARCHAR(100) NOT NULL DEFAULT '',
        tags JSONB NOT NULL DEFAULT '[]',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Add constraints
    await db.execute(`
      ALTER TABLE products 
      ADD CONSTRAINT IF NOT EXISTS chk_price_positive CHECK (price > 0),
      ADD CONSTRAINT IF NOT EXISTS chk_offer_price_non_negative CHECK (offer_price >= 0),
      ADD CONSTRAINT IF NOT EXISTS chk_offer_less_than_price CHECK (offer_price <= price);
    `);

    // Create indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
      CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
      CREATE INDEX IF NOT EXISTS idx_products_offer_price ON products(offer_price);
    `);

    console.log('✅ Products table migration completed!');
  } catch (error) {
    console.error('❌ Products table migration failed:', error);
    throw error;
  }
}
