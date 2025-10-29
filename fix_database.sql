-- Fix database schema conflicts
-- Run this directly in Supabase SQL Editor

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create types safely
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'processing', 'shipped', 
    'delivered', 'cancelled', 'refunded', 'pending_payment_verification'
  );
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Type order_status already exists, skipping';
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'pending', 'completed', 'failed', 'refunded', 'pending_verification'
  );
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Type payment_status already exists, skipping';
END $$;

DO $$ BEGIN
  CREATE TYPE product_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Type product_status already exists, skipping';
END $$;

DO $$ BEGIN
  CREATE TYPE address_type AS ENUM ('home', 'work', 'other');
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Type address_type already exists, skipping';
END $$;

-- Create tables safely
CREATE TABLE IF NOT EXISTS categories (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id BIGINT REFERENCES categories(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  author VARCHAR(255),
  isbn VARCHAR(20) UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category_id BIGINT REFERENCES categories(id),
  image_url TEXT,
  status product_status DEFAULT 'draft',
  stock_quantity INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT 'Database schema synchronized successfully!' as result;